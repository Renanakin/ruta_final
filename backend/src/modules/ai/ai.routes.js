import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { requireAILimit } from '../../middleware/aiLimit.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { AiOrderSchema, ChefQuerySchema, ChefVerifySchema } from '../../../validators.js';
import { logger } from '../../lib/logger.js';
import {
  AlchemistError,
  createChefService,
  createGeminiTextGenerator,
} from '../../../alchemist/src/index.js';

const CHEF_AI_LIMIT = 3;
const ORDERS_AI_LIMIT = 3;

const createChefAccessMiddleware = () => async (req, res, next) => {
  const codeStr = String(req.body?.code || '').replace(/\s+/g, '').toUpperCase();
  const envCode = String(process.env.CHEF_ACCESS_CODE || '').replace(/\s+/g, '').toUpperCase();

  if (codeStr && envCode && codeStr === envCode) {
    req.user = { id: 'guest_chef_user', role: 'guest', email_verified: true };
    return next();
  }

  return protect(req, res, () => {
    requireAILimit('chef', CHEF_AI_LIMIT)(req, res, next);
  });
};

const createDefaultChefService = () =>
  createChefService({
    textGenerator: createGeminiTextGenerator({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.ALCHEMIST_GEMINI_MODEL || 'gemini-2.5-flash',
    }),
    logger,
  });

export const createAiRoutes = ({ chefService } = {}) => {
  const router = express.Router();
  const chefAccessMiddleware = createChefAccessMiddleware();
  const resolvedChefService = chefService || createDefaultChefService();

  router.post('/chef/verify', validateBody(ChefVerifySchema), (req, res) => {
    const codeStr = String(req.body.code).replace(/\s+/g, '').toUpperCase();
    const envCode = String(process.env.CHEF_ACCESS_CODE || '').replace(/\s+/g, '').toUpperCase();

    return res.json({ valid: Boolean(envCode) && codeStr === envCode });
  });

  router.post('/chef', validateBody(ChefQuerySchema), chefAccessMiddleware, async (req, res, next) => {
    try {
      const recipe = await resolvedChefService.generateRecipe({
        query: req.body.query,
        locale: req.body.locale || 'es-CL',
      });

      return res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      if (error instanceof AlchemistError) {
        return res.status(error.statusCode || 500).json({
          success: false,
          error: error.message,
          ...(error.details ? { details: error.details } : {}),
        });
      }

      return next(error);
    }
  });

  router.post('/orders', protect, validateBody(AiOrderSchema), requireAILimit('orders', ORDERS_AI_LIMIT), async (req, res, next) => {
    try {
      const { message } = req.body;

      return res.status(200).json({
        success: true,
        message: `Procesando pedido via IA: ${message ? 'Simulacion de respuesta.' : 'Sin contenido.'}`,
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};

export default createAiRoutes;
