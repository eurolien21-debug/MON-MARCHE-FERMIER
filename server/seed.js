// Insère les produits de départ si la table est vide.
// Peut être relancé sans danger (ON CONFLICT DO NOTHING).
const { pool } = require("./db");

const PRODUITS = [
  { slug: "poulet", nom: "Poulet de chair", emoji: "🐔", photo: "https://loremflickr.com/300/300/raw,chicken", prix: 3500, unite: "unité", stock: 120, seuil_alerte: 30 },
  { slug: "oeufs", nom: "Œufs", emoji: "🥚", photo: "https://loremflickr.com/300/300/eggs,tray", prix: 2200, unite: "plateau", stock: 40, seuil_alerte: 20 },
  { slug: "cuisses", nom: "Cuisses", emoji: "🍗", photo: "https://loremflickr.com/300/300/chicken,thighs", prix: 2800, unite: "kg", stock: 80, seuil_alerte: 25 },
  { slug: "pilons", nom: "Pilons", emoji: "🍗", photo: "https://loremflickr.com/300/300/chicken,drumstick", prix: 2600, unite: "kg", stock: 60, seuil_alerte: 20 },
  { slug: "poisson", nom: "Poisson", emoji: "🐟", photo: "https://loremflickr.com/300/300/fresh,fish", prix: 3000, unite: "kg", stock: 50, seuil_alerte: 15 },
  { slug: "brochette", nom: "Brochettes", emoji: "🍢", photo: "https://loremflickr.com/300/300/chicken,skewer", prix: 500, unite: "unité", stock: 200, seuil_alerte: 40 },
];

async function seed() {
  try {
    for (const p of PRODUITS) {
      await pool.query(
        `INSERT INTO products (slug, nom, emoji, photo, prix, unite, stock, seuil_alerte)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (slug) DO NOTHING`,
        [p.slug, p.nom, p.emoji, p.photo, p.prix, p.unite, p.stock, p.seuil_alerte]
      );
    }
    console.log("Produits de départ insérés (ou déjà présents).");
  } catch (err) {
    console.error("Échec du seed :", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
