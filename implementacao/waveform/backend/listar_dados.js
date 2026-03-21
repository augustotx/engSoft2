const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'fei',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maindb',
  password: process.env.DB_PASSWORD || 'fei',
  port: process.env.DB_PORT || 5432,
});

async function listarTudo() {
  try {
    console.log('\n--- 💿 ÁLBUNS CADASTRADOS ---');
    const albuns = await pool.query('SELECT id, title, release_date FROM albums ORDER BY id');
    
    if (albuns.rows.length > 0) {
      console.table(albuns.rows);
    } else {
      console.log('⚠️ Nenhum álbum encontrado no banco.');
    }

    console.log('\n--- 🎵 MÚSICAS CADASTRADAS ---');
    // SQL CORRIGIDO ABAIXO:
    const musicas = await pool.query(`
      SELECT 
        s.id, 
        s.title AS musica, 
        a.title AS album, 
        s.track_number AS faixa,
        s.file_path
      FROM songs s
      JOIN albums a ON a.id = s.album_id
      ORDER BY a.id, s.track_number
    `);
    
    if (musicas.rows.length > 0) {
      console.table(musicas.rows);
    } else {
      console.log('⚠️ Nenhuma música encontrada.');
    }

  } catch (err) {
    console.error('❌ Erro ao consultar o banco:', err.message);
  } finally {
    await pool.end();
  }
}

listarTudo();