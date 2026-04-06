import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createAiRoutes } from '../src/modules/ai/ai.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { AlchemistProviderError, AlchemistValidationError, createChefService } from '../../alchemist/src/index.js';
import { closeDb, initDb } from '../src/config/db.js';

const createTestApp = ({ chefService, salesService } = {}) => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', createAiRoutes({ chefService, salesService }));
  app.use(errorHandler);
  return app;
};

describe('AI routes', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test_secret_min_32_chars_for_vitest_ok';
    process.env.CHEF_ACCESS_CODE = 'RUTA-NIDO-2026';
  });

  beforeAll(async () => {
    await initDb();
  });

  afterAll(async () => {
    await closeDb();
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

  it('responde desde la IA de ventas con estructura comercial valida', async () => {
    const app = createTestApp({
      salesService: {
        async generateReply(input) {
          return {
            message: 'Si quieres una compra mas completa, te sugiero combinar huevos con queso y longaniza.',
            quickReplies: [
              {
                label: 'Arma un pack para mi',
                intent: 'build_bundle',
                payload: { topic: 'recommendation', prompt: 'Arma un pack para mi' },
              },
              {
                label: 'Que combina con huevos',
                intent: 'continue_topic',
                payload: {
                  topic: 'catalog',
                  prompt: 'Que combina con huevos',
                  currentProductId: input.currentProduct?.id || null,
                },
              },
            ],
            recommendedProducts: [
              { name: 'Huevo Blanco Extra (Bandeja 30 un)', reason: 'Base versatil para desayuno o cocina diaria.' },
              { name: 'Queso Chanco de Lican Ray', reason: 'Aporta complemento directo para tostadas y desayunos.' },
            ],
            suggestedBundle: {
              title: 'Pack desayuno del nido',
              summary: 'Una base simple para una mesa mas completa.',
              items: ['Huevo Blanco Extra (Bandeja 30 un)', 'Queso Chanco de Lican Ray'],
              intent: 'bundle',
            },
            nextStep: 'preclose',
            handoffSummary: 'Cliente interesado en avanzar con pack desayuno.',
            shouldHighlightHuman: false,
            sessionContext: {
              topic: 'recommendation',
              category: 'huevos',
              currentProductId: input.currentProduct?.id || null,
              comparedProductIds: [],
              lastIntent: 'needs_recommendation',
              lastUserMessage: input.message,
            },
          };
        },
      },
    });

    const response = await request(app)
      .post('/api/ai/sales/message')
      .send({
        message: 'Quiero algo para desayuno',
        pagePath: '/',
        recentProductIds: [8, 4],
        sessionContext: {
          topic: 'catalog',
          category: 'huevos',
          currentProductId: 8,
          comparedProductIds: [],
          lastIntent: 'show_recommendations',
          lastUserMessage: 'Estoy viendo huevos',
        },
        quickReply: {
          label: 'Ayudame a elegir',
          intent: 'show_recommendations',
          payload: { topic: 'recommendation', prompt: 'Ayudame a elegir' },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nextStep).toBe('preclose');
    expect(response.body.data.recommendedProducts.length).toBeGreaterThan(0);
    expect(response.body.data.quickReplies[0].label).toBe('Arma un pack para mi');
    expect(response.body.data.sessionContext.topic).toBe('recommendation');
    expect(response.body.data.sessionContext.lastUserMessage).toBe('Quiero algo para desayuno');
  });
});
