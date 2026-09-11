// Crée les tables si elles n'existent pas encore.
// Lancer une seule fois (ou à chaque déploiement, sans risque : IF NOT EXISTS).
const { pool } = require("./db");

const SQL = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  emoji TEXT,
  photo TEXT,
  prix INTEGER NOT NULL,
  unite TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER NOT NULL DEFAULT 10,
  actif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  telephone TEXT UNIQUE NOT NULL,
  commerce TEXT,
  type_activite TEXT,
  adresse_label TEXT,
  adresse_detail TEXT,
  segment TEXT NOT NULL DEFAULT 'Bronze',
  credit_plafond INTEGER NOT NULL DEFAULT 0,
  credit_utilise INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  statut TEXT NOT NULL DEFAULT 'En attente',
  zone TEXT,
  adresse_label TEXT,
  adresse_detail TEXT,
  sous_total INTEGER NOT NULL DEFAULT 0,
  frais_livraison INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  moyen_paiement TEXT,
  reference_paiement TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'En attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Position GPS réelle du livreur, mise à jour depuis l'app livreur.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_nom TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_lng DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS position_maj_a TIMESTAMPTZ;
`;

async function migrate() {
  try {
    await pool.query(SQL);
    console.log("Migration terminée : tables prêtes.");
  } catch (err) {
    console.error("Échec de la migration :", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
