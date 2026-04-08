import { getDb } from '../config/db.js';
import { verifyCustomerToken } from './jwt.js';
import { logger } from './logger.js';

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'rdn_auth_token';
const DEFAULT_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const parseCookieHeader = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return acc;

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');

  return parts.join('; ');
};

const getCookieConfig = () => {
  const configuredSameSite = process.env.AUTH_COOKIE_SAMESITE;
  const sameSite = configuredSameSite || (process.env.NODE_ENV === 'production' ? 'None' : 'Lax');
  const secure =
    process.env.AUTH_COOKIE_SECURE === 'true'
      || sameSite.toLowerCase() === 'none'
      || process.env.NODE_ENV === 'production';

  return {
    name: AUTH_COOKIE_NAME,
    maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE_MS || DEFAULT_COOKIE_MAX_AGE_MS),
    sameSite,
    secure,
    domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    path: '/',
    httpOnly: true,
  };
};

export const extractAuthToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cookies = parseCookieHeader(req.headers.cookie || '');
  return cookies[AUTH_COOKIE_NAME] || null;
};

export const setAuthCookie = (res, token) => {
  const config = getCookieConfig();
  res.append('Set-Cookie', serializeCookie(config.name, token, config));
};

export const clearAuthCookie = (res) => {
  const config = getCookieConfig();
  res.append('Set-Cookie', serializeCookie(config.name, '', {
    ...config,
    expires: new Date(0),
    maxAge: 0,
  }));
};

export const resolveAuthenticatedUser = async (req, { requireVerified = true } = {}) => {
  const token = extractAuthToken(req);
  if (!token) {
    return { token: null, user: null };
  }

  try {
    const decoded = verifyCustomerToken(token);
    const db = getDb();
    const user = await db.get(
      'SELECT id, email, full_name, phone, email_verified FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return { token, user: null, statusCode: 401, error: 'No autorizado: usuario no encontrado' };
    }

    if (requireVerified && !user.email_verified) {
      return { token, user, statusCode: 403, error: 'La cuenta del usuario no esta verificada' };
    }

    return { token, user };
  } catch (error) {
    logger.warn({ err: error, ip: req.ip, url: req.originalUrl }, 'Token JWT invalido o expirado');
    return { token, user: null, statusCode: 401, error: 'No autorizado: token invalido o expirado' };
  }
};
