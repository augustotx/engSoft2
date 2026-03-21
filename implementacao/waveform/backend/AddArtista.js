const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const artistName = process.argv.slice(2).join(' ');

if (!artistName) {
  console.error("Erro: Nome do artista nao informado.");
  console.log("Uso correto: node AddArtista.js <NOME_DO_ARTISTA>");
  process.exit(1); 
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), 
  port: process.env.DB_PORT,
});

async function addArtist() {
  try {
    const query = `
      INSERT INTO artists (name) 
      VALUES ($1) 
      RETURNING id, name;
    `;
    const values = [artistName];

    const result = await pool.query(query, values);
    
    console.log('Sucesso. Artista criado no banco:');
    console.table(result.rows[0]);

  } catch (err) {
    console.error('Erro no banco de dados:', err.message);
  } finally {
    await pool.end();
  }
}

addArtist();