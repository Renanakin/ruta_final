import { logger } from '../lib/logger.js';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const exposeDebug = process.env.DEBUG_ERRORS === 'true' || process.env.NODE_ENV === 'test';
  const exposeMessage = err.expose === true || statusCode < 500;

  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
    },
    req: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    statusCode,
  }, `[${req.method}] ${req.originalUrl} -> ${statusCode}`);

  const response = {
    success: false,
    error: exposeMessage ? (err.message || 'Solicitud invalida') : 'Error interno del servidor',
  };

  if (exposeDebug) {
    response.debug = err.message;
  }

  return res.status(statusCode).json(response);
};
