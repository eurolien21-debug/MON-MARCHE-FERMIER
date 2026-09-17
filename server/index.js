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
    const { numero, disponibles, livreur_telephone } = req.query;

    if (numero) {
      const { rows } = await pool.query(
        `SELECT o.*, c.commerce AS client_nom, c.telephone AS client_telephone
         FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
         WHERE o.numero = $1`,
        [numero]
      );
      return res.json(rows[0] || null);
    }

    if (disponibles) {
      // Commandes pas encore prises en charge par un livreur : celles que
      // l'app livreur doit proposer (façon "notification" de nouvelle course).
      const { rows } = await pool.query(`
        SELECT o.*, c.commerce AS client_nom, c.telephone AS client_telephone
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.livreur_nom IS NULL AND o.statut NOT IN ('Livrée', 'Annulée')
        ORDER BY o.created_at ASC
      `);
      return res.json(rows);
    }

    if (livreur_telephone) {
      // Récapitulatif des livraisons d'un livreur : en cours, effectuées, annulées.
      const { rows } = await pool.query(
        `SELECT o.*, c.commerce AS client_nom, c.telephone AS client_telephone
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customer_id
         WHERE o.livreur_telephone = $1
         ORDER BY o.created_at DESC`,
        [livreur_telephone]
      );
      return res.json(rows);
    }

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

// Le livreur accepte/valide une course — c'est ce qui « démarre » officiellement
// la livraison (avant ça, personne n'est encore affecté à la commande).
app.patch("/api/orders/:id/accepter", async (req, res) => {
  const { livreur_nom, livreur_telephone } = req.body;
  if (!livreur_nom) return res.status(400).json({ erreur: "livreur_nom requis" });
  try {
    const { rows } = await pool.query(
      `UPDATE orders
       SET livreur_nom = $1, livreur_telephone = $2,
           statut = CASE WHEN statut IN ('Livrée', 'Annulée') THEN statut ELSE 'Livreur affecté' END
       WHERE id = $3 AND livreur_nom IS NULL
       RETURNING *`,
      [livreur_nom, livreur_telephone || null, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(409).json({ erreur: "Cette commande a déjà été prise en charge par un autre livreur, ou n'existe pas." });
    }
    await pool.query(
      `INSERT INTO order_events (order_id, evenement, details) VALUES ($1, 'Livreur affecté', $2)`,
      [req.params.id, `${livreur_nom}${livreur_telephone ? " — " + livreur_telephone : ""}`]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Mise à jour de la position GPS réelle du livreur (appelée en continu depuis l'app livreur)
app.patch("/api/orders/:id/position", async (req, res) => {
  const { lat, lng, livreur_nom } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ erreur: "lat et lng (nombres) sont requis" });
  }
  try {
    const { rows: avant } = await pool.query("SELECT statut FROM orders WHERE id = $1", [req.params.id]);
    const statutAvant = avant[0]?.statut;

    const { rows } = await pool.query(
      `UPDATE orders
       SET livreur_lat = $1, livreur_lng = $2, livreur_nom = COALESCE($3, livreur_nom), position_maj_a = now(),
           statut = CASE WHEN statut IN ('Livrée', 'Annulée') THEN statut ELSE 'Livreur en route' END
       WHERE id = $4
       RETURNING *`,
      [lat, lng, livreur_nom || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erreur: "Commande introuvable" });

    if (statutAvant && statutAvant !== "Livreur en route" && rows[0].statut === "Livreur en route") {
      await pool.query(
        `INSERT INTO order_events (order_id, evenement, details) VALUES ($1, 'Livraison en cours', 'Le livreur a démarré le trajet')`,
        [req.params.id]
      );
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Créer une commande : { telephone, items:[{product_id, quantite}], adresse_label, adresse_detail,
//                        adresse_lat, adresse_lng (position GPS réelle de livraison), zone, moyen_paiement }
app.post("/api/orders", async (req, res) => {
  const { telephone, items, adresse_label, adresse_detail, adresse_lat, adresse_lng, zone, moyen_paiement } = req.body;
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
      `INSERT INTO orders (numero, customer_id, zone, adresse_label, adresse_detail, client_lat, client_lng, sous_total, frais_livraison, total, moyen_paiement, statut, statut_paiement)
       VALUES ('TEMP', $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'En attente','En attente')
       RETURNING id`,
      [customerId, zone || null, adresse_label || null, adresse_detail || null, adresse_lat ?? null, adresse_lng ?? null, sousTotal, fraisLivraison, total, moyen_paiement || null]
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

    await client.query(
      `INSERT INTO order_events (order_id, evenement, details) VALUES ($1, 'Commande passée', $2)`,
      [orderId, `Client ${telephone} — livraison à ${adresse_label || "adresse non précisée"}${adresse_detail ? ", " + adresse_detail : ""}`]
    );

    await client.query("COMMIT");
    res.status(201).json({ id: orderId, numero, sous_total: sousTotal, frais_livraison: fraisLivraison, total });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ erreur: err.message });
  } finally {
    client.release();
  }
});

// Mettre à jour le statut d'une commande (back-office, ou "Marquer comme livrée" côté livreur) :
// { statut, statut_paiement, reference_paiement }
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
    if (req.body.statut !== undefined) {
      await pool.query(
        `INSERT INTO order_events (order_id, evenement, details) VALUES ($1, $2, NULL)`,
        [req.params.id, req.body.statut === "Livrée" ? "Colis reçu" : req.body.statut]
      );
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Historique complet d'une commande — pour le suivi dans le back-office.
app.get("/api/orders/:id/evenements", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM order_events WHERE order_id = $1 ORDER BY cree_a ASC",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Zones de livraison (page Livraisons du back-office) ----
app.get("/api/zones", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM zones_livraison ORDER BY zone ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/api/zones", async (req, res) => {
  const { zone, prix, distance, temps_estime, livraison_gratuite_des } = req.body;
  if (!zone || prix == null) return res.status(400).json({ erreur: "zone et prix sont requis" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO zones_livraison (zone, prix, distance, temps_estime, livraison_gratuite_des)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [zone, prix, distance || null, temps_estime || null, livraison_gratuite_des || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.patch("/api/zones/:id", async (req, res) => {
  const champs = ["zone", "prix", "distance", "temps_estime", "livraison_gratuite_des"];
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
    const { rows } = await pool.query(`UPDATE zones_livraison SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`, values);
    if (rows.length === 0) return res.status(404).json({ erreur: "Zone introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.delete("/api/zones/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM zones_livraison WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ erreur: "Zone introuvable" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Livreurs réels (déduits des commandes qu'ils ont livrées/acceptées) ----
app.get("/api/livreurs", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (livreur_telephone)
        livreur_nom, livreur_telephone, statut AS derniere_commande_statut, numero AS derniere_commande_numero,
        (SELECT COUNT(*) FROM orders o2 WHERE o2.livreur_telephone = o.livreur_telephone
           AND o2.statut = 'Livrée' AND o2.created_at::date = CURRENT_DATE) AS livraisons_jour,
        EXISTS (
          SELECT 1 FROM orders o3 WHERE o3.livreur_telephone = o.livreur_telephone
            AND o3.statut NOT IN ('Livrée', 'Annulée')
        ) AS en_livraison
      FROM orders o
      WHERE livreur_telephone IS NOT NULL
      ORDER BY livreur_telephone, created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Finance : indicateurs réels calculés à partir des vraies commandes ----
app.get("/api/finance/kpis", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(total) FILTER (WHERE statut <> 'Annulée'), 0) AS chiffre_affaires,
        COALESCE(SUM(total) FILTER (WHERE statut_paiement = 'Payé'), 0) AS encaisse,
        COALESCE(SUM(total) FILTER (WHERE statut_paiement = 'Remboursé'), 0) AS rembourse,
        COALESCE(SUM(frais_livraison) FILTER (WHERE statut <> 'Annulée'), 0) AS frais_livraison,
        COUNT(*) FILTER (WHERE statut = 'Livrée') AS commandes_livrees,
        COUNT(*) AS commandes_total
      FROM orders
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Rapports : agrégations réelles ----
app.get("/api/rapports/ventes-produits", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT oi.nom AS produit, SUM(oi.quantite * oi.prix_unitaire) AS ventes
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.statut <> 'Annulée'
      GROUP BY oi.nom
      ORDER BY ventes DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.get("/api/rapports/clients-mois", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT to_char(created_at, 'YYYY-MM') AS mois, COUNT(*) AS nouveaux
      FROM customers
      GROUP BY mois
      ORDER BY mois ASC
      LIMIT 12
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.get("/api/rapports/perf-livreurs", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        o.livreur_nom,
        COUNT(*) FILTER (WHERE o.statut = 'Livrée') AS livraisons,
        ROUND(AVG(EXTRACT(EPOCH FROM (livre.cree_a - route.cree_a)) / 60) FILTER (WHERE livre.cree_a IS NOT NULL AND route.cree_a IS NOT NULL)) AS temps_moyen_minutes
      FROM orders o
      LEFT JOIN order_events route ON route.order_id = o.id AND route.evenement = 'Livraison en cours'
      LEFT JOIN order_events livre ON livre.order_id = o.id AND livre.evenement = 'Colis reçu'
      WHERE o.livreur_nom IS NOT NULL
      GROUP BY o.livreur_nom
      ORDER BY livraisons DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Répertoire de l'équipe interne (page Utilisateurs & Rôles) ----
app.get("/api/staff", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM staff_users ORDER BY cree_a ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.post("/api/staff", async (req, res) => {
  const { nom, email, role } = req.body;
  if (!nom || !email) return res.status(400).json({ erreur: "nom et email sont requis" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO staff_users (nom, email, role) VALUES ($1,$2,COALESCE($3,'Commercial')) RETURNING *`,
      [nom, email, role || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.patch("/api/staff/:id", async (req, res) => {
  const champs = ["nom", "email", "role", "actif"];
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
    const { rows } = await pool.query(`UPDATE staff_users SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`, values);
    if (rows.length === 0) return res.status(404).json({ erreur: "Utilisateur introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.delete("/api/staff/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM staff_users WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ erreur: "Utilisateur introuvable" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// ---- Bons de commande fournisseurs (réapprovisionnement du stock) ----
app.get("/api/bons-commande", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT bc.*, COALESCE(SUM(i.quantite), 0) AS nb_articles,
             COALESCE(SUM(i.quantite * COALESCE(i.prix_unitaire, 0)), 0) AS montant_total
      FROM bons_commande bc
      LEFT JOIN bon_commande_items i ON i.bon_commande_id = bc.id
      GROUP BY bc.id
      ORDER BY bc.cree_a DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.get("/api/bons-commande/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM bons_commande WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erreur: "Bon de commande introuvable" });
    const { rows: items } = await pool.query("SELECT * FROM bon_commande_items WHERE bon_commande_id = $1", [req.params.id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Créer un bon de commande : { fournisseur, notes, items: [{product_id, quantite, prix_unitaire}] }
app.post("/api/bons-commande", async (req, res) => {
  const { fournisseur, notes, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ erreur: "items (non vide) est requis" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bcResult = await client.query(
      `INSERT INTO bons_commande (numero, fournisseur, notes, statut) VALUES ('TEMP', $1, $2, 'En attente') RETURNING id`,
      [fournisseur || null, notes || null]
    );
    const bcId = bcResult.rows[0].id;
    const numero = `BC-${1000 + bcId}`;
    await client.query("UPDATE bons_commande SET numero = $1 WHERE id = $2", [numero, bcId]);

    for (const it of items) {
      const { rows: prodRows } = await client.query("SELECT * FROM products WHERE id = $1", [it.product_id]);
      if (prodRows.length === 0) throw new Error(`Produit ${it.product_id} introuvable`);
      const produit = prodRows[0];
      await client.query(
        `INSERT INTO bon_commande_items (bon_commande_id, product_id, nom, quantite, prix_unitaire) VALUES ($1,$2,$3,$4,$5)`,
        [bcId, produit.id, produit.nom, it.quantite, it.prix_unitaire || null]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ id: bcId, numero });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ erreur: err.message });
  } finally {
    client.release();
  }
});

// Changer le statut d'un bon de commande. Passer à 'Reçu' augmente réellement le stock.
app.patch("/api/bons-commande/:id", async (req, res) => {
  const { statut, fournisseur, notes } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: avant } = await client.query("SELECT * FROM bons_commande WHERE id = $1 FOR UPDATE", [req.params.id]);
    if (avant.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ erreur: "Bon de commande introuvable" }); }
    const bcAvant = avant[0];

    const updates = [];
    const values = [];
    let i = 1;
    if (statut !== undefined) { updates.push(`statut = $${i++}`); values.push(statut); }
    if (fournisseur !== undefined) { updates.push(`fournisseur = $${i++}`); values.push(fournisseur); }
    if (notes !== undefined) { updates.push(`notes = $${i++}`); values.push(notes); }
    if (statut === "Reçu" && bcAvant.statut !== "Reçu") { updates.push(`recu_a = now()`); }

    if (updates.length === 0) { await client.query("ROLLBACK"); return res.status(400).json({ erreur: "Aucun champ à mettre à jour" }); }
    values.push(req.params.id);
    const { rows } = await client.query(`UPDATE bons_commande SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`, values);

    // Réception : on augmente réellement le stock des produits concernés (une seule fois).
    if (statut === "Reçu" && bcAvant.statut !== "Reçu") {
      const { rows: items } = await client.query("SELECT * FROM bon_commande_items WHERE bon_commande_id = $1", [req.params.id]);
      for (const it of items) {
        if (it.product_id) {
          await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [it.quantite, it.product_id]);
        }
      }
    }

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ erreur: err.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`API MON MARCHE FERMIER en écoute sur le port ${PORT}`);
});
