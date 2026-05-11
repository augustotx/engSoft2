const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


const songId = parseInt(process.argv[2], 10);

// Validação simples
if (!songId || isNaN(songId)) {
  console.error("Erro: ID da música não informado ou inválido.");
  console.log('Uso correto: node RemoveMusica.js <SONG_ID>');
  console.log('Exemplo: node RemoveMusica.js 2');
  process.exit(1); 
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function removeMusica() {
  try {
    const sql = `
      DELETE FROM songs 
      WHERE id = $1 
      RETURNING id, title, file_path;
    `;
    
    const valores = [songId];

    const res = await pool.query(sql, valores);
    
    if (res.rowCount === 0) {
      console.log(`Nenhuma música encontrada com o ID ${songId}. Nenhuma alteração feita.`);
    } else {
      console.log('Sucesso. Música removida do banco com sucesso:');
      console.table(res.rows[0]);
    }
    
  } catch (err) {
    console.error('Erro no banco de dados:', err.message);
  } finally {
    await pool.end();
  }
}

removeMusica();