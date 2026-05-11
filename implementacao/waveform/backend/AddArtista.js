const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const artistName = process.argv[2];
const email = process.argv[3];
const username = process.argv[4] || null; 

if (!artistName || !email) {
  console.error("Erro: Nome do artista ou e-mail não informados.");
  console.log('Uso correto: node AddArtista.js "NOME DO ARTISTA" "email@artista.com" "username_opcional"');
  console.log('Exemplo: node AddArtista.js "Naoki" "naoki@guiltygear.com" "naoki_official"');
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
      INSERT INTO artists (name, email, username, status) 
      VALUES ($1, $2, $3, 'approved') 
      RETURNING id, name, email, username, status;
    `;
    const values = [artistName, email, username];

    const result = await pool.query(query, values);
    
    console.log('Sucesso. Artista criado e aprovado no banco:');
    console.table(result.rows[0]);

  } catch (err) {
    if (err.code === '23505') {
      console.error('Erro: O e-mail ou username informado já existe no banco de dados.');
    } else {
      console.error('Erro no banco de dados:', err.message);
    }
  } finally {
    await pool.end();
  }
}

addArtist();