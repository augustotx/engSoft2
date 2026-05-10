const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
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

const session = require('express-session')

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 
  }
}))

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

// GET /api/artists - List all artists (with basic info)
app.get('/api/artists', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, picture_path, bio, status, created_at FROM artists ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar artistas.' });
  }
});

// GET /api/artists/:id - Fetch complete artist profile
app.get('/api/artists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, google_id, name, email, username, created_at, bio, picture_path, status FROM artists WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artista não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar artista.' });
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
  const { credential, username, role, bio, picture_path } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token do Google não fornecido.' });
  }
  if (!username || !role) {
    return res.status(400).json({ error: 'Nome de usuário e role são obrigatórios para novos usuários.' });
  }
  if (!['users', 'artists'].includes(role)) {
    return res.status(400).json({ error: 'Role inválida. Deve ser "user" ou "artist".' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const google_id = payload['sub'];
    const email = payload['email'];
    const fullName = payload['name'];
    const picture = payload['picture'];

    if (role === 'users') {
      // Check if user already exists
      const existing = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [google_id]
      );
      if (existing.rows.length > 0) {
        return res.json({ user: existing.rows[0], role: 'users', created: false });
      }

      // Create new user
      const result = await pool.query(
        `INSERT INTO users (google_id, email, name, picture_path, username, status)
         VALUES ($1, $2, $3, $4, $5, 'approved')
         RETURNING *`,
        [google_id, email, fullName, picture, username]
      );
      return res.status(201).json({ user: result.rows[0], role: 'users', created: true });
    }

    // role === 'artist'
    // Check if artist already exists
    const existing = await pool.query(
      'SELECT * FROM artists WHERE google_id = $1',
      [google_id]
    );
    if (existing.rows.length > 0) {
      return res.json({ user: existing.rows[0], role: 'artists', created: false });
    }

    // Create new artist
    const result = await pool.query(
      `INSERT INTO artists (google_id, name, email, username, bio, picture_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [google_id, fullName, email, username, bio || null, picture_path || picture || null]
    );
    return res.status(201).json({ user: result.rows[0], role: 'artists', created: true });

  } catch (err) {
    console.error('Erro na autenticação Google:', err.message);
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Username ou e‑mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, username, password, name, bio, picture_path, role } = req.body;

  if (!email || !username || !password || !name || !role) {
    return res.status(400).json({
      error: 'Dados incompletos ou inválidos'
    });
  }

  if (role !== 'artists' && role !== 'users') {
    return res.status(400).json({
      error: 'Role inválida'
    });
  }

  try {
    let sql;
    let valores;
    let result;

    if (role === 'artists') {
      sql = `
        INSERT INTO artists (email, username, password, name, bio, picture_path)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, username, name, bio, picture_path;
      `;

      valores = [
        email,
        username,
        password,
        name,
        bio || null,
        picture_path || null
      ];
    }

    else if (role === 'users') {
      sql = `
        INSERT INTO users (email, username, password, name, picture_path)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, username, name, picture_path;
      `;

      valores = [
        email,
        username,
        password,
        name,
        picture_path || null
      ];
    }

    result = await pool.query(sql, valores);

    res.status(201).json({
      message: `${role === 'artists' ? 'Artista' : 'Usuário'} criado com sucesso`,
      user: {
        ...result.rows[0],
        role
      }
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Email ou username já existe'
      });
    }

    console.error('ERRO SIGNIN:', err);

    res.status(500).json({
      error: err.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email e senha são obrigatórios'
    });
  }

  try {
    const sql = `
      SELECT id, email, username, name, password, picture_path
      FROM ${role}
      WHERE email = $1
    `;

    const result = await pool.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role
    };

    console.log('SESSION:', req.session.user);

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: req.session.user
    });

  } catch (err) {
    console.error('ERRO LOGIN:', err);
    res.status(500).json({
      error: err.message
    });
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

// 2. Buscar todas as playlists de um usuário (COM CONTAGEM DE MÚSICAS)
app.get('/api/users/:userId/playlists', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, COUNT(ps.song_id)::int as song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar playlists' });
  }
});

// 3. Adicionar uma música dentro de uma playlist (Rota Corrigida para /api/playlist_songs)
app.post('/api/playlist_songs', async (req, res) => {
  const { playlist_id, song_id } = req.body; // O Vue manda esses nomes

  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'playlist_id e song_id são obrigatórios.' });
  }

  try {
    await pool.query(
      'INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2)',
      [playlist_id, song_id]
    );
    res.status(201).json({ message: 'Música adicionada à playlist com sucesso!' });
  } catch (err) {
    console.error(err);
    // Erro 23505 = Chave duplicada (música já está lá)
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

// Rota para remover uma música de uma playlist específica
app.delete('/api/playlist_songs', async (req, res) => {
  const { playlist_id, song_id } = req.body;

  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'playlist_id e song_id são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [playlist_id, song_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'A música já não estava nesta playlist.' });
    }

    res.json({ message: 'Música removida com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover música da playlist.' });
  }
});

// Deletar uma playlist inteira
app.delete('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM playlists WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Playlist não encontrada.' });
    }

    res.json({ message: 'Playlist deletada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar playlist.' });
  }
});

// ==========================================
// FIM DAS ROTAS DE PLAYLISTS
// ==========================================


// Listar artistas pendentes
app.get('/api/admin/artists/pending', async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT a.* FROM artists a
        WHERE a.status = 'pending'
        ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar artistas pendentes.' });
  }
});

// Aprovar ou rejeitar um artista
app.patch('/api/admin/artists/:userId/status', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    const result = await pool.query(
      `UPDATE artists SET status = $1 WHERE id = $2 RETURNING *`,
      [status, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artista não encontrado.' });
    }
    res.json({ message: `Artista ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// Checkar sessao
app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'Não autenticado'
    });
  }

  res.json({
    user: req.session.user,
    role: req.session.role
  });
});

// GET /api/users/:id - Pegar perfil do usuário por ID (incluindo dados de artista se for o caso)
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First, check if user exists
    const userResult = await pool.query(
      `SELECT id, email, name, username, picture_path, status, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // If the user is an artist, also fetch artist-specific data
    const artistResult = await pool.query(
      `SELECT bio, picture_path as artist_picture, user_id
       FROM artists WHERE user_id = $1`,
      [id]
    );
    if (artistResult.rows.length > 0) {
      user.bio = artistResult.rows[0].bio;
      user.artist_picture = artistResult.rows[0].artist_picture;
      user.role = 'artist';
    } else {
      user.role = 'user';
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// PUT /api/users/:id - Atualizar perfil do usuário (name, username, password, picture_path)
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  let { name, username, password, picture_path } = req.body;

  // Prevent email update (email is immutable)
  if (req.body.email !== undefined) {
    return res.status(400).json({ error: 'O e-mail não pode ser alterado.' });
  }

  // Normalize username (optional)
  if (username !== undefined) {
    username = username.trim().toLowerCase();
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username deve ter pelo menos 3 caracteres.' });
    }
  }

  // Build dynamic UPDATE query
  const updateFields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (username !== undefined) {
    updateFields.push(`username = $${idx++}`);
    values.push(username);
  }
  if (password !== undefined && password.trim() !== '') {
    // In production, you should hash the password (e.g., bcrypt)
    updateFields.push(`password = $${idx++}`);
    values.push(password);
  }
  if (picture_path !== undefined) {
    updateFields.push(`picture_path = $${idx++}`);
    values.push(picture_path);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
  }

  values.push(id);
  const query = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, email, name, username, picture_path, status, created_at
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Username já está em uso.' });
    }
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});

// PUT /api/artists/:id - Update artist profile
app.put('/api/artists/:id', async (req, res) => {
  const { id } = req.params;
  let { name, username, password, picture_path, bio } = req.body;

  // Prevent email change (email is immutable)
  if (req.body.email !== undefined) {
    return res.status(400).json({ error: 'O e-mail não pode ser alterado.' });
  }

  // Normalize username (optional)
  if (username !== undefined) {
    username = username.trim().toLowerCase();
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username deve ter pelo menos 3 caracteres.' });
    }
  }

  const updateFields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    updateFields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (username !== undefined) {
    updateFields.push(`username = $${idx++}`);
    values.push(username);
  }
  if (password !== undefined && password.trim() !== '') {
    // In production, hash the password (e.g., bcrypt)
    updateFields.push(`password = $${idx++}`);
    values.push(password);
  }
  if (picture_path !== undefined) {
    updateFields.push(`picture_path = $${idx++}`);
    values.push(picture_path);
  }
  if (bio !== undefined) {
    updateFields.push(`bio = $${idx++}`);
    values.push(bio);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
  }

  values.push(id);
  const query = `
    UPDATE artists
    SET ${updateFields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, email, name, username, created_at, bio, picture_path, status
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artista não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Username ou e-mail já está em uso.' });
    }
    console.error('Erro ao atualizar artista:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});
