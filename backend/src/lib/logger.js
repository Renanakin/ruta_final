import pino from 'pino';

/**
 * Logger central del backend — basado en pino.
 *
 * En desarrollo: salida formateada con colores (pino-pretty).
 * En producción: salida JSON estructurada para captura centralizada (Railway, Render, etc.).
 *
 * Uso:
 *   import { logger } from '../../lib/logger.js';
 *   logger.info('Servidor iniciado');
 *   logger.error({ err, userId }, 'Error procesando request');
 *   logger.warn({ endpoint: '/api/auth/login' }, 'Intento fallido');
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    ...(isDevelopment && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        },
    }),
});
