import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '../../config/db.js';
import { signToken } from '../../lib/jwt.js';
import { logger } from '../../lib/logger.js';
import {
    sendVerificationEmail,
    sendCustomerPasswordResetEmail,
} from '../../../services/email.js';

// ─── Helpers internos ──────────────────────────────────────────────────────

const hashPassword = (plain) => bcrypt.hash(plain, 10);
const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

/**
 * Genera un token aleatorio seguro y su versión hasheada para la BD.
 * @returns {{ raw: string, hashed: string, expires: Date }}
 */
const generateSecureToken = (expiresInMs = 24 * 60 * 60 * 1000) => {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    const expires = new Date(Date.now() + expiresInMs);
    return { raw, hashed, expires };
};

// ─── Servicios exportados ──────────────────────────────────────────────────

/**
 * Registra un nuevo usuario:
 * 1. Verifica que el email no exista.
 * 2. Hashea la contraseña.
 * 3. Genera token de verificación de email.
 * 4. Inserta el usuario en la BD.
 * 5. Envía email de verificación.
 * @returns {{ message: string }}
 */
export const registerUser = async ({ email, password, full_name, phone }) => {
    const db = getDb();

    const exists = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) {
        const err = new Error('El email ya está registrado');
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await hashPassword(password);
    const { raw: rawToken, hashed: hashedToken, expires } = generateSecureToken();

    await db.run(
        `INSERT INTO users (email, password, full_name, phone, email_verified, verification_token, verification_token_expires)
         VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
        [email, hashedPassword, full_name, phone ?? null, hashedToken, expires.toISOString()]
    );

    // Intentar envío de email. Si falla, el usuario fue creado de todos modos
    // y se puede reenviar desde /resend-verification.
    try {
        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
        await sendVerificationEmail(email, rawToken, appBaseUrl);
        logger.info({ email }, 'Email de verificación enviado');
    } catch (emailErr) {
        logger.error({ err: emailErr, email }, 'Fallo al enviar email de verificación');
    }

    return {
        message: `Cuenta creada. Revisa tu correo ${email} para activarla.`,
    };
};

/**
 * Verifica el email de un usuario usando el token del link.
 * @returns {{ token: string, user: object }}
 */
export const verifyEmail = async (rawToken) => {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const db = getDb();

    const user = await db.get(
        `SELECT id, email, full_name, phone FROM users
         WHERE verification_token = ? AND email_verified = FALSE`,
        [hashedToken]
    );

    if (!user) {
        const err = new Error('Token inválido o ya utilizado');
        err.statusCode = 400;
        throw err;
    }

    const row = await db.get('SELECT verification_token_expires FROM users WHERE id = ?', [user.id]);
    if (new Date(row.verification_token_expires) < new Date()) {
        const err = new Error('El enlace de verificación ha expirado. Solicita uno nuevo.');
        err.statusCode = 400;
        throw err;
    }

    await db.run(
        `UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL
         WHERE id = ?`,
        [user.id]
    );

    logger.info({ userId: user.id, email: user.email }, 'Email verificado correctamente');

    return {
        token: signToken({ id: user.id }),
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            email_verified: true,
        },
    };
};

/**
 * Inicia sesión de un usuario.
 * Valida credenciales y que el email esté verificado.
 * @returns {{ token: string, user: object }}
 */
export const loginUser = async ({ email, password }) => {
    const db = getDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        const err = new Error('Credenciales inválidas');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const err = new Error('Credenciales inválidas');
        err.statusCode = 401;
        throw err;
    }

    if (!user.email_verified) {
        const err = new Error('Debes verificar tu correo antes de acceder. Revisa tu bandeja de entrada.');
        err.statusCode = 403;
        throw err;
    }

    logger.info({ userId: user.id, email: user.email }, 'Login exitoso');

    return {
        token: signToken({ id: user.id }),
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            email_verified: Boolean(user.email_verified),
        },
    };
};

/**
 * Inicia el flujo de recuperación de contraseña.
 * Genera un token de reset y envía el email.
 * Siempre responde 200 para no revelar si el email existe.
 */
export const forgotPassword = async (email) => {
    const db = getDb();
    const user = await db.get('SELECT id, email FROM users WHERE email = ?', [email]);

    if (!user) {
        // Respuesta genérica: no revelar si el email existe
        logger.warn({ email }, 'Forgot password solicitado para email no existente');
        return;
    }

    const { raw: rawToken, hashed: hashedToken, expires } = generateSecureToken(60 * 60 * 1000); // 1h

    await db.run(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [hashedToken, expires.toISOString(), user.id]
    );

    try {
        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
        await sendCustomerPasswordResetEmail(email, rawToken, appBaseUrl);
        logger.info({ userId: user.id, email }, 'Email de reset de contraseña enviado');
    } catch (emailErr) {
        logger.error({ err: emailErr, email }, 'Fallo al enviar email de reset');
    }
};

/**
 * Restablece la contraseña usando el token del link.
 * @returns {{ message: string }}
 */
export const resetPassword = async (rawToken, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const db = getDb();

    const user = await db.get(
        'SELECT id, email, reset_token_expires FROM users WHERE reset_token = ?',
        [hashedToken]
    );

    if (!user) {
        const err = new Error('Token de restablecimiento inválido o ya utilizado');
        err.statusCode = 400;
        throw err;
    }

    if (new Date(user.reset_token_expires) < new Date()) {
        const err = new Error('El enlace de restablecimiento ha expirado. Solicita uno nuevo.');
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.run(
        `UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL,
         email_verified = TRUE WHERE id = ?`,
        [hashedPassword, user.id]
    );

    logger.info({ userId: user.id, email: user.email }, 'Contraseña restablecida correctamente');
    return { message: 'Contraseña restablecida. Ya puedes iniciar sesión.' };
};

/**
 * Reenvía el email de verificación.
 */
export const resendVerification = async (email) => {
    const db = getDb();
    const user = await db.get('SELECT id, email, email_verified FROM users WHERE email = ?', [email]);

    if (!user || user.email_verified) return; // Silencioso

    const { raw: rawToken, hashed: hashedToken, expires } = generateSecureToken();
    await db.run(
        'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
        [hashedToken, expires.toISOString(), user.id]
    );

    try {
        const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
        await sendVerificationEmail(email, rawToken, appBaseUrl);
        logger.info({ userId: user.id, email }, 'Email de verificación reenviado');
    } catch (emailErr) {
        logger.error({ err: emailErr, email }, 'Fallo al reenviar email de verificación');
    }
};
