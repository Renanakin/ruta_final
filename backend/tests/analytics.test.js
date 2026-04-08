import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { closeDb, initDb, getDb } from '../src/config/db.js';
import analyticsRoutes from '../src/modules/analytics/analytics.routes.js';
import crmRoutes from '../src/modules/crm/crm.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const TEST_SESSION_ID = `analytics_test_${Date.now()}`;

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/crm', crmRoutes);
  app.use(errorHandler);
  return app;
};

let app;
let db;
let crmToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
  process.env.NODE_ENV = 'test';
  process.env.ANALYTICS_GEO_MODE = 'mock';
  process.env.CRM_LOGIN_EMAIL = 'administrador@rutadelnido.cl';
  process.env.CRM_LOGIN_PASSWORD = 'RutaDelNido_Admin_2026#ñ';
  process.env.CRM_OPERATOR_EMAIL = 'rutero@rutadelnido.cl';
  process.env.CRM_OPERATOR_PASSWORD = 'Operador_Nido_2026!ñ';

  await initDb();
  db = getDb();
  app = createTestApp();

  const crmLogin = await request(app)
    .post('/api/crm/login')
    .send({
      email: 'administrador@rutadelnido.cl',
      password: 'RutaDelNido_Admin_2026#ñ'
    });

  crmToken = crmLogin.body.token;
});

afterAll(async () => {
  await db.run('DELETE FROM analytics_events WHERE session_id = ?', [TEST_SESSION_ID]);
  await db.run('DELETE FROM geo_ip_cache');
  await closeDb();
});

describe('Analytics ingestion and aggregates', () => {
  it('guarda eventos enriquecidos con geo mock', async () => {
    const response = await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'page_view',
        eventId: `evt_${Date.now()}`,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/catalogo',
        source: 'landing',
        properties: {
          area: 'landing'
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const saved = await db.get(
      `SELECT event_name, page_path, ip_hash, country_code, city
       FROM analytics_events
       WHERE session_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [TEST_SESSION_ID]
    );

    expect(saved.event_name).toBe('page_view');
    expect(saved.page_path).toBe('/catalogo');
    expect(saved.ip_hash).toBeTruthy();
    expect(saved.country_code).toBe('CL');
    expect(saved.city).toBeTruthy();
  });

  it('expone summary, geo y heatmap para CRM autenticado', async () => {
    await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'view_product',
        eventId: `evt_product_${Date.now()}`,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/catalogo',
        source: 'landing',
        properties: {
          product_id: 1,
          product_name: 'Huevo Blanco Extra'
        }
      });

    const headers = { Authorization: `Bearer ${crmToken}` };

    const summary = await request(app)
      .get('/api/analytics/summary')
      .set(headers);
    expect(summary.status).toBe(200);
    expect(summary.body.summary.total_events).toBeGreaterThanOrEqual(2);
    expect(summary.body.summary.top_products[0].product_name).toBe('Huevo Blanco Extra');

    const geo = await request(app)
      .get('/api/analytics/geo')
      .set(headers);
    expect(geo.status).toBe(200);
    expect(geo.body.geo.countries[0].country_code).toBe('CL');

    const heatmap = await request(app)
      .get('/api/analytics/heatmap')
      .set(headers);
    expect(heatmap.status).toBe(200);
    expect(heatmap.body.heatmap.geographic.length).toBeGreaterThanOrEqual(1);
    expect(heatmap.body.heatmap.pages.length).toBeGreaterThanOrEqual(1);
  });

  it('filtra productos por product_id y pagina eventos con offset', async () => {
    const firstEventId = `evt_filter_a_${Date.now()}`;
    const secondEventId = `evt_filter_b_${Date.now() + 1}`;

    await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'view_product',
        eventId: firstEventId,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/catalogo?sku=1',
        source: 'landing',
        properties: {
          product_id: 1,
          product_name: 'Huevo Blanco Extra',
        }
      });

    await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'view_product',
        eventId: secondEventId,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/catalogo?sku=2',
        source: 'landing',
        properties: {
          product_id: 2,
          product_name: 'Gallina Libre (Happy Eggs)',
        }
      });

    const headers = { Authorization: `Bearer ${crmToken}` };

    const filteredProducts = await request(app)
      .get('/api/analytics/products?product_id=2')
      .set(headers);

    expect(filteredProducts.status).toBe(200);
    expect(filteredProducts.body.products).toHaveLength(1);
    expect(filteredProducts.body.products[0].product_id).toBe(2);
    expect(filteredProducts.body.products[0].product_name).toBe('Gallina Libre (Happy Eggs)');

    const filteredEvents = await request(app)
      .get('/api/analytics/events?product_id=2&limit=1&offset=0')
      .set(headers);

    expect(filteredEvents.status).toBe(200);
    expect(filteredEvents.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(filteredEvents.body.pagination.limit).toBe(1);
    expect(filteredEvents.body.pagination.offset).toBe(0);
    expect(filteredEvents.body.events).toHaveLength(1);
    expect(filteredEvents.body.events[0].event_id).toBe(secondEventId);

    const pagedEvents = await request(app)
      .get('/api/analytics/events?limit=1&offset=1')
      .set(headers);

    expect(pagedEvents.status).toBe(200);
    expect(pagedEvents.body.pagination.limit).toBe(1);
    expect(pagedEvents.body.pagination.offset).toBe(1);
    expect(pagedEvents.body.events).toHaveLength(1);
  });

  it('filtra analytics por source y event_name', async () => {
    const eventId = `evt_source_filter_${Date.now()}`;

    await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'newsletter_subscribe',
        eventId,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/newsletter',
        source: 'popup',
        properties: {
          email_domain: 'example.com',
        }
      });

    const headers = { Authorization: `Bearer ${crmToken}` };

    const summary = await request(app)
      .get('/api/analytics/summary?source=popup&event_name=newsletter_subscribe')
      .set(headers);

    expect(summary.status).toBe(200);
    expect(summary.body.summary.total_events).toBeGreaterThanOrEqual(1);

    const pages = await request(app)
      .get('/api/analytics/pages?source=popup&event_name=newsletter_subscribe')
      .set(headers);

    expect(pages.status).toBe(200);
    expect(pages.body.pages[0].page_path).toBe('/newsletter');

    const events = await request(app)
      .get('/api/analytics/events?source=popup&event_name=newsletter_subscribe')
      .set(headers);

    expect(events.status).toBe(200);
    expect(events.body.events.length).toBeGreaterThanOrEqual(1);
    expect(events.body.events[0].source).toBe('popup');
    expect(events.body.events[0].event_name).toBe('newsletter_subscribe');
  });

  it('acepta ai_unlock para observabilidad del alquimista', async () => {
    const response = await request(app)
      .post('/api/analytics/events')
      .set('x-forwarded-for', '181.43.22.11')
      .send({
        eventName: 'ai_unlock',
        eventId: `evt_ai_unlock_${Date.now()}`,
        sessionId: TEST_SESSION_ID,
        anonymousId: 'anon-test-12345678',
        pagePath: '/alquimista',
        source: 'landing',
        properties: {
          channel: 'alquimista',
          method: 'access_code',
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
