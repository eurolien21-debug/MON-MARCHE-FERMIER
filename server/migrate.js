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
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_telephone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS livreur_lng DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS position_maj_a TIMESTAMPTZ;

-- Position GPS réelle du lieu de livraison (saisie côté client),
-- nécessaire pour calculer une distance/temps estimé réels.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_lat DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_lng DOUBLE PRECISION;

-- Historique complet de chaque commande (chaque étape horodatée),
-- consultable dans le back-office.
CREATE TABLE IF NOT EXISTS order_events (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  evenement TEXT NOT NULL,
  details TEXT,
  cree_a TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

-- Zones de livraison, gérées dans le back-office (Livraisons).
CREATE TABLE IF NOT EXISTS zones_livraison (
  id SERIAL PRIMARY KEY,
  zone TEXT UNIQUE NOT NULL,
  prix INTEGER NOT NULL DEFAULT 1000,
  distance TEXT,
  temps_estime TEXT,
  livraison_gratuite_des INTEGER,
  cree_a TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Répertoire de l'équipe interne (back-office), géré dans Utilisateurs & Rôles.
-- L'accès au back-office reste par mot de passe unique partagé pour l'instant ;
-- ceci est un vrai annuaire, pas encore un système de connexion individuel.
CREATE TABLE IF NOT EXISTS staff_users (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Commercial',
  actif BOOLEAN NOT NULL DEFAULT true,
  cree_a TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bons de commande fournisseurs, pour réapprovisionner le stock.
-- La réception (statut 'Reçu') augmente réellement le stock des produits.
CREATE TABLE IF NOT EXISTS bons_commande (
  id SERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  fournisseur TEXT,
  statut TEXT NOT NULL DEFAULT 'En attente',
  notes TEXT,
  cree_a TIMESTAMPTZ NOT NULL DEFAULT now(),
  recu_a TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bon_commande_items (
  id SERIAL PRIMARY KEY,
  bon_commande_id INTEGER NOT NULL REFERENCES bons_commande(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire INTEGER
);
CREATE INDEX IF NOT EXISTS idx_bon_commande_items_bon ON bon_commande_items(bon_commande_id);
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
