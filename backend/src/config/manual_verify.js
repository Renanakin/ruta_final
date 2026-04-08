import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateManualToken() {
  const email = 'hectorteck4@gmail.com';
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const configuredPath = String(process.env.SQLITE_PATH || '').trim();
  const dbPath = configuredPath
    ? path.resolve(__dirname, '../../', configuredPath)
    : path.resolve(__dirname, '../../database_dev_local.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.run(
    'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE email = ?',
    [hashedToken, expires.toISOString(), email]
  );
  
  console.log('--- TOKEN MANUAL GENERADO ---');
  console.log(`Para email: ${email}`);
  console.log(`Enlace de verificación: http://localhost:5173/verify-email?token=${rawToken}`);
  console.log('---');
  
  await db.close();
}

generateManualToken().catch(console.error);
