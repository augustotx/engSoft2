-- create_users.sql
-- Criação da tabela de usuários com autenticação via Google OAuth
-- Para rodar este arquivo:
--   docker cp create_users.sql postgres-custom:create_users.sql
--   docker exec -it postgres-custom psql -U fei -d maindb -f /create_users.sql

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    google_id   VARCHAR(255) NOT NULL UNIQUE,   -- "sub" do token JWT do Google (identificador permanente)
    email       VARCHAR(255) NOT NULL UNIQUE,   -- e-mail vindo do Google
    name        VARCHAR(255),                   -- nome completo vindo do Google
    picture_url VARCHAR(500),                   -- URL do avatar do Google
    username    VARCHAR(100) UNIQUE,            -- nome de usuário escolhido no cadastro
    role        VARCHAR(20) NOT NULL DEFAULT 'listener' CHECK (role IN ('listener', 'artist')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);

-- Vincula um artista existente à sua conta de usuário
-- (só roda se a tabela artists já existir)
ALTER TABLE artists
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id);
