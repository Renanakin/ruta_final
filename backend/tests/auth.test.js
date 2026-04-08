/**
 * Tests de integracion - Modulo de Autenticacion
 *
 * Cubre los flujos criticos:
 * 1. Registro de usuario
 * 2. Login (con y sin verificacion de email)
 * 3. Cookie httpOnly para sesion cliente
 * 4. Forgot password
 * 5. Reset password
 * 6. Validaciones de entrada
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { closeDb, initDb, getDb } from '../src/config/db.js';
import authRoutes from '../src/modules/auth/auth.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
    return app;
};

let app;
let db;

const TEST_EMAIL = `test_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test1234!';
const TEST_NAME = 'Usuario Test';

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
    process.env.NODE_ENV = 'test';
    process.env.APP_BASE_URL = 'http://localhost:5173';
    await initDb();
    db = getDb();
    app = createTestApp();
});

afterAll(async () => {
    await db.run('DELETE FROM users WHERE email LIKE ?', ['test_%@test.com']);
    await closeDb();
});

describe('POST /api/auth/register', () => {
    it('debe rechazar registro sin email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ password: TEST_PASSWORD, full_name: TEST_NAME });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('debe rechazar contrasena menor a 8 caracteres', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: TEST_EMAIL, password: '123', full_name: TEST_NAME });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('debe crear un usuario valido correctamente', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD, full_name: TEST_NAME });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('Revisa tu correo');
        expect(res.body.token).toBeUndefined();
    });

    it('debe rechazar email duplicado', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD, full_name: TEST_NAME });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('registrado');
    });
});

describe('POST /api/auth/login', () => {
    it('debe rechazar login de cuenta sin verificar', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
        expect(res.status).toBe(403);
        expect(res.body.error).toContain('verificar tu correo');
    });

    it('debe rechazar credenciales incorrectas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('debe permitir login de cuenta verificada manualmente y emitir cookie', async () => {
        await db.run('UPDATE users SET email_verified = TRUE WHERE email = ?', [TEST_EMAIL]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(TEST_EMAIL);
        expect(res.body.user.email_verified).toBe(true);
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('rdn_auth_token=')]));
        expect(JSON.stringify(res.body)).not.toContain('password');

        await db.run('UPDATE users SET email_verified = FALSE WHERE email = ?', [TEST_EMAIL]);
    });

    it('debe rechazar email que no existe', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@test.com', password: TEST_PASSWORD });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/auth/me', () => {
    it('debe aceptar cookie httpOnly emitida en login', async () => {
        await db.run('UPDATE users SET email_verified = TRUE WHERE email = ?', [TEST_EMAIL]);

        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

        const cookies = login.headers['set-cookie'];
        expect(cookies).toBeDefined();

        const me = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookies);

        expect(me.status).toBe(200);
        expect(me.body.success).toBe(true);
        expect(me.body.user.email).toBe(TEST_EMAIL);
    });
});

describe('GET /api/auth/verify-email', () => {
    it('debe rechazar token sin parametro', async () => {
        const res = await request(app).get('/api/auth/verify-email');
        expect(res.status).toBe(400);
    });

    it('debe rechazar token invalido', async () => {
        const res = await request(app)
            .get('/api/auth/verify-email')
            .query({ token: 'token_invalido_falso' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /api/auth/forgot-password', () => {
    it('debe responder 200 aunque el email no exista (seguridad)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'noexiste@rutadelnido.cl' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('debe responder 400 si no se envia email', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({});
        expect(res.status).toBe(400);
    });

    it('debe procesar forgot-password para email existente', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: TEST_EMAIL });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('POST /api/auth/reset-password', () => {
    it('debe rechazar si faltan campos', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'abc', password: 'Nueva1234!' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('requeridos');
    });

    it('debe rechazar si las contrasenas no coinciden', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'abc', password: 'Nueva1234!', confirmPassword: 'Diferente1234!' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('no coinciden');
    });

    it('debe rechazar token invalido', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({ token: 'token_invalido', password: 'Nueva1234!', confirmPassword: 'Nueva1234!' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Token de restablecimiento');
    });
});

describe('POST /api/auth/logout', () => {
    it('debe responder 200 y limpiar la cookie', async () => {
        const res = await request(app).post('/api/auth/logout');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.headers['set-cookie']).toEqual(expect.arrayContaining([expect.stringContaining('Max-Age=0')]));
    });
});
