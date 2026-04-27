-- init.sql
-- Criação das tabelas para artistas, álbuns e músicas
-- Qualquer alteração na estrutura do banco de dados deve ser feita aqui

-- Tabela de artistas
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    google_id   VARCHAR(255),   -- "sub" do token JWT do Google (identificador permanente)
    name VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,   -- e-mail vindo do Google
    password    VARCHAR(255),                   -- senha do usuario (varchar hihi)
    username    VARCHAR(100) UNIQUE,            -- nome de usuário escolhido no cadastro
    created_at  TIMESTAMP DEFAULT NOW(),
    bio TEXT,
    picture_path VARCHAR(500) -- caminho para a imagem do artista (opcional)
);

-- Tabela de álbuns
CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_date DATE,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    cover_image_path VARCHAR(500) -- caminho para a imagem da capa (opcional)
);

-- Tabela de músicas
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- caminho para o arquivo de áudio
    track_number INTEGER, -- número da faixa no álbum
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    google_id   VARCHAR(255),   -- "sub" do token JWT do Google (identificador permanente)
    email       VARCHAR(255) NOT NULL UNIQUE,   -- e-mail vindo do Google
    name        VARCHAR(255),                   -- nome completo vindo do Google
    password    VARCHAR(255),                   -- senha do usuario (varchar hihi)
    picture_path VARCHAR(500),                   -- URL do avatar do Google
    username    VARCHAR(100) UNIQUE,            -- nome de usuário escolhido no cadastro
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabela de playlists
CREATE TABLE IF NOT EXISTS playlists (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    cover_image_path  VARCHAR(500), 
    is_public         BOOLEAN DEFAULT TRUE,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- Tabela intermediária (N:N)
CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id     INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id) 
);

ALTER TABLE artists
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Índices
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_order ON playlist_songs(playlist_id, added_at);
