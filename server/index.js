const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ---- Santé ----
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connectée" });
  } catch (err) {
    res.status(500).json({ ok: false, erreur: err.message });
  }
});

// ---- Produits ----
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE actif = true ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  const { slug, nom, emoji, photo, prix, unite, stock, seuil_alerte } = req.body;
  if (!slug || !nom || !prix || !unite) {
    return res.status(400).json({ erreur: "slug, nom, prix et unite sont requis" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (slug, nom, emoji, photo, prix, unite, stock, seuil_alerte)
       VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,0),COALESCE($8,10))
       RETURNING *`,
      [slug, nom, emoji || null, photo || null, prix, unite, stock, seuil_alerte]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.patch("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const champs = ["nom", "emoji", "photo", "prix", "unite", "stock", "seuil_alerte", "actif"];
  const updates = [];
  const values = [];
  let i = 1;
  for (const champ of champs) {
    if (req.body[champ] !== undefined) {
      updates.push(`${champ} = $${i++}`);
      values.push(req.body[champ]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ erreur: "Aucun champ à mettre à jour" });
  values.push(id);
  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ erreur: "Produit introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Clients ----
app.get("/api/customers", async (req, res) => {
  const { telephone } = req.query;
  try {
    if (telephone) {
      const { rows } = await pool.query("SELECT * FROM customers WHERE telephone = $1", [telephone]);
      return res.json(rows[0] || null);
    }
    const { rows } = await pool.query("SELECT * FROM customers ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/api/customers", async (req, res) => {
  const { telephone, commerce, type_activite, adresse_label, adresse_detail } = req.body;
  if (!telephone) return res.status(400).json({ erreur: "telephone requis" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO customers (telephone, commerce, type_activite, adresse_label, adresse_detail)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (telephone) DO UPDATE SET
         commerce = COALESCE(EXCLUDED.commerce, customers.commerce),
         type_activite = COALESCE(EXCLUDED.type_activite, customers.type_activite),
         adresse_label = COALESCE(EXCLUDED.adresse_label, customers.adresse_label),
         adresse_detail = COALESCE(EXCLUDED.adresse_detail, customers.adresse_detail)
       RETURNING *`,
      [telephone, commerce || null, type_activite || null, adresse_label || null, adresse_detail || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Commandes ----
app.get("/api/orders", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, c.commerce AS client_nom, c.telephone AS client_telephone
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.commerce AS client_nom, c.telephone AS client_telephone
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erreur: "Commande introuvable" });
    const { rows: items } = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [req.params.id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Créer une commande : { telephone, items:[{product_id, quantite}], adresse_label, adresse_detail, zone, moyen_paiement }
app.post("/api/orders", async (req, res) => {
  const { telephone, items, adresse_label, adresse_detail, zone, moyen_paiement } = req.body;
  if (!telephone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ erreur: "telephone et items (non vide) sont requis" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Client : on le crée s'il n'existe pas encore
    const customerResult = await client.query(
      `INSERT INTO customers (telephone, adresse_label, adresse_detail)
       VALUES ($1,$2,$3)
       ON CONFLICT (telephone) DO UPDATE SET
         adresse_label = COALESCE(EXCLUDED.adresse_label, customers.adresse_label),
         adresse_detail = COALESCE(EXCLUDED.adresse_detail, customers.adresse_detail)
       RETURNING id`,
      [telephone, adresse_label || null, adresse_detail || null]
    );
    const customerId = customerResult.rows[0].id;

    // Vérifier le stock et calculer les prix à partir de la base (jamais du client)
    let sousTotal = 0;
    const lignes = [];
    for (const it of items) {
      const { rows: prodRows } = await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [it.product_id]);
      if (prodRows.length === 0) throw new Error(`Produit ${it.product_id} introuvable`);
      const produit = prodRows[0];
      if (produit.stock < it.quantite) throw new Error(`Stock insuffisant pour ${produit.nom}`);
      sousTotal += produit.prix * it.quantite;
      lignes.push({ produit, quantite: it.quantite });
    }

    const fraisLivraison = sousTotal > 0 ? 1000 : 0;
    const total = sousTotal + fraisLivraison;

    // Numéro de commande séquentiel simple basé sur l'id (généré après insertion)
    const orderResult = await client.query(
      `INSERT INTO orders (numero, customer_id, zone, adresse_label, adresse_detail, sous_total, frais_livraison, total, moyen_paiement, statut, statut_paiement)
       VALUES ('TEMP', $1,$2,$3,$4,$5,$6,$7,'En attente','En attente')
       RETURNING id`,
      [customerId, zone || null, adresse_label || null, adresse_detail || null, sousTotal, fraisLivraison, total, moyen_paiement || null]
    );
    const orderId = orderResult.rows[0].id;
    const numero = `CMD-${1000 + orderId}`;
    await client.query("UPDATE orders SET numero = $1 WHERE id = $2", [numero, orderId]);

    for (const ligne of lignes) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, nom, quantite, prix_unitaire) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, ligne.produit.id, ligne.produit.nom, ligne.quantite, ligne.produit.prix]
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [ligne.quantite, ligne.produit.id]);
    }

    await client.query("COMMIT");
    res.status(201).json({ id: orderId, numero, sous_total: sousTotal, frais_livraison: fraisLivraison, total });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ erreur: err.message });
  } finally {
    client.release();
  }
});

// Mettre à jour le statut d'une commande (back-office) : { statut, statut_paiement, reference_paiement }
app.patch("/api/orders/:id", async (req, res) => {
  const champs = ["statut", "statut_paiement", "reference_paiement"];
  const updates = [];
  const values = [];
  let i = 1;
  for (const champ of champs) {
    if (req.body[champ] !== undefined) {
      updates.push(`${champ} = $${i++}`);
      values.push(req.body[champ]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ erreur: "Aucun champ à mettre à jour" });
  values.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ erreur: "Commande introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`API MON MARCHE FERMIER en écoute sur le port ${PORT}`);
});
