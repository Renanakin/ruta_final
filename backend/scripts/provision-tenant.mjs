import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [k, ...rest] = raw.slice(2).split('=');
    args[k] = rest.join('=');
  }
  return args;
}

function requireArg(args, key) {
  const value = String(args[key] || '').trim();
  if (!value) {
    throw new Error(`Falta argumento requerido --${key}`);
  }
  return value;
}

function isSafeIdentifier(value) {
  return /^[a-zA-Z0-9_]+$/.test(String(value || ''));
}

function qIdent(value) {
  if (!isSafeIdentifier(value)) {
    throw new Error(`Identificador inválido: ${value}`);
  }
  return `\`${value}\``;
}

async function ensurePlatformControl(connection, platformDb) {
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${qIdent(platformDb)}`);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ${qIdent(platformDb)}.tenants (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      tenant_code VARCHAR(60) NOT NULL UNIQUE,
      tenant_name VARCHAR(160) NOT NULL,
      db_name VARCHAR(80) NOT NULL UNIQUE,
      default_local_code VARCHAR(60) NOT NULL DEFAULT 'matriz',
      default_local_name VARCHAR(120) NOT NULL DEFAULT 'Casa Matriz',
      admin_email VARCHAR(255) NOT NULL,
      operator_email VARCHAR(255) NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function cloneSchema(connection, sourceDb, targetDb) {
  const [rows] = await connection.query(`SHOW FULL TABLES FROM ${qIdent(sourceDb)} WHERE Table_type = 'BASE TABLE'`);
  if (!rows.length) {
    throw new Error(`No se encontraron tablas en DB origen ${sourceDb}`);
  }

  const tableField = Object.keys(rows[0]).find((key) => key.toLowerCase().startsWith('tables_in_'));
  for (const row of rows) {
    const tableName = row[tableField];
    if (!isSafeIdentifier(tableName)) continue;
    await connection.query(`CREATE TABLE IF NOT EXISTS ${qIdent(targetDb)}.${qIdent(tableName)} LIKE ${qIdent(sourceDb)}.${qIdent(tableName)}`);
    await connection.query(`TRUNCATE TABLE ${qIdent(targetDb)}.${qIdent(tableName)}`);
  }
}

async function seedTenantData(connection, sourceDb, targetDb, cfg) {
  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.products (name, description, price, image, badge, active)
     SELECT name, description, price, image, badge, active
     FROM ${qIdent(sourceDb)}.products
     WHERE active = true`
  );

  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.locals (code, name, timezone, region, active)
     VALUES (?, ?, 'America/Santiago', 'RM', true)
     ON DUPLICATE KEY UPDATE name = VALUES(name), active = true`,
    [cfg.localCode, cfg.localName]
  );

  const [localRows] = await connection.query(
    `SELECT id FROM ${qIdent(targetDb)}.locals WHERE code = ? LIMIT 1`,
    [cfg.localCode]
  );
  const localId = Number(localRows[0]?.id || 1);

  const adminHash = await bcrypt.hash(cfg.adminPassword, 10);
  const operatorHash = await bcrypt.hash(cfg.operatorPassword, 10);

  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.crm_users (email, password_hash, role, is_active, home_local_id)
     VALUES (?, ?, 'admin', true, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = true, home_local_id = VALUES(home_local_id)`,
    [cfg.adminEmail, adminHash, localId]
  );

  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.crm_users (email, password_hash, role, is_active, home_local_id)
     VALUES (?, ?, 'operador', true, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = true, home_local_id = VALUES(home_local_id)`,
    [cfg.operatorEmail, operatorHash, localId]
  );

  const [crmUsers] = await connection.query(
    `SELECT id FROM ${qIdent(targetDb)}.crm_users WHERE email IN (?, ?)`,
    [cfg.adminEmail, cfg.operatorEmail]
  );

  for (const user of crmUsers) {
    await connection.query(
      `INSERT INTO ${qIdent(targetDb)}.crm_user_locals (crm_user_id, local_id, is_active)
       VALUES (?, ?, true)
       ON DUPLICATE KEY UPDATE is_active = true`,
      [Number(user.id), localId]
    );
  }

  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.metric_dictionary_versions
      (metric_code, name, formula, source, periodicity, owner, version_tag, notes, is_active, effective_from, created_by_user_id, created_by_email)
     SELECT metric_code, name, formula, source, periodicity, owner, version_tag, notes, is_active, effective_from, created_by_user_id, created_by_email
     FROM ${qIdent(sourceDb)}.metric_dictionary_versions
     WHERE is_active = true`
  );

  await connection.query(
    `INSERT INTO ${qIdent(targetDb)}.local_alert_thresholds (local_id, min_fulfillment_pct, max_cancellation_pct, max_pending_pct)
     VALUES (?, 90, 8, 15)
     ON DUPLICATE KEY UPDATE local_id = local_id`,
    [localId]
  );
}

async function registerTenant(connection, platformDb, cfg) {
  await connection.query(
    `INSERT INTO ${qIdent(platformDb)}.tenants
      (tenant_code, tenant_name, db_name, default_local_code, default_local_name, admin_email, operator_email, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, true)
     ON DUPLICATE KEY UPDATE
       tenant_name = VALUES(tenant_name),
       db_name = VALUES(db_name),
       default_local_code = VALUES(default_local_code),
       default_local_name = VALUES(default_local_name),
       admin_email = VALUES(admin_email),
       operator_email = VALUES(operator_email),
       active = true`,
    [
      cfg.tenantCode,
      cfg.tenantName,
      cfg.dbName,
      cfg.localCode,
      cfg.localName,
      cfg.adminEmail,
      cfg.operatorEmail
    ]
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const tenantCode = requireArg(args, 'tenant-code').toLowerCase();
  const tenantName = requireArg(args, 'tenant-name');
  const dbName = requireArg(args, 'db-name');
  const adminEmail = requireArg(args, 'admin-email').toLowerCase();
  const adminPassword = requireArg(args, 'admin-password');
  const operatorEmail = String(args['operator-email'] || `operador+${tenantCode}@example.com`).trim().toLowerCase();
  const operatorPassword = String(args['operator-password'] || '').trim();
  if (!operatorPassword) throw new Error('Falta argumento --operator-password');
  const localCode = String(args['local-code'] || 'matriz').trim().toLowerCase();
  const localName = String(args['local-name'] || 'Casa Matriz').trim();
  const sourceDb = String(args['source-db'] || process.env.DB_NAME || 'ruta_del_nido').trim();
  const platformDb = String(args['platform-db'] || process.env.PLATFORM_CONTROL_DB || 'platform_control').trim();

  if (!isSafeIdentifier(dbName)) throw new Error('db-name inválido. Usa solo letras, números y underscore');
  if (!isSafeIdentifier(sourceDb)) throw new Error('source-db inválido. Usa solo letras, números y underscore');
  if (!isSafeIdentifier(platformDb)) throw new Error('platform-db inválido. Usa solo letras, números y underscore');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    await ensurePlatformControl(connection, platformDb);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${qIdent(dbName)}`);
    await cloneSchema(connection, sourceDb, dbName);
    await seedTenantData(connection, sourceDb, dbName, {
      tenantCode,
      tenantName,
      dbName,
      adminEmail,
      adminPassword,
      operatorEmail,
      operatorPassword,
      localCode,
      localName
    });
    await registerTenant(connection, platformDb, {
      tenantCode,
      tenantName,
      dbName,
      adminEmail,
      operatorEmail,
      localCode,
      localName
    });

    process.stdout.write(`Tenant provisionado: ${tenantCode} -> DB ${dbName}\n`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
