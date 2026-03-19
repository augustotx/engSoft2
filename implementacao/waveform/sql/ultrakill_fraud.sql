-- ultrakill_fraud.sql
-- Insere o artista Heaven Pierce Her, o álbum ULTRAKILL: FRAUD e as 9 músicas.

-- Inserir artista com picture_path
INSERT INTO artists (name, picture_path, bio)
VALUES (
    'Heaven Pierce Her',
    'imagens/artist_1.jpg',
    ''
);

-- Inserir álbum
INSERT INTO albums (title, release_date, artist_id, cover_image_path)
VALUES (
    'ULTRAKILL: FRAUD',
    NULL,
    (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
    'imagens/album_1.png'
);

-- Inserir músicas
INSERT INTO songs (title, file_path, track_number, artist_id, album_id) VALUES
    ('In Absentia ΛΟΓΟΣ', 'musicas/song_1.flac', 1,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('Spiral Out (Keep Going)', 'musicas/song_2.flac', 2,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('Never Odd or Even', 'musicas/song_3.flac', 3,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('No Devil Lived On', 'musicas/song_4.flac', 4,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('Mirror Rim', 'musicas/song_5.flac', 5,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('The Break (Crimson Glass deComposition)', 'musicas/song_6.flac', 6,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('The Shattering Circle, or- A Charade of Shadeless Ones and Zeroes Rearranged ad Nihilum', 'musicas/song_7.flac', 7,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('Event Horizon (Reach for the Sun and Burn! Burn! Burn!)', 'musicas/song_8.flac', 8,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD')),
    ('The Fall', 'musicas/song_9.flac', 9,
     (SELECT id FROM artists WHERE name = 'Heaven Pierce Her'),
     (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD'));

-- Verificar IDs gerados
SELECT 'ID do artista: ' || id FROM artists WHERE name = 'Heaven Pierce Her';
SELECT 'ID do álbum: ' || id FROM albums WHERE title = 'ULTRAKILL: FRAUD';
SELECT 'IDs das músicas:'; SELECT id, track_number FROM songs WHERE album_id = (SELECT id FROM albums WHERE title = 'ULTRAKILL: FRAUD') ORDER BY track_number;
