import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { closeDb, initDb, getDb } from '../src/config/db.js';
import authRoutes from '../src/modules/auth/auth.routes.js';
import cartRoutes from '../src/modules/cart/cart.routes.js';
import customerRoutes from '../src/modules/user/user.routes.js';
import crmRoutes from '../src/modules/crm/crm.routes.js';
import analyticsRoutes from '../src/modules/analytics/analytics.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/customer', customerRoutes);
    app.use('/api/crm', crmRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use(errorHandler);
    return app;
};

let app;
let db;
let token;
let testProduct;
const TEST_EMAIL = `cart_crm_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test1234!';

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
    process.env.NODE_ENV = 'test';
    process.env.APP_BASE_URL = 'http://localhost:5173';
    process.env.CRM_LOGIN_EMAIL = 'administrador@rutadelnido.cl';
    process.env.CRM_LOGIN_PASSWORD = 'RutaDelNido_Admin_2026#n';
    process.env.CRM_OPERATOR_EMAIL = 'rutero@rutadelnido.cl';
    process.env.CRM_OPERATOR_PASSWORD = 'Operador_Nido_2026!n';

    await initDb();
    db = getDb();
    app = createTestApp();
    testProduct = await db.get('SELECT id, name FROM products WHERE in_stock = 1 ORDER BY id ASC LIMIT 1');

    await request(app)
        .post('/api/auth/register')
        .send({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            full_name: 'Cart CRM Test',
            phone: '123456789'
        });

    await db.run('UPDATE users SET email_verified = TRUE WHERE email = ?', [TEST_EMAIL]);

    const login = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    token = login.body.token;
});

afterAll(async () => {
    await db.run('DELETE FROM analytics_events WHERE session_id = ?', ['crm-test-session']);
    await db.run('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = ?))', [TEST_EMAIL]);
    await db.run('DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [TEST_EMAIL]);
    await db.run('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [TEST_EMAIL]);
    await db.run('DELETE FROM subscriptions WHERE user_id IN (SELECT id FROM users WHERE email = ?)', [TEST_EMAIL]);
    await db.run('DELETE FROM users WHERE email = ?', [TEST_EMAIL]);
    await closeDb();
});

describe('Cart and Checkout', () => {
    it('agrega productos al carrito con upsert, permite PATCH y genera checkout atomico con resumen util', async () => {
        const headers = { Authorization: `Bearer ${token}` };

        const addFirst = await request(app)
            .post('/api/cart/items')
            .set(headers)
            .send({ product_id: testProduct.id, quantity: 1 });
        expect(addFirst.status).toBe(200);
        expect(addFirst.body.items).toHaveLength(1);
        expect(addFirst.body.items[0].quantity).toBe(1);
        expect(addFirst.body.items[0].id).toBeDefined();

        const addSecond = await request(app)
            .post('/api/cart/items')
            .set(headers)
            .send({ product_id: testProduct.id, quantity: 2 });
        expect(addSecond.status).toBe(200);
        expect(addSecond.body.items[0].quantity).toBe(3);

        const patchQuantity = await request(app)
            .patch(`/api/cart/items/${addSecond.body.items[0].id}`)
            .set(headers)
            .send({ quantity: 2 });
        expect(patchQuantity.status).toBe(200);
        expect(patchQuantity.body.items[0].quantity).toBe(2);

        const checkout = await request(app)
            .post('/api/cart/checkout')
            .set(headers)
            .send({
                delivery_schedule: 'manana AM',
                delivery_address: 'Av. Test 123',
                notes: 'checkout test'
            });
        expect(checkout.status).toBe(200);
        expect(checkout.body.order_id).toBeDefined();
        expect(checkout.body.orders_count).toBe(1);

        const cartAfter = await request(app)
            .get('/api/cart')
            .set(headers);
        expect(cartAfter.status).toBe(200);
        expect(cartAfter.body.items).toHaveLength(0);

        const orders = await request(app)
            .get('/api/customer/orders')
            .set(headers);
        expect(orders.status).toBe(200);
        expect(orders.body.orders.length).toBeGreaterThan(0);
        expect(orders.body.orders[0].quantity).toBe(2);
        expect(orders.body.orders[0].product_name).toBe(testProduct.name);
    });

    it('permite actualizar suscripciones con PATCH para mantener compatibilidad con el frontend publico', async () => {
        const headers = { Authorization: `Bearer ${token}` };

        const createSubscription = await request(app)
            .post('/api/customer/subscription')
            .set(headers)
            .send({
                plan_code: 'home_chef',
                egg_type: 'gallina_libre',
                status: 'active',
                next_delivery_date: '2026-03-25',
                notes: 'inicio'
            });

        expect(createSubscription.status).toBe(201);

        const updateSubscription = await request(app)
            .patch(`/api/customer/subscription/${createSubscription.body.subscription.id}`)
            .set(headers)
            .send({
                plan_code: 'home_chef',
                egg_type: 'gallina_libre',
                status: 'paused',
                next_delivery_date: '2026-03-30',
                notes: 'actualizada desde patch'
            });

        expect(updateSubscription.status).toBe(200);
        expect(updateSubscription.body.subscription.status).toBe('paused');
        expect(updateSubscription.body.subscription.notes).toBe('actualizada desde patch');
    });
});

describe('CRM and Reporting', () => {
    it('permite login CRM y expone reportes reales', async () => {
        await request(app)
            .post('/api/analytics/events')
            .send({
                eventName: 'view_product',
                sessionId: 'crm-test-session',
                properties: { source: 'test' }
            });

        const crmLogin = await request(app)
            .post('/api/crm/login')
            .send({
                email: 'administrador@rutadelnido.cl',
                password: 'RutaDelNido_Admin_2026#n'
            });

        expect(crmLogin.status).toBe(200);
        const crmToken = crmLogin.body.token;
        const crmHeaders = { Authorization: `Bearer ${crmToken}` };

        const customerTokenInCrm = await request(app)
            .get('/api/crm/me')
            .set({ Authorization: `Bearer ${token}` });
        expect(customerTokenInCrm.status).toBe(401);

        const crmTokenInCustomer = await request(app)
            .get('/api/cart')
            .set(crmHeaders);
        expect(crmTokenInCustomer.status).toBe(401);

        const executive = await request(app)
            .get('/api/crm/reports/executive-weekly')
            .set(crmHeaders);
        expect(executive.status).toBe(200);
        expect(executive.body.report.total_orders).toBeGreaterThanOrEqual(1);

        const auditStats = await request(app)
            .get('/api/crm/audit-stats')
            .set(crmHeaders);
        expect(auditStats.status).toBe(200);
        expect(auditStats.body.stats.total_events).toBeGreaterThanOrEqual(1);

        const funnel = await request(app)
            .get('/api/crm/funnel')
            .set(crmHeaders);
        expect(funnel.status).toBe(200);
        expect(funnel.body.funnel.stages.view_product).toBeGreaterThanOrEqual(1);

        const passwordRequest = await request(app)
            .post('/api/crm/password/request')
            .send({});
        expect(passwordRequest.status).toBe(400);
    });
});
