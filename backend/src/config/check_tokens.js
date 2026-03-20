import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkTokens() {
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const users = await db.all('SELECT id, email, email_verified, verification_token, verification_token_expires FROM users ORDER BY id DESC');
  console.log('--- USER TOKENS ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Verified: ${u.email_verified}`);
    console.log(`Token: ${u.verification_token ? 'EXISTE (Hasheado)' : 'NULL'}`);
    console.log(`Expires: ${u.verification_token_expires}`);
    console.log('---');
  });
  
  await db.close();
}

checkTokens().catch(console.error);
