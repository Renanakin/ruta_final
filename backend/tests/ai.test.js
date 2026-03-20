import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAiRoutes } from '../src/modules/ai/ai.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { AlchemistProviderError, AlchemistValidationError, createChefService } from '../../alchemist/src/index.js';

const createTestApp = ({ chefService } = {}) => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', createAiRoutes({ chefService }));
  app.use(errorHandler);
  return app;
};

describe('AI routes', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
    process.env.CHEF_ACCESS_CODE = 'RUTA-NIDO-2026';
  });

  it('valida el codigo de acceso del chef', async () => {
    const app = createTestApp({
      chefService: {
        generateRecipe: async () => {
          throw new Error('No deberia ejecutarse en este test');
        },
      },
    });

    const ok = await request(app).post('/api/ai/chef/verify').send({ code: 'ruta-nido-2026' });
    expect(ok.status).toBe(200);
    expect(ok.body.valid).toBe(true);

    const bad = await request(app).post('/api/ai/chef/verify').send({ code: 'otro-codigo' });
    expect(bad.status).toBe(200);
    expect(bad.body.valid).toBe(false);
  });

  it('genera recetas usando el modulo alchemist con acceso por codigo', async () => {
    const chefService = createChefService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            title: 'Tortilla sureña',
            summary: 'Una tortilla casera con huevos de campo y hierbas frescas.',
            timeMinutes: 18,
            difficulty: 'Facil',
            ingredients: ['4 huevos de campo', '1 cebolla pequeña', 'Ciboulette picado'],
            steps: [
              'Bate los huevos con sal y pimienta hasta integrar.',
              'Saltea la cebolla hasta que quede suave y dorada.',
              'Agrega los huevos, cocina a fuego medio y termina con ciboulette.',
            ],
            flavorTip: 'Agrega una pizca de merken al final para un perfil mas sureño.',
            presentationTip: 'Sirve con hojas verdes y aceite de oliva.',
            imagePrompt: 'A rustic southern Chilean egg tortilla plated beautifully, natural light, highly detailed food photography',
          });
        },
      },
    });

    const app = createTestApp({ chefService });
    const response = await request(app)
      .post('/api/ai/chef')
      .send({ code: 'RUTA-NIDO-2026', query: 'Quiero una receta con huevos, cebolla y ciboulette' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Tortilla sureña');
    expect(response.body.data.imageUrl).toContain('image.pollinations.ai');
  });

  it('devuelve 400 cuando la solicitud no cumple validaciones', async () => {
    const app = createTestApp({
      chefService: {
        async generateRecipe() {
          throw new AlchemistValidationError('Solicitud invalida para El Alquimista.', {
            fieldErrors: {
              query: ['La consulta debe tener al menos 3 caracteres.'],
            },
          });
        },
      },
    });

    const response = await request(app)
      .post('/api/ai/chef')
      .send({ code: 'RUTA-NIDO-2026', query: 'a' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Solicitud invalida');
  });

  it('devuelve 502 cuando el proveedor responde mal', async () => {
    const app = createTestApp({
      chefService: {
        async generateRecipe() {
          throw new AlchemistProviderError('La IA devolvio una receta incompleta o invalida.');
        },
      },
    });

    const response = await request(app)
      .post('/api/ai/chef')
      .send({ code: 'RUTA-NIDO-2026', query: 'Receta con huevos y pan' });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('receta incompleta');
  });
});
