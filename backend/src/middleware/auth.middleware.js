import { resolveAuthenticatedUser } from '../lib/authSession.js';

export const protect = async (req, res, next) => {
  const { user, statusCode, error } = await resolveAuthenticatedUser(req);
  if (!user || statusCode || error) {
    return res.status(statusCode || 401).json({
      success: false,
      error: error || 'No autorizado: token no encontrado',
    });
  }

  req.user = user;
  return next();
};
