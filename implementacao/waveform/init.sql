-- init.sql
-- Criação das tabelas para artistas, álbuns e músicas
-- Qualquer alteração na estrutura do banco de dados deve ser feita aqui

-- Tabela de artistas
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
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

-- Índices
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_songs_artist_id ON songs(artist_id);
CREATE INDEX idx_songs_album_id ON songs(album_id);
