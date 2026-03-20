import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function check() {
  const db = await open({ filename: join(__dirname, '..', '..', 'database.sqlite'), driver: sqlite3.Database });
  const products = await db.all('SELECT name FROM products');
  console.log('DB Products:', products.map(p => p.name).join(', '));
  await db.close();
}
check();
