const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const artistId = parseInt(process.argv[2], 10);
const coverImagePath = process.argv[3];
const albumTitle = process.argv.slice(4).join(' ');

if (!artistId || isNaN(artistId) || !coverImagePath || !albumTitle) {
  console.error("Erro: Argumentos incompletos ou invalidos.");
  console.log('Uso correto: node AddAlbum.js <ID_DO_ARTISTA> <CAMINHO_DA_IMAGEM> <NOME_DO_ALBUM>');
  console.log('Exemplo: node AddAlbum.js 1 "imagens/capa.jpg" Hybrid Theory');
  process.exit(1); 
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), 
  port: process.env.DB_PORT,
});

async function addAlbum() {
  const releaseDate = null; 

  try {
    const query = `
      INSERT INTO albums (artist_id, title, release_date, cover_image_path) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, title, cover_image_path;
    `;
    const values = [artistId, albumTitle, releaseDate, coverImagePath];

    const result = await pool.query(query, values);
    
    console.log('Sucesso. Album criado no banco:');
    console.table(result.rows[0]);

  } catch (err) {
    if (err.code === '23503') { 
      console.error(`Erro: O Artista com ID ${artistId} nao existe no banco.`);
    } else {
      console.error('Erro no banco de dados:', err.message);
    }
  } finally {
    await pool.end();
  }
}

addAlbum();