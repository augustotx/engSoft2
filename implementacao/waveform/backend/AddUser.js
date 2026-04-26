const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const googleId = process.argv[2];
const email = process.argv[3];
const username = process.argv[4];
const role = process.argv[5];
const name = process.argv.slice(6).join(' ');

if (!googleId || !email || !username || !role || !name) {
  console.error("Erro: Argumentos incompletos ou invalidos.");
  console.log('Uso correto: node AddUser.js <GOOGLE_ID> <EMAIL> <USERNAME> <ROLE> <NOME_COMPLETO>');
  console.log('Exemplo: node AddUser.js 1029384756 user@gmail.com user123 listener Joao da Silva');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function addUser() {
  try {
    const sql = `
      INSERT INTO users (google_id, email, username, role, name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role;
    `;

    const valores = [googleId, email, username, role, name];

    const res = await pool.query(sql, valores);

    console.log('Sucesso. Usuario inserido no banco:');
    console.table(res.rows[0]);

  } catch (err) {
    if (err.code === '23505') {
      console.error('Erro: Já existe um usuário cadastrado com este google_id, email ou username (Unique Violation).');
    } else if (err.code === '23514') {
      console.error("Erro: O 'role' deve ser 'listener' ou 'artist' (Check Violation).");
    } else {
      console.error('Erro no banco de dados:', err.message);
    }
  } finally {
    await pool.end();
  }
}

addUser(); 1