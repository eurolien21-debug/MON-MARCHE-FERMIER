const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "ERREUR : la variable DATABASE_URL n'est pas définie. " +
    "Sur Railway, ajoutez une référence vers la base Postgres dans les Variables du service."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = { pool };
