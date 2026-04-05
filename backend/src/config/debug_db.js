import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function check() {
  const filename = process.env.SQLITE_PATH
    ? join(__dirname, '..', '..', process.env.SQLITE_PATH)
    : join(__dirname, '..', '..', 'database_dev_local.sqlite');
  const db = await open({ filename, driver: sqlite3.Database });
  const products = await db.all('SELECT id, name FROM products');
  console.log('--- DB PRODUCTS ---');
  products.forEach(p => console.log(`${p.id}: ${p.name}`));
  await db.close();
}
check();
