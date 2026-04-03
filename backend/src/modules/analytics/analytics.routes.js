import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { getDb } from '../../config/db.js';
import { logger } from '../../lib/logger.js';
import { protectCrm } from '../../middleware/crmAuth.middleware.js';
import {
  ALLOWED_ANALYTICS_EVENTS,
  buildAnonymousId,
  buildMockGeo,
  createEventRecord,
  detectClientIp,
  hashIp,
  maskIp,
  normalizePayload,
  parseDateRange,
  resolveGeoWithProvider,
  shouldSkipTracking,
  shouldUseMockGeo,
} from './analytics.helpers.js';

const router = express.Router();

const analyticsIngressLimiter = rateLimit({
  windowMs: Number(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.ANALYTICS_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'test' ? 1_000 : 120)),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, error: 'Demasiados eventos analiticos desde esta IP' },
});

const AnalyticsEventSchema = z.object({
  eventName: z.string().min(2).max(80),
  eventId: z.string().min(8).max(120),
  sessionId: z.string().min(2).max(120).nullable(),
  anonymousId: z.string().min(8).max(120).nullable(),
  userId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).nullable(),
  pagePath: z.string().min(1).max(300),
  source: z.string().max(100).nullable(),
  referrer: z.string().max(255).nullable(),
  deviceType: z.string().max(255).nullable(),
  osName: z.string().max(120).nullable(),
  properties: z.record(z.string(), z.any()).default({}),
});

const toNumber = (value) => Number(value || 0);

const normalizeIncomingEvent = (body) => {
  const payload = normalizePayload(body.properties || body.payload || {});

  return {
    eventName: body.eventName || body.event_name,
    eventId: body.eventId || body.event_id || buildAnonymousId(),
    sessionId: body.sessionId || body.session_id || null,
    anonymousId: body.anonymousId || body.anonymous_id || buildAnonymousId(),
    userId: body.userId || body.user_id || body.customer_id || null,
    pagePath: body.pagePath || body.page_path || '/',
    source: body.source || null,
    referrer: body.referrer || null,
    deviceType: body.deviceType || body.device_type || null,
    osName: body.osName || body.os_name || null,
    properties: payload,
  };
};

const resolveGeoContext = async (db, req) => {
  const ip = detectClientIp(req);
  const ip_hash = hashIp(ip);
  const ip_masked = maskIp(ip);

  if (!ip || !ip_hash) {
    return { ip_hash: null, ip_masked: null };
  }

  const cached = await db.get(
    `SELECT country_code, country_name, region, city, latitude, longitude, provider
     FROM geo_ip_cache
     WHERE ip_hash = ?`,
    [ip_hash]
  );

  if (cached) {
    return {
      ip_hash,
      ip_masked,
      ...cached,
    };
  }

  const geo = shouldUseMockGeo() ? buildMockGeo(ip) : await resolveGeoWithProvider(ip);

  if (!geo) {
    return { ip_hash, ip_masked };
  }

  await db.run(
    `INSERT OR REPLACE INTO geo_ip_cache
      (ip_hash, ip_masked, country_code, country_name, region, city, latitude, longitude, provider, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      ip_hash,
      ip_masked,
      geo.country_code || null,
      geo.country_name || null,
      geo.region || null,
      geo.city || null,
      geo.latitude ?? null,
      geo.longitude ?? null,
      geo.provider || null,
    ]
  );

  return {
    ip_hash,
    ip_masked,
    ...geo,
  };
};

const buildWhereClause = (query) => {
  const filters = [];
  const params = [];
  const dateRange = parseDateRange(query);

  if (dateRange.clause) {
    filters.push(dateRange.clause.replace(/^WHERE /, ''));
    params.push(...dateRange.params);
  }

  if (query.event_name) {
    filters.push('event_name = ?');
    params.push(query.event_name);
  }

  if (query.country_code) {
    filters.push('country_code = ?');
    params.push(query.country_code);
  }

  if (query.city) {
    filters.push('city = ?');
    params.push(query.city);
  }

  if (query.page_path) {
    filters.push('page_path = ?');
    params.push(query.page_path);
  }

  if (query.source) {
    filters.push('source = ?');
    params.push(query.source);
  }

  if (query.product_id) {
    filters.push(`CAST(COALESCE(json_extract(payload, '$.product_id'), json_extract(meta_data, '$.product_id')) AS TEXT) = ?`);
    params.push(String(query.product_id));
  }

  return {
    clause: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    params,
  };
};

router.post('/events', analyticsIngressLimiter, async (req, res) => {
  try {
    const db = getDb();
    const normalized = normalizeIncomingEvent(req.body || {});
    const parsed = AnalyticsEventSchema.safeParse(normalized);

    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Payload analitico invalido', details: parsed.error.flatten() });
    }

    const body = parsed.data;
    if (!ALLOWED_ANALYTICS_EVENTS.has(body.eventName)) {
      return res.status(400).json({ success: false, error: 'Evento analitico no permitido' });
    }

    const trackingGate = shouldSkipTracking(req);
    if (trackingGate.skip) {
      return res.status(202).json({ success: true, skipped: true, reason: trackingGate.reason });
    }

    const maxPayloadBytes = Number(process.env.ANALYTICS_PAYLOAD_MAX_BYTES || 4096);
    const payloadText = JSON.stringify(body.properties || {});
    if (Buffer.byteLength(payloadText, 'utf8') > maxPayloadBytes) {
      return res.status(400).json({ success: false, error: 'Payload analitico excede el tamano permitido' });
    }

    const geo = await resolveGeoContext(db, req);
    const record = createEventRecord({
      req,
      body,
      geo,
      payload: body.properties || {},
    });

    await db.run(
      `INSERT INTO analytics_events (
        event_name, event_id, user_id, session_id, anonymous_id, page_path, source, referrer,
        device_type, os_name, ip_hash, ip_masked, country_code, country_name, region, city,
        latitude, longitude, meta_data, payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.event_name,
        record.event_id,
        record.user_id,
        record.session_id,
        record.anonymous_id,
        record.page_path,
        record.source,
        record.referrer,
        record.device_type,
        record.os_name,
        record.ip_hash,
        record.ip_masked,
        record.country_code,
        record.country_name,
        record.region,
        record.city,
        record.latitude,
        record.longitude,
        record.meta_data,
        record.payload,
      ]
    );

    res.status(201).json({ success: true, event_id: record.event_id });
  } catch (error) {
    logger.warn({ err: error, route: '/api/analytics/events' }, '[Analytics] Error interno en tracking');
    res.status(200).json({ success: false, note: 'Error interno en tracking' });
  }
});

router.get('/summary', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const [summary, topProducts, topPages] = await Promise.all([
      db.get(
        `SELECT
          COUNT(*) AS total_events,
          COUNT(DISTINCT COALESCE(session_id, anonymous_id)) AS unique_sessions,
          COUNT(DISTINCT user_id) AS known_users,
          COUNT(CASE WHEN event_name = 'create_account' THEN 1 END) AS accounts_created,
          COUNT(CASE WHEN event_name = 'ai_interaction' THEN 1 END) AS ai_interactions
         FROM analytics_events
         ${where.clause}`,
        where.params
      ),
      db.all(
        `SELECT
          COALESCE(json_extract(payload, '$.product_name'), json_extract(meta_data, '$.product_name'), 'Producto sin nombre') AS product_name,
          COUNT(*) AS total
         FROM analytics_events
         ${where.clause ? `${where.clause} AND` : 'WHERE'} event_name = 'view_product'
         GROUP BY product_name
         ORDER BY total DESC
         LIMIT 10`,
        where.params
      ),
      db.all(
        `SELECT page_path, COUNT(*) AS total
         FROM analytics_events
         ${where.clause}
         GROUP BY page_path
         ORDER BY total DESC
         LIMIT 10`,
        where.params
      ),
    ]);

    res.json({
      success: true,
      summary: {
        total_events: toNumber(summary.total_events),
        unique_sessions: toNumber(summary.unique_sessions),
        known_users: toNumber(summary.known_users),
        accounts_created: toNumber(summary.accounts_created),
        ai_interactions: toNumber(summary.ai_interactions),
        top_products: topProducts.map((row) => ({ product_name: row.product_name, total: toNumber(row.total) })),
        top_pages: topPages.map((row) => ({ page_path: row.page_path || '/', total: toNumber(row.total) })),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/geo', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const [byCountry, byCity] = await Promise.all([
      db.all(
        `SELECT country_code, country_name, COUNT(*) AS total
         FROM analytics_events
         ${where.clause}
         GROUP BY country_code, country_name
         ORDER BY total DESC`,
        where.params
      ),
      db.all(
        `SELECT country_code, country_name, region, city, latitude, longitude, COUNT(*) AS total
         FROM analytics_events
         ${where.clause}
         GROUP BY country_code, country_name, region, city, latitude, longitude
         ORDER BY total DESC`,
        where.params
      ),
    ]);

    res.json({
      success: true,
      geo: {
        countries: byCountry.map((row) => ({
          country_code: row.country_code,
          country_name: row.country_name,
          total: toNumber(row.total),
        })),
        cities: byCity.map((row) => ({
          country_code: row.country_code,
          country_name: row.country_name,
          region: row.region,
          city: row.city,
          latitude: row.latitude,
          longitude: row.longitude,
          total: toNumber(row.total),
        })),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/pages', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const pages = await db.all(
      `SELECT page_path, COUNT(*) AS total
       FROM analytics_events
       ${where.clause}
       GROUP BY page_path
       ORDER BY total DESC
       LIMIT 100`,
      where.params
    );

    res.json({
      success: true,
      pages: pages.map((row) => ({ page_path: row.page_path || '/', total: toNumber(row.total) })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const products = await db.all(
      `SELECT
        COALESCE(json_extract(payload, '$.product_id'), json_extract(meta_data, '$.product_id')) AS product_id,
        COALESCE(json_extract(payload, '$.product_name'), json_extract(meta_data, '$.product_name'), 'Producto sin nombre') AS product_name,
        COUNT(*) AS total
       FROM analytics_events
       ${where.clause ? `${where.clause} AND` : 'WHERE'} event_name = 'view_product'
       GROUP BY product_id, product_name
       ORDER BY total DESC
       LIMIT 100`,
      where.params
    );

    res.json({
      success: true,
      products: products.map((row) => ({
        product_id: row.product_id,
        product_name: row.product_name,
        total: toNumber(row.total),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/heatmap', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const [geoRows, pageRows] = await Promise.all([
      db.all(
        `SELECT latitude, longitude, city, region, country_code, COUNT(*) AS intensity
         FROM analytics_events
         ${where.clause ? `${where.clause} AND` : 'WHERE'} latitude IS NOT NULL AND longitude IS NOT NULL
         GROUP BY latitude, longitude, city, region, country_code
         ORDER BY intensity DESC`,
        where.params
      ),
      db.all(
        `SELECT page_path, COUNT(*) AS intensity
         FROM analytics_events
         ${where.clause}
         GROUP BY page_path
         ORDER BY intensity DESC`,
        where.params
      ),
    ]);

    res.json({
      success: true,
      heatmap: {
        geographic: geoRows.map((row) => ({
          latitude: row.latitude,
          longitude: row.longitude,
          city: row.city,
          region: row.region,
          country_code: row.country_code,
          intensity: toNumber(row.intensity),
        })),
        pages: pageRows.map((row) => ({
          page_path: row.page_path || '/',
          intensity: toNumber(row.intensity),
        })),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/events', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const where = buildWhereClause(req.query);
    const limit = Math.min(Number(req.query.limit || 100), 250);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const totalRow = await db.get(
      `SELECT COUNT(*) AS total
       FROM analytics_events
       ${where.clause}`,
      where.params
    );
    const rows = await db.all(
      `SELECT id, event_name, event_id, user_id, session_id, anonymous_id, page_path, source, referrer,
              device_type, os_name, ip_masked, country_code, country_name, region, city,
              latitude, longitude, payload, created_at
       FROM analytics_events
       ${where.clause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...where.params, limit, offset]
    );

    res.json({
      success: true,
      pagination: {
        total: toNumber(totalRow?.total),
        limit,
        offset,
      },
      events: rows.map((row) => ({
        ...row,
        payload: (() => {
          try {
            return row.payload ? JSON.parse(row.payload) : {};
          } catch {
            return {};
          }
        })(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUBLIC: Contador de visitas ─────────────────────────────────────────────
// Rate limit dedicado, más permisivo (es solo un ping)
const visitsLimiter = rateLimit({
  windowMs: 60_000,
  max: process.env.NODE_ENV === 'test' ? 1_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, error: 'Demasiadas solicitudes al contador de visitas' },
});

/**
 * GET /api/analytics/visits
 * Retorna el conteo del mes actual y el total histórico.
 * Público, sin autenticación.
 */
router.get('/visits', async (_req, res, next) => {
  try {
    const db = getDb();
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const [monthly, historic] = await Promise.all([
      db.get(
        `SELECT count FROM site_visits WHERE year = ? AND month = ?`,
        [year, month]
      ),
      db.get(`SELECT COALESCE(SUM(count), 0) AS total FROM site_visits`),
    ]);

    res.json({
      success: true,
      monthly: Number(monthly?.count ?? 0),
      total: Number(historic?.total ?? 0),
      period: { year, month },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/visits/ping
 * Incrementa el contador del mes actual en 1.
 * Público — el anti-inflado se maneja en el frontend con sessionStorage.
 */
router.post('/visits/ping', visitsLimiter, async (_req, res, next) => {
  try {
    const db = getDb();
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    await db.run(
      `INSERT INTO site_visits (year, month, count)
       VALUES (?, ?, 1)
       ON CONFLICT (year, month) DO UPDATE SET count = count + 1`,
      [year, month]
    );

    const row = await db.get(
      `SELECT count FROM site_visits WHERE year = ? AND month = ?`,
      [year, month]
    );

    res.status(201).json({ success: true, count: Number(row?.count ?? 1) });
  } catch (error) {
    next(error);
  }
});

export default router;
