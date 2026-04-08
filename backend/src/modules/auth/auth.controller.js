import * as authService from './auth.service.js';
import { getDb } from '../../config/db.js';
import { clearAuthCookie, resolveAuthenticatedUser, setAuthCookie } from '../../lib/authSession.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token requerido' });
    }
    const result = await authService.verifyEmail(token);
    setAuthCookie(res, result.token);
    return res.status(200).json({
      success: true,
      message: 'Email verificado correctamente.',
      ...result,
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    setAuthCookie(res, result.token);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    return res.status(200).json({
      success: true,
      message: 'Si ese correo esta registrado, recibiras instrucciones en breve.',
    });
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Las contrasenas no coinciden' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'La contrasena debe tener al menos 8 caracteres' });
    }

    const result = await authService.resetPassword(token, password);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const requestEmail = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    let email = requestEmail;

    if (!email) {
      const authState = await resolveAuthenticatedUser(req, { requireVerified: false });
      email = authState.user?.email || '';
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    await authService.resendVerification(email);
    return res.status(200).json({
      success: true,
      message: 'Si ese correo esta pendiente de verificacion, recibiras el link en breve.',
    });
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const db = getDb();
    const user = await db.get(
      'SELECT id, email, full_name, phone, email_verified FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return next(err);
  }
};

export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true });
};
