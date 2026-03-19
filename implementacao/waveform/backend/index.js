const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

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

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
