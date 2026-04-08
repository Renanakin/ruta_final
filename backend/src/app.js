import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDb } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';

import authRoutes from './modules/auth/auth.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import { createAiRoutes } from './modules/ai/ai.routes.js';
import customerRoutes from './modules/user/user.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import newsletterRoutes from './modules/newsletter/newsletter.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const runtimeEnv = process.env.NODE_ENV || 'development';

const envFiles = [
  '.env',
  `.env.${runtimeEnv}`,
  '.env.local',
  `.env.${runtimeEnv}.local`,
];

envFiles.forEach((path) => {
  dotenv.config({ path, override: true });
});

const validateRuntimeConfig = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe estar configurado y tener al menos 32 caracteres');
  }
};

const parseAllowedOrigins = () => {
  const configuredOrigins = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ];

  const canonicalOrigins = [
    'https://rutadelnido.com',
    'https://www.rutadelnido.com',
  ];

  return Array.from(
    new Set([
      ...canonicalOrigins,
      ...localOrigins,
      ...configuredOrigins,
    ])
  );
};

export const createApp = () => {
  validateRuntimeConfig();

  const app = express();

  // 🔥 LISTA FIJA DE ORÍGENES PERMITIDOS (PRODUCCIÓN)
  const allowedOrigins = parseAllowedOrigins();

  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(rateLimit({
    windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.API_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 300 : 2_000)),
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, error: 'Demasiadas solicitudes, intenta de nuevo mas tarde' },
  }));

  // 🔥 CORS CORREGIDO
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204,
  }));

  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      service: 'ruta-fresca-backend',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/ai', createAiRoutes());
  app.use('/api/customer', customerRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/newsletter', newsletterRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(errorHandler);

  return app;
};

export const startServer = async () => {
  await initDb();
  const app = createApp();
  const port = Number(process.env.PORT || 3004);
  const host = process.env.HOST || undefined;

  app.listen(port, host, () => {
    logger.info({ port, host: host || '0.0.0.0' }, 'Backend iniciado');
  });

  return app;
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    logger.fatal({ err: error }, 'No se pudo iniciar el backend');
    process.exit(1);
  });
}
