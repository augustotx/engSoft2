const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// ----------------------------------------------------
// CONFIGURAÇÃO DO MULTER PARA UPLOAD DE ÁUDIO
// ----------------------------------------------------
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'musicas');
    // Cria a pasta 'musicas' caso ela não exista
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Dá um nome único pro arquivo para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'song-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
// ----------------------------------------------------

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/musicas', express.static('musicas'));
app.use('/imagens', express.static('imagens'));
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

app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 
  }
}));

// ==========================================
// ROTAS DE MÚSICAS E ÁLBUNS
// ==========================================

// POST /api/songs/upload - Fazer upload de uma nova música (NOVA ROTA)
app.post('/api/songs/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo de áudio enviado.' });
  }

  const { title, artist_id } = req.body;

  if (!title || !artist_id) {
    return res.status(400).json({ error: 'Título e ID do artista são obrigatórios.' });
  }

  const filePath = `musicas/${req.file.filename}`;

  try {
    const result = await pool.query(
      `INSERT INTO songs (title, file_path, artist_id) 
       VALUES ($1, $2, $3) RETURNING *`,
      [title, filePath, artist_id]
    );

    res.status(201).json({ 
      message: 'Música salva com sucesso no catálogo!', 
      song: result.rows[0] 
    });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao salvar música no banco de dados.' });
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

// Download de música
app.get('/api/songs/:id/download', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT title, file_path FROM songs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Música não encontrada' });
    }

    const song = result.rows[0];
    const filePath = path.join(__dirname, song.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${song.title}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao baixar música' });
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

// ==========================================
// ROTAS DE ARTISTAS
// ==========================================

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

// PUT /api/artists/:id - Update artist profile
app.put('/api/artists/:id', async (req, res) => {
  const { id } = req.params;
  let { name, username, password, picture_path, bio } = req.body;

  if (req.body.email !== undefined) {
    return res.status(400).json({ error: 'O e-mail não pode ser alterado.' });
  }

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
    if (err.code === '23505') { 
      return res.status(409).json({ error: 'Username ou e-mail já está em uso.' });
    }
    console.error('Erro ao atualizar artista:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});

// ==========================================
// ROTAS DE ADMIN
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

// ==========================================
// ROTAS DE USUÁRIOS E PERFIL
// ==========================================

// GET /api/users/:id - Pegar perfil do usuário por ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query(
      `SELECT id, email, name, username, picture_path, status, created_at, is_premium
       FROM users WHERE id = $1`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];
    user.role = 'users';

    res.json(user);
  } catch (err) {
    console.error('Erro ao buscar perfil do usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// PUT /api/users/:id - Atualizar perfil do usuário
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  let { name, username, password, picture_path } = req.body;

  if (req.body.email !== undefined) {
    return res.status(400).json({ error: 'O e-mail não pode ser alterado.' });
  }

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
    if (err.code === '23505') { 
      return res.status(409).json({ error: 'Username já está em uso.' });
    }
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
  }
});

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

app.post('/api/auth/google', async (req, res) => {
  const { credential, username, role, bio, picture_path } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Token do Google não fornecido.' });
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

    let user = null;
    let userRole = null;

    const artistExists = await pool.query('SELECT * FROM artists WHERE google_id = $1', [google_id]);

    if (artistExists.rows.length > 0) {
      user = artistExists.rows[0];
      userRole = 'artists';
    } else {
      const userExists = await pool.query('SELECT * FROM users WHERE google_id = $1', [google_id]);
      if (userExists.rows.length > 0) {
        user = userExists.rows[0];
        userRole = 'users';
      }
    }

    if (user) {
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        picture_path: user.picture_path,
        role: userRole === 'artists' ? 'artists' : 'users'
      };

      req.session.role = userRole;

      console.log('Sessão criada para:', req.session.user);

      return res.json({
        user: req.session.user,
        role: userRole,
        created: false
      });
    }

    if (!username || !role) {
      return res.status(400).json({
        error: 'Para novos usuários, nome de usuário e role são obrigatórios.'
      });
    }

    if (!['users', 'artists'].includes(role)) {
      return res.status(400).json({ error: 'Role inválida. Deve ser "user" ou "artist".' });
    }

    let newUser;

    if (role === 'users') {
      const result = await pool.query(
        `INSERT INTO users (google_id, email, name, picture_path, username, status)
         VALUES ($1, $2, $3, $4, $5, 'approved')
         RETURNING *`,
        [google_id, email, fullName, picture, username]
      );
      newUser = result.rows[0];
      userRole = 'users';
    } else {
      const artistStatus = 'pending'; 
      const result = await pool.query(
        `INSERT INTO artists (google_id, name, email, username, bio, picture_path, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [google_id, fullName, email, username, bio || null, picture_path || picture || null, artistStatus]
      );
      newUser = result.rows[0];
      userRole = 'artists';
    }

    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      picture_path: newUser.picture_path || picture,
      role: userRole
    };

    req.session.role = userRole;

    console.log('Nova sessão criada para:', req.session.user);

    return res.status(201).json({
      user: req.session.user,
      role: userRole,
      created: true
    });

  } catch (err) {
    console.error('Erro na autenticação Google:', err.message);
    if (err.code === '23505') { 
      return res.status(409).json({ error: 'Username ou e‑mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}); 

app.post('/api/auth/signin', async (req, res) => {
  const { email, username, password, name, bio, picture_path, role } = req.body;

  if (!email || !username || !password || !name || !role) {
    return res.status(400).json({ error: 'Dados incompletos ou inválidos' });
  }

  if (role !== 'artists' && role !== 'users') {
    return res.status(400).json({ error: 'Role inválida' });
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

      valores = [ email, username, password, name, bio || null, picture_path || null ];
    }
    else if (role === 'users') {
      sql = `
        INSERT INTO users (email, username, password, name, picture_path)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, username, name, picture_path;
      `;

      valores = [ email, username, password, name, picture_path || null ];
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
      return res.status(409).json({ error: 'Email ou username já existe' });
    }
    console.error('ERRO SIGNIN:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const sql = `
      SELECT id, email, username, name, password, picture_path, is_premium
      FROM ${role}
      WHERE email = $1
    `;

    const result = await pool.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    if (password !== user.password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role,
      is_premium: user.is_premium ?? false
    };

    console.log('SESSION:', req.session.user);

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: req.session.user
    });

  } catch (err) {
    console.error('ERRO LOGIN:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logout realizado com sucesso' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  res.json({
    user: req.session.user,
    role: req.session.user.role 
  });
});

// ==========================================
// ROTAS DE ASSINATURA
// ==========================================

app.post('/api/subscription/subscribe', async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório' })
  }

  try {
    const result = await pool.query(
      'UPDATE users SET is_premium = TRUE WHERE id = $1 RETURNING id, username, is_premium',
      [user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (req.session.user) {
      req.session.user.is_premium = true
    }

    res.status(200).json({
      message: 'Assinatura realizada com sucesso!',
      user: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao assinar:', err)
    res.status(500).json({ error: 'Erro interno ao processar assinatura' })
  }
})

app.post('/api/subscription/cancel', async (req, res) => {
  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id é obrigatório' })
  }

  try {
    const result = await pool.query(
      'UPDATE users SET is_premium = FALSE WHERE id = $1 RETURNING id, username, is_premium',
      [user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (req.session.user) {
      req.session.user.is_premium = false
    }

    res.status(200).json({
      message: 'Assinatura cancelada.',
      user: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao cancelar:', err)
    res.status(500).json({ error: 'Erro interno ao cancelar assinatura' })
  }
})

// ==========================================
// ROTAS DE PLAYLISTS
// ==========================================

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

app.post('/api/playlist_songs', async (req, res) => {
  const { playlist_id, song_id } = req.body; 

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
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Esta música já está na playlist.' });
    }
    res.status(500).json({ error: 'Erro ao adicionar música na playlist' });
  }
});

app.get('/api/playlists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const playlistResult = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    const playlist = playlistResult.rows[0];

    const songsResult = await pool.query(`
      SELECT songs.* FROM songs 
      JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1
      ORDER BY playlist_songs.ordem ASC, playlist_songs.added_at ASC
    `, [id]);

    playlist.songs = songsResult.rows;
    res.json(playlist);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar detalhes da playlist' });
  }
});

app.put('/api/playlists/:id/reorder', async (req, res) => {
  const { id } = req.params;
  const { novaOrdem } = req.body; 

  try {
    const promises = novaOrdem.map((songId, index) => {
      return pool.query(
        'UPDATE playlist_songs SET ordem = $1 WHERE playlist_id = $2 AND song_id = $3',
        [index, id, songId]
      );
    });

    await Promise.all(promises);
    res.json({ message: 'Ordem atualizada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao reordenar playlist.' });
  }
});

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
// ROTAS DE STREAMS E PAGAMENTO
// ==========================================

app.post('/api/songs/:id/stream', async (req, res) => {
  const { id } = req.params;
  try {
    const songResult = await pool.query('SELECT id FROM songs WHERE id = $1', [id]);
    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }

    await pool.query('INSERT INTO streams (song_id) VALUES ($1)', [id]);
    res.status(201).json({ registrado: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar stream.' });
  }
});

app.get('/api/artists/:id/pagamento', async (req, res) => {
  const { id } = req.params;
  const VALOR_POR_STREAM = 0.005; 

  try {
    const artistResult = await pool.query('SELECT id, name FROM artists WHERE id = $1', [id]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artista não encontrado.' });
    }

    const result = await pool.query(
      `SELECT COUNT(*) FROM streams
       JOIN songs ON streams.song_id = songs.id
       WHERE songs.artist_id = $1
       AND streams.played_at > NOW() - INTERVAL '1 month'`,
      [id]
    );

    const totalStreams = parseInt(result.rows[0].count);
    const pagamento = (totalStreams * VALOR_POR_STREAM).toFixed(2);

    res.json({
      artista: artistResult.rows[0].name,
      streams_ultimo_mes: totalStreams,
      valor_por_stream: VALOR_POR_STREAM,
      pagamento_total: parseFloat(pagamento)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao calcular pagamento.' });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});