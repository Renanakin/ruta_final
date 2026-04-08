import { getDb } from '../config/db.js';
import { verifyCrmToken } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

const normalizeLocalIds = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const protectCrm = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'No autorizado, sin token' });
    }

    const decoded = verifyCrmToken(token);
    const db = getDb();
    const user = await db.get(
      'SELECT id, email, role, local_ids, is_active FROM crm_users WHERE id = ?',
      [decoded.id]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Usuario CRM no encontrado o inactivo' });
    }

    req.crmUser = {
      ...user,
      local_ids: normalizeLocalIds(user.local_ids),
      is_active: Boolean(user.is_active),
    };

    return next();
  } catch (error) {
    logger.warn({ err: error, url: req.originalUrl, ip: req.ip }, '[CRM] Token invalido');
    return res.status(401).json({ success: false, error: 'No autorizado, token fallido' });
  }
};

export const protectCrmAdmin = (req, res, next) => {
  if (req.crmUser?.role === 'admin') {
    return next();
  }

  return res.status(403).json({ success: false, error: 'No autorizado como administrador' });
};
