import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let initPromise = null;

const resolveDbPath = () => {
  const configuredPath = String(process.env.SQLITE_PATH || '').trim();
  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(__dirname, '../../', configuredPath);
  }

  if (process.env.NODE_ENV === 'test') {
    const workerId = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || String(process.pid);
    const tempDir = path.resolve(__dirname, `../../.tmp/vitest-${workerId}`);
    fs.mkdirSync(tempDir, { recursive: true });
    return path.join(tempDir, 'database_test.sqlite');
  }

  return path.resolve(__dirname, '../../database_dev_local.sqlite');
};

const ensureColumn = async (db, tableName, columnName, definition) => {
  const columns = await db.all(`PRAGMA table_info(${tableName})`);
  if (!columns.some((column) => column.name === columnName)) {
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureAnalyticsSchema = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      user_id INTEGER,
      session_id TEXT,
      device_type TEXT,
      os_name TEXT,
      meta_data TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS geo_ip_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash TEXT NOT NULL UNIQUE,
      ip_masked TEXT,
      country_code TEXT,
      country_name TEXT,
      region TEXT,
      city TEXT,
      latitude REAL,
      longitude REAL,
      provider TEXT,
      resolved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await ensureColumn(db, 'analytics_events', 'event_id', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'anonymous_id', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'page_path', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'source', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'referrer', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'ip_hash', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'ip_masked', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'country_code', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'country_name', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'region', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'city', 'TEXT');
  await ensureColumn(db, 'analytics_events', 'latitude', 'REAL');
  await ensureColumn(db, 'analytics_events', 'longitude', 'REAL');
  await ensureColumn(db, 'analytics_events', 'payload', 'TEXT DEFAULT \'{}\'');

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created_at
      ON analytics_events (event_name, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_page_created_at
      ON analytics_events (page_path, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_geo_created_at
      ON analytics_events (country_code, city, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
      ON analytics_events (session_id);
    CREATE INDEX IF NOT EXISTS idx_geo_ip_cache_hash
      ON geo_ip_cache (ip_hash);
  `);
};

const ensureUsersSchema = async (db) => {
  await ensureColumn(db, 'users', 'email_verified', 'BOOLEAN DEFAULT FALSE');
  await ensureColumn(db, 'users', 'verification_token', 'TEXT');
  await ensureColumn(db, 'users', 'verification_token_expires', 'TEXT');
  await ensureColumn(db, 'users', 'reset_token', 'TEXT');
  await ensureColumn(db, 'users', 'reset_token_expires', 'TEXT');
};

const ensureProductsSchema = async (db) => {
  await ensureColumn(db, 'products', 'coming_soon', 'BOOLEAN DEFAULT 0');
  await db.run(
    `UPDATE products
     SET coming_soon = 1
     WHERE name IN (?, ?, ?)`,
    [
      'Longaniza de Capitán Pastene',
      'Costillar de Cerdo Nacional',
      'Costillar Ahumado Capitán Pastene',
    ]
  );
};

const ensureOrdersSchema = async (db) => {
  await ensureColumn(db, 'orders', 'cancellation_reason', 'TEXT');
};

const ensureNewsletterSchema = async (db) => {
  await ensureColumn(db, 'newsletter_subscribers', 'discount_code', 'TEXT');
};

const ensureCrmUsersSchema = async (db) => {
  await ensureColumn(db, 'crm_users', 'reset_token', 'TEXT');
  await ensureColumn(db, 'crm_users', 'reset_token_expires', 'TEXT');
  await ensureColumn(db, 'crm_users', 'is_active', 'BOOLEAN DEFAULT TRUE');
};

const ensureOperationalSchema = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const ensureVisitsSchema = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE (year, month)
    );
  `);

  // Seed row for the current month if not exists
  await db.run(`
    INSERT OR IGNORE INTO site_visits (year, month, count)
    VALUES (CAST(strftime('%Y', 'now') AS INTEGER), CAST(strftime('%m', 'now') AS INTEGER), 0)
  `);
};

const ensureCrmCredentials = async (db) => {
  const credentialSpecs = [
    {
      email: process.env.CRM_LOGIN_EMAIL || 'admin@rutadelnido.cl',
      password: process.env.CRM_LOGIN_PASSWORD,
      role: 'admin',
      localIds: [1, 2],
    },
    {
      email: process.env.CRM_OPERATOR_EMAIL,
      password: process.env.CRM_OPERATOR_PASSWORD,
      role: 'operador',
      localIds: [1],
    },
  ].filter((item) => item.email && item.password);

  for (const spec of credentialSpecs) {
    const hash = await bcrypt.hash(spec.password, 10);
    const existing = await db.get('SELECT id FROM crm_users WHERE email = ?', [spec.email]);

    if (existing) {
      await db.run(
        'UPDATE crm_users SET password = ?, role = ?, local_ids = ? WHERE id = ?',
        [hash, spec.role, JSON.stringify(spec.localIds), existing.id]
      );
      continue;
    }

    await db.run(
      'INSERT INTO crm_users (email, password, role, local_ids) VALUES (?, ?, ?, ?)',
      [spec.email, hash, spec.role, JSON.stringify(spec.localIds)]
    );
  }
};

const pruneAnalyticsData = async (db) => {
  const retentionDays = Number(process.env.ANALYTICS_RETENTION_DAYS || 180);
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) return;

  await db.run(
    `DELETE FROM analytics_events
     WHERE datetime(created_at) < datetime('now', ?)`,
    [`-${retentionDays} days`]
  );

  await db.run(
    `DELETE FROM geo_ip_cache
     WHERE datetime(resolved_at) < datetime('now', ?)`,
    [`-${retentionDays} days`]
  );
};

export const initDb = async () => {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const dbPath = resolveDbPath();
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    dbInstance = db;

    // SQLite conectado

    // Crear tablas iniciales si no existen (Usuarios y Registro de Límites)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        service_type TEXT NOT NULL, -- 'chef' o 'orders'
        request_count INTEGER DEFAULT 0,
        last_request DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        badge TEXT,
        in_stock BOOLEAN DEFAULT 1,
        extended_description TEXT,
        nutrition TEXT, -- JSON array
        origin TEXT,
        reviews TEXT, -- JSON array
        category TEXT,
        coming_soon BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        delivery_address TEXT,
        delivery_schedule TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        product_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS crm_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'operador',
        local_ids TEXT,
        reset_token TEXT,
        reset_token_expires TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS crm_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id INTEGER,
        type TEXT,
        severity TEXT,
        message TEXT,
        status TEXT DEFAULT 'active',
        owner_user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT OR IGNORE INTO crm_users (email, password, role, local_ids) VALUES
      ('admin@rutadelnido.cl', '$2a$10$tZ2c/tO2fF3gUq/9bIn1x.rZlS7GzYX5p4BfJt8S/j/tN1U.yH0iC', 'admin', '[1, 2]');

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        source TEXT DEFAULT 'popup',
        interested_product TEXT,
        discount_code TEXT,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        plan_code TEXT,
        egg_type TEXT,
        status TEXT DEFAULT 'active',
        next_delivery_date TEXT,
        notes TEXT,
        monthly_price REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Seed products SOLO si la tabla está vacía
    const productsCount = await db.get('SELECT COUNT(*) as total FROM products');

    if (productsCount.total === 0) {
      await db.exec(`
        INSERT INTO products (id, name, category, description, price, image, badge, in_stock, extended_description, nutrition, origin, reviews) VALUES
        (8, 'Huevo Blanco Extra (Bandeja 30 un)', 'huevos',
          'Calibre Superior (61g - 68g). Yema de color intenso y clara densa para resultados gourmet.',
          6500, '/images/HUEVOS_EXTRA_TRAY.png', 'Extra Grande', 1,
          'Nuestro "Huevo Extra" se caracteriza por su gran tamaño y frescura garantizada. Con un peso de entre 61 y 68 gramos por unidad, ofrece un mayor contenido nutricional y de yema por unidad.',
          '["6.5g Proteína por huevo","Calibre 61g - 68g","Rico en Vitaminas A, D, E","Yema Naranja Natural"]',
          'Granja Ruta del Nido, Chile',
          '["El tamaño es increíble, muy frescos.","La yema es realmente naranja, como los de campo.","Excelente promoción por caja, conviene mucho."]'),

        (4, 'Queso Chanco de Lican Ray', 'quesos',
          'Queso artesanal del sur, de textura cremosa y sabor autentico.',
          4250, '/images/QUESO_LICANRAY_FINAL.jpg', 'Referencia $4.250 / 1/4 kg', 1,
          'Queso chanco artesanal producido en Lican Ray, elaborado con metodo tradicional para lograr una textura suave, cremosa y de excelente fundido. Ideal para tablas, sandwiches y cocina diaria.',
          '["359 Kcal Energía por 100g","24.0g Proteína por 100g","26.0g Grasas por 100g","Sodio: 1.8%"]',
          'Licán Ray, IX Región, Chile',
          '["El sabor del sur en mi casa, espectacular.","Muy cremoso, se nota la diferencia artesanal.","Calidad superior, 100% recomendado."]'),

        (6, 'Queso Mantecoso de Pua (Horma)', 'quesos',
          'Queso mantecoso artesanal, cremoso y de sabor intenso del sur de Chile.',
          4250, '/images/QUESO_RUEDA_FINAL.jpg', 'Referencia $4.250 / 1/4 kg', 1,
          'Queso mantecoso de Pua elaborado en lotes artesanales, con maduracion cuidada para lograr cremosidad, buena estructura al corte y sabor persistente. Excelente para compartir o elevar cualquier preparacion.',
          '["359 Kcal Energía por 100g","24.0g Proteína por 100g","Textura Cremosa","Sodio: 1.8%"]',
          'Campos del Sur de Chile',
          '["Increíble presentación y sabor único.","El favorito de la familia.","Sabor artesanal incomparable."]'),

        (7, 'Longaniza Artesanal de Contulmo (Baja en Grasa)', 'embutidos',
          'Receta tradicional española, elaborada artesanalmente en Contulmo. Sabor auténtico con menos grasa.',
          9600, '/images/LONGANIZA_CONTULMO.jpg', 'Referencia $9.600/kg', 1,
          'Nuestra famosa longaniza de Contulmo sigue una receta española centenaria. Seleccionamos cortes magros para asegurar un producto bajo en grasa pero con el característico sabor del pimentón y ajo chileno. *El precio final depende del peso exacto de la pieza.',
          '["178 Kcal por 100g","18.0g Proteína por 100g","Baja en grasas saturadas","Sin conservantes industriales"]',
          'Contulmo, Región del Biobío, Chile',
          '["La mejor longaniza que he comido, no cae pesada.","Sabor artesanal de verdad, perfecto para el asado.","Textura firme y muy poca grasa."]'),

        (2, 'Salmón porcionado 500g', 'congelados',
          'Cortes premium seleccionados. Calidad de exportación en formato práctico y congelado IQF.',
          7990, '/images/SALMON_PREMIUM_BAG.png', 'Contenido 500g', 1,
          'Porciones de salmón premium por Sea Garden. Producto seleccionado y congelado individualmente (IQF). Ideal para una cocción uniforme y frescura preservada.',
          '["21.0g Proteína por porción","138 Kcal Energía","5.9g Grasas Saludables","Sodio: 122mg"]',
          'Aguas del Sur de Chile (Puerto Montt)',
          '["La porción justa para un almuerzo saludable.","Excelente color y textura, muy fresco.","Formato muy práctico para no desperdiciar nada."]'),

        (3, 'Surtido de Mariscos Premium Mix', 'congelados',
          'Chorito, ostión, calamar, camarón y almeja. Una selección premium para transformar tu mesa en una experiencia gourmet.',
          5500, '/images/SURTIDO_MARISCOS_PREMIUM.png', 'Contenido 1kg', 1,
          'Exclusivo mix "Premium Mix" por Sea Garden. Incluye chorito, ostión, calamar, camarón y almeja. Congelado IQF para mantener frescura máxima y facilidad al repartir.',
          '["22.0g Proteína por porción","125 Kcal Energía","Solo 3.0g de Grasa","Sodio: 273mg"]',
          'Importado por Sea Garden Spa. Producto de China.',
          '["Increíble variedad para preparar una paila marina premium.","Llegaron súper limpios y muy sabrosos.","Calidad superior comparada con el retail tradicional."]'),

        (5, 'Camarón Cocido Pelado ECO', 'congelados',
          'Camarones cocidos y pelados listos para servir. El equilibrio perfecto entre sabor y conveniencia.',
          6800, '/images/CAMARON_ECO_BAG.png', 'Formato IQF', 1,
          'Camarón cocido y pelado "ECO" por Sea Garden. Formato ideal para ensaladas, ceviches o pastas rápidas. Calidad uniforme y limpieza garantizada.',
          '["18.0g Proteína por porción","78 Kcal Energía","Bajo en grasas (0.8g)","Sodio: 458mg"]',
          'Importado por Sea Garden Spa. Producto de China.',
          '["Vienen súper limpios y el tamaño es ideal.","Muy buena relación precio calidad.","Perfectos para tener siempre en el freezer."]');
      `);
    }

    await ensureUsersSchema(db);
    await ensureProductsSchema(db);
    await ensureOrdersSchema(db);
    await ensureCrmUsersSchema(db);
    await ensureNewsletterSchema(db);
    await ensureAnalyticsSchema(db);
    await ensureOperationalSchema(db);
    await ensureVisitsSchema(db);
    await ensureCrmCredentials(db);
    await pruneAnalyticsData(db);

    // Base de datos sincronizada
    return db;
  })().catch((error) => {
    dbInstance = null;
    initPromise = null;
    console.error('[DB Error]', error.message);
    throw error;
  });

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error('La base de datos no está inicializada. Llama a initDb() primero.');
  }
  return dbInstance;
};

export const closeDb = async () => {
  if (!dbInstance) return;
  await dbInstance.close();
  dbInstance = null;
  initPromise = null;
};

