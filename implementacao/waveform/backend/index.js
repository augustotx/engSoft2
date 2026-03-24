const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({origin: 'http://localhost:5173'})); // Adjust the origin as needed
app.use('/musicas', express.static('musicas'))
app.use('/imagens', express.static('imagens'))
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'fei',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'maindb',
  password: process.env.DB_PASSWORD || 'fei',
  port: process.env.DB_PORT || 5432,
});

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Get all artists
app.get('/api/artists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artists ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get artist by ID
app.get('/api/artists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM artists WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get albums by artist ID
app.get('/api/artists/:artistId/albums', async (req, res) => {
  const { artistId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM albums WHERE artist_id = $1 ORDER BY id', [artistId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get album by ID (with songs)
app.get('/api/albums/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const albumResult = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);
    if (albumResult.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    const songsResult = await pool.query('SELECT * FROM songs WHERE album_id = $1 ORDER BY track_number', [id]);
    const album = albumResult.rows[0];
    album.songs = songsResult.rows;
    res.json(album);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all songs (optionally filtered by album/artist)
app.get('/api/songs', async (req, res) => {
  const { album_id, artist_id } = req.query;
  let query = 'SELECT * FROM songs';
  const params = [];
  if (album_id) {
    query += ' WHERE album_id = $1';
    params.push(album_id);
  } else if (artist_id) {
    query += ' WHERE artist_id = $1';
    params.push(artist_id);
  }
  query += ' ORDER BY id';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential, username, role } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token do Google não fornecido.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const google_id  = payload['sub'];
    const email      = payload['email'];
    const name       = payload['name'];
    const picture    = payload['picture'];

    const existing = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [google_id]
    );

    if (existing.rows.length > 0) {
      return res.json({ user: existing.rows[0], created: false });
    }

    if (!username || !role) {
      return res.status(400).json({ error: 'Username e role são obrigatórios no cadastro.' });
    }

    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, picture_url, username, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [google_id, email, name, picture, username, role]
    );

    return res.status(201).json({ user: result.rows[0], created: true });

  } catch (err) {
    console.error('Erro na autenticação Google:', err.message);

    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Username ou e-mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
// ==========================================
// ROTAS DE PLAYLISTS
// ==========================================

// 1. Criar uma nova playlist para um usuário
app.post('/api/playlists', async (req, res) => {
  const { user_id, name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING *',
      [user_id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar playlist' });
  }
});

// 2. Buscar todas as playlists de um usuário específico
app.get('/api/users/:userId/playlists', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar playlists' });
  }
});

// 3. Adicionar uma música dentro de uma playlist
app.post('/api/playlists/:playlistId/songs', async (req, res) => {
  const { playlistId } = req.params;
  const { song_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)',
      [playlistId, song_id]
    );
    res.status(201).json({ message: 'Música adicionada à playlist com sucesso!' });
  } catch (err) {
    console.error(err);
    // Erro 23505 no Postgres significa que tentou inserir um dado duplicado (chave primária)
    if (err.code === '23505') { 
       return res.status(409).json({ error: 'Esta música já está na playlist.' });
    }
    res.status(500).json({ error: 'Erro ao adicionar música na playlist' });
  }
});

// 4. Buscar uma playlist específica COM as músicas dentro dela
app.get('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Primeiro, busca os dados básicos da playlist
    const playlistResult = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }
    
    const playlist = playlistResult.rows[0];

    // Depois, busca as músicas fazendo um JOIN com a tabela de relacionamento
    const songsResult = await pool.query(`
      SELECT songs.* FROM songs 
      JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1
      ORDER BY playlist_songs.added_at ASC
    `, [id]);

    // Junta as músicas dentro do objeto da playlist e envia pro frontend
    playlist.songs = songsResult.rows;
    res.json(playlist);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar detalhes da playlist' });
  }
});
