const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const albumId = parseInt(process.argv[2], 10);
const artistId = parseInt(process.argv[3], 10);
const trackNumber = parseInt(process.argv[4], 10);
const filePath = process.argv[5];
const title = process.argv.slice(6).join(' ');

if (!albumId || isNaN(albumId) || !artistId || isNaN(artistId) || !trackNumber || isNaN(trackNumber) || !filePath || !title) {
  console.error("Erro: Argumentos incompletos ou invalidos.");
  console.log('Uso correto: node AddMusica.js <ALBUM_ID> <ARTIST_ID> <TRACK_NUMBER> "<FILE_PATH>" <TITULO_DA_MUSICA>');
  console.log('Exemplo: node AddMusica.js 1 1 1 "musicas/2-01. AWE OF SHE.mp3" AWE OF SHE Dizzy Theme');
  process.exit(1); 
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function addMusica() {
  try {
    const sql = `
      INSERT INTO songs (album_id, artist_id, title, track_number, file_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, track_number;
    `;
    
    const valores = [albumId, artistId, title, trackNumber, filePath];

    const res = await pool.query(sql, valores);
    
    console.log('Sucesso. Musica inserida no banco:');
    console.table(res.rows[0]);
    
  } catch (err) {
    if (err.code === '23503') {
      console.error(`Erro: Album ID ${albumId} ou Artista ID ${artistId} nao existem no banco.`);
    } else {
      console.error('Erro no banco de dados:', err.message);
    }
  } finally {
    await pool.end();
  }
}

addMusica();