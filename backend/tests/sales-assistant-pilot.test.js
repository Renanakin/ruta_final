import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initDb, closeDb, getDb } from '../src/config/db.js';
import { createAiRoutes } from '../src/modules/ai/ai.routes.js';
import crmRoutes from '../src/modules/crm/crm.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', createAiRoutes());
  app.use('/api/crm', crmRoutes);
  app.use(errorHandler);
  return app;
};

let app;
let db;
let crmToken;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
  process.env.CRM_LOGIN_EMAIL = 'administrador@rutadelnido.cl';
  process.env.CRM_LOGIN_PASSWORD = 'RutaDelNido_Admin_2026#ñ';

  await initDb();
  db = getDb();
  app = createTestApp();

  const crmLogin = await request(app)
    .post('/api/crm/login')
    .send({
      email: 'administrador@rutadelnido.cl',
      password: 'RutaDelNido_Admin_2026#ñ',
    });

  crmToken = crmLogin.body.token;
});

beforeEach(async () => {
  await db.run(
    `UPDATE sales_assistant_pilot_config
     SET enabled = 0, rollout_percentage = 0, allowlist_enabled = 0, allowlist_tokens = '[]',
         qa_force_enabled = 1, page_scope = 'product_only', notes = '', updated_by = 'test', updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  );
});

afterAll(async () => {
  await closeDb();
});

describe('Sales assistant pilot', () => {
  it('bloquea por default y habilita desde CRM admin', async () => {
    const headers = { Authorization: `Bearer ${crmToken}` };

    const current = await request(app)
      .get('/api/crm/sales-assistant/pilot')
      .set(headers);

    expect(current.status).toBe(200);
    expect(current.body.config.enabled).toBe(false);
    expect(current.body.config.rollout_percentage).toBe(0);

    const updated = await request(app)
      .put('/api/crm/sales-assistant/pilot')
      .set(headers)
      .send({
        enabled: true,
        rollout_percentage: 100,
        allowlist_enabled: true,
        allowlist_tokens: ['qa-equipo'],
        qa_force_enabled: true,
        page_scope: 'product_only',
        notes: 'Piloto total en producto',
      });

    expect(updated.status).toBe(200);
    expect(updated.body.config.enabled).toBe(true);
    expect(updated.body.config.rollout_percentage).toBe(100);
    expect(updated.body.config.allowlist_tokens).toContain('qa-equipo');
  });

  it('evalua elegibilidad por page scope, rollout, allowlist y qa force', async () => {
    const headers = { Authorization: `Bearer ${crmToken}` };

    await request(app)
      .put('/api/crm/sales-assistant/pilot')
      .set(headers)
      .send({
        enabled: true,
        rollout_percentage: 0,
        allowlist_enabled: true,
        allowlist_tokens: ['qa-equipo'],
        qa_force_enabled: true,
        page_scope: 'product_only',
        notes: 'Piloto acotado',
      });

    const blockedByScope = await request(app)
      .post('/api/ai/sales/pilot/eligibility')
      .send({
        sessionId: 'session_scope_block',
        pagePath: '/',
        currentProductId: null,
      });

    expect(blockedByScope.status).toBe(200);
    expect(blockedByScope.body.data.eligible).toBe(false);
    expect(blockedByScope.body.data.reason).toBe('page_scope');

    const allowlisted = await request(app)
      .post('/api/ai/sales/pilot/eligibility')
      .send({
        sessionId: 'session_allowlist',
        pagePath: '/producto/huevos',
        currentProductId: 8,
        previewToken: 'qa-equipo',
      });

    expect(allowlisted.status).toBe(200);
    expect(allowlisted.body.data.eligible).toBe(true);
    expect(allowlisted.body.data.reason).toBe('allowlist');

    const qaForced = await request(app)
      .post('/api/ai/sales/pilot/eligibility')
      .send({
        sessionId: 'session_qa_force',
        pagePath: '/producto/huevos',
        currentProductId: 8,
        previewMode: 'force',
      });

    expect(qaForced.status).toBe(200);
    expect(qaForced.body.data.eligible).toBe(true);
    expect(qaForced.body.data.reason).toBe('qa_force');

    await request(app)
      .put('/api/crm/sales-assistant/pilot')
      .set(headers)
      .send({
        enabled: true,
        rollout_percentage: 100,
        allowlist_enabled: false,
        allowlist_tokens: [],
        qa_force_enabled: false,
        page_scope: 'all',
        notes: 'Piloto abierto',
      });

    const rolloutEligible = await request(app)
      .post('/api/ai/sales/pilot/eligibility')
      .send({
        sessionId: 'session_rollout_full',
        pagePath: '/',
        currentProductId: null,
      });

    expect(rolloutEligible.status).toBe(200);
    expect(rolloutEligible.body.data.eligible).toBe(true);
    expect(rolloutEligible.body.data.reason).toBe('rollout');
  });
});
