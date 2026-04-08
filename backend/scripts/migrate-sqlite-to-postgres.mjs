import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TABLE_ORDER = [
  'users',
  'products',
  'crm_users',
  'newsletter_subscribers',
  'analytics_events',
  'subscriptions',
  'ai_usage',
  'orders',
  'cart_items',
  'crm_alerts',
];

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [key, ...rest] = raw.slice(2).split('=');
    args[key] = rest.length ? rest.join('=') : true;
  }
  return args;
}

function resolveSqlitePath(args) {
  const input = String(args['sqlite-path'] || process.env.SQLITE_PATH || path.resolve(__dirname, '../database.sqlite'));
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

function normalizeJson(value, fallback) {
  if (value === null || value === undefined || value === '') return JSON.stringify(fallback);
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

async function readTable(sqliteDb, table) {
  return sqliteDb.all(`SELECT * FROM ${table}`);
}

async function countTables(sqliteDb) {
  const counts = {};
  for (const table of TABLE_ORDER) {
    try {
      const row = await sqliteDb.get(`SELECT COUNT(*) AS count FROM ${table}`);
      counts[table] = Number(row?.count || 0);
    } catch {
      counts[table] = 0;
    }
  }
  return counts;
}

async function importUsers(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO users
        (id, email, password, full_name, phone, email_verified, verification_token, verification_token_expires, reset_token, reset_token_expires, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        email_verified = EXCLUDED.email_verified,
        verification_token = EXCLUDED.verification_token,
        verification_token_expires = EXCLUDED.verification_token_expires,
        reset_token = EXCLUDED.reset_token,
        reset_token_expires = EXCLUDED.reset_token_expires`,
      [
        row.id,
        row.email,
        row.password,
        row.full_name ?? null,
        row.phone ?? null,
        Boolean(row.email_verified),
        row.verification_token ?? null,
        row.verification_token_expires ?? null,
        row.reset_token ?? null,
        row.reset_token_expires ?? null,
        row.created_at ?? null,
      ]
    );
  }
}

async function importProducts(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO products
        (id, name, description, price, image, badge, in_stock, extended_description, nutrition, origin, reviews, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, COALESCE($12, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        image = EXCLUDED.image,
        badge = EXCLUDED.badge,
        in_stock = EXCLUDED.in_stock,
        extended_description = EXCLUDED.extended_description,
        nutrition = EXCLUDED.nutrition,
        origin = EXCLUDED.origin,
        reviews = EXCLUDED.reviews`,
      [
        row.id,
        row.name,
        row.description ?? null,
        row.price,
        row.image ?? null,
        row.badge ?? null,
        row.in_stock === null || row.in_stock === undefined ? true : Boolean(row.in_stock),
        row.extended_description ?? null,
        normalizeJson(row.nutrition, []),
        row.origin ?? null,
        normalizeJson(row.reviews, []),
        row.created_at ?? null,
      ]
    );
  }
}

async function importCrmUsers(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO crm_users
        (id, email, password, role, local_ids, created_at)
       VALUES
        ($1, $2, $3, $4, $5::jsonb, COALESCE($6, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        local_ids = EXCLUDED.local_ids`,
      [
        row.id,
        row.email,
        row.password,
        row.role ?? 'operador',
        normalizeJson(row.local_ids, []),
        row.created_at ?? null,
      ]
    );
  }
}

async function importNewsletter(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO newsletter_subscribers
        (id, email, source, interested_product, discount_code, subscribed_at)
       VALUES
        ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        source = EXCLUDED.source,
        interested_product = EXCLUDED.interested_product,
        discount_code = EXCLUDED.discount_code`,
      [
        row.id,
        row.email,
        row.source ?? 'popup',
        row.interested_product ?? null,
        row.discount_code ?? null,
        row.subscribed_at ?? null,
      ]
    );
  }
}

async function importAnalytics(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO analytics_events
        (id, event_name, user_id, session_id, device_type, os_name, meta_data, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7::jsonb, COALESCE($8, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        event_name = EXCLUDED.event_name,
        user_id = EXCLUDED.user_id,
        session_id = EXCLUDED.session_id,
        device_type = EXCLUDED.device_type,
        os_name = EXCLUDED.os_name,
        meta_data = EXCLUDED.meta_data`,
      [
        row.id,
        row.event_name,
        row.user_id ?? null,
        row.session_id ?? null,
        row.device_type ?? null,
        row.os_name ?? null,
        normalizeJson(row.meta_data, {}),
        row.created_at ?? null,
      ]
    );
  }
}

async function importSubscriptions(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO subscriptions
        (id, user_id, plan_code, egg_type, status, next_delivery_date, notes, monthly_price, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        plan_code = EXCLUDED.plan_code,
        egg_type = EXCLUDED.egg_type,
        status = EXCLUDED.status,
        next_delivery_date = EXCLUDED.next_delivery_date,
        notes = EXCLUDED.notes,
        monthly_price = EXCLUDED.monthly_price`,
      [
        row.id,
        row.user_id,
        row.plan_code ?? null,
        row.egg_type ?? null,
        row.status ?? 'active',
        row.next_delivery_date ?? null,
        row.notes ?? null,
        row.monthly_price ?? 0,
        row.created_at ?? null,
      ]
    );
  }
}

async function importAiUsage(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO ai_usage
        (id, user_id, service_type, request_count, last_request)
       VALUES
        ($1, $2, $3, $4, COALESCE($5, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        service_type = EXCLUDED.service_type,
        request_count = EXCLUDED.request_count,
        last_request = EXCLUDED.last_request`,
      [
        row.id,
        row.user_id,
        row.service_type,
        row.request_count ?? 0,
        row.last_request ?? null,
      ]
    );
  }
}

async function importOrders(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO orders
        (id, user_id, total_price, status, cancellation_reason, delivery_address, delivery_schedule, notes, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        total_price = EXCLUDED.total_price,
        status = EXCLUDED.status,
        cancellation_reason = EXCLUDED.cancellation_reason,
        delivery_address = EXCLUDED.delivery_address,
        delivery_schedule = EXCLUDED.delivery_schedule,
        notes = EXCLUDED.notes`,
      [
        row.id,
        row.user_id,
        row.total_price,
        row.status ?? 'pending',
        row.cancellation_reason ?? null,
        row.delivery_address ?? null,
        row.delivery_schedule ?? null,
        row.notes ?? null,
        row.created_at ?? null,
      ]
    );
  }
}

async function importCartItems(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO cart_items
        (id, user_id, product_id, quantity, created_at)
       VALUES
        ($1, $2, $3, $4, COALESCE($5, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        product_id = EXCLUDED.product_id,
        quantity = EXCLUDED.quantity`,
      [
        row.id,
        row.user_id,
        row.product_id,
        row.quantity ?? 1,
        row.created_at ?? null,
      ]
    );
  }
}

async function importCrmAlerts(pg, rows) {
  for (const row of rows) {
    await pg.query(
      `INSERT INTO crm_alerts
        (id, local_id, type, severity, message, status, owner_user_id, created_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()))
       ON CONFLICT (id) DO UPDATE SET
        local_id = EXCLUDED.local_id,
        type = EXCLUDED.type,
        severity = EXCLUDED.severity,
        message = EXCLUDED.message,
        status = EXCLUDED.status,
        owner_user_id = EXCLUDED.owner_user_id`,
      [
        row.id,
        row.local_id ?? null,
        row.type ?? null,
        row.severity ?? null,
        row.message ?? null,
        row.status ?? 'active',
        row.owner_user_id ?? null,
        row.created_at ?? null,
      ]
    );
  }
}

async function syncSequences(pg) {
  const tables = TABLE_ORDER.filter((table) => table !== 'analytics_events');
  for (const table of tables) {
    await pg.query(
      `SELECT setval(
        pg_get_serial_sequence($1, 'id'),
        COALESCE((SELECT MAX(id) FROM ${table}), 1),
        TRUE
      )`,
      [table]
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sqlitePath = resolveSqlitePath(args);
  const dryRun = Boolean(args['dry-run']);

  const sqliteDb = await open({
    filename: sqlitePath,
    driver: sqlite3.Database,
  });

  try {
    const counts = await countTables(sqliteDb);
    process.stdout.write(`SQLite origen: ${sqlitePath}\n`);
    for (const [table, count] of Object.entries(counts)) {
      process.stdout.write(`- ${table}: ${count}\n`);
    }

    if (dryRun) {
      process.stdout.write('Dry run completado. No se escribieron datos en PostgreSQL.\n');
      return;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL es requerido para ejecutar la migración real.');
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
    });

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await importUsers(client, await readTable(sqliteDb, 'users'));
        process.stdout.write('Importados users.\n');
        await importProducts(client, await readTable(sqliteDb, 'products'));
        process.stdout.write('Importados products.\n');
        await importCrmUsers(client, await readTable(sqliteDb, 'crm_users'));
        process.stdout.write('Importados crm_users.\n');
        await importNewsletter(client, await readTable(sqliteDb, 'newsletter_subscribers'));
        process.stdout.write('Importados newsletter_subscribers.\n');
        await importAnalytics(client, await readTable(sqliteDb, 'analytics_events'));
        process.stdout.write('Importados analytics_events.\n');
        await importSubscriptions(client, await readTable(sqliteDb, 'subscriptions').catch(() => []));
        process.stdout.write('Importados subscriptions.\n');
        await importAiUsage(client, await readTable(sqliteDb, 'ai_usage'));
        process.stdout.write('Importados ai_usage.\n');
        await importOrders(client, await readTable(sqliteDb, 'orders'));
        process.stdout.write('Importados orders.\n');
        await importCartItems(client, await readTable(sqliteDb, 'cart_items'));
        process.stdout.write('Importados cart_items.\n');
        await importCrmAlerts(client, await readTable(sqliteDb, 'crm_alerts'));
        process.stdout.write('Importados crm_alerts.\n');
        await syncSequences(client);
        process.stdout.write('Secuencias sincronizadas.\n');

        await client.query('COMMIT');
        process.stdout.write('Migración completada hacia PostgreSQL.\n');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } finally {
      await pool.end();
    }
  } finally {
    await sqliteDb.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
