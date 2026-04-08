import { describe, expect, it } from 'vitest';
import { createSalesAssistantService } from '../../alchemist/src/index.js';
import { resolveDeterministicSalesReply } from '../../alchemist/src/sales/sales.deterministic.js';
import { SALES_TEST_CATALOG } from './fixtures/salesCatalog.fixture.js';

const cloneCatalog = () => SALES_TEST_CATALOG.map((product) => ({ ...product }));

const summarizeCase = (reply) => ({
  detectedIntent: reply.detectedIntent || null,
  nextStep: reply.nextStep,
  lastIntent: reply.sessionContext?.lastIntent || null,
  category: reply.sessionContext?.category || null,
  quickReplies: reply.quickReplies?.map((item) => item.intent) || [],
  topRecommendation: reply.recommendedProducts?.[0]?.name || null,
  handoff: reply.nextStep === 'handoff',
});

const buildChecks = (reply, expectation) => {
  const checks = [];

  if (expectation.detectedIntent) {
    checks.push(reply.detectedIntent === expectation.detectedIntent);
  }

  if (expectation.nextStep) {
    checks.push(reply.nextStep === expectation.nextStep);
  }

  if (expectation.lastIntent) {
    checks.push(reply.sessionContext?.lastIntent === expectation.lastIntent);
  }

  if (expectation.category) {
    checks.push(reply.sessionContext?.category === expectation.category);
  }

  if (expectation.mustContain?.length) {
    checks.push(expectation.mustContain.every((needle) => reply.message.includes(needle)));
  }

  if (expectation.quickReplyIntent) {
    checks.push(reply.quickReplies?.some((item) => item.intent === expectation.quickReplyIntent));
  }

  if (expectation.topRecommendation) {
    checks.push(reply.recommendedProducts?.[0]?.name === expectation.topRecommendation);
  }

  if (typeof expectation.extraCheck === 'function') {
    checks.push(Boolean(expectation.extraCheck(reply)));
  }

  return checks;
};

describe('Sales assistant behavior report', () => {
  it('ejecuta un set representativo de pruebas del vendedor', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText(prompt) {
          const userMessage = prompt.split('Mensaje del usuario:').pop()?.trim() || '';

          if (userMessage.includes('Providencia') || userMessage.includes('propuesta')) {
            return JSON.stringify({
              message: 'Puedo dejarte una propuesta clara para avanzar.',
              quickReplies: [
                {
                  label: 'Continuar',
                  intent: 'continue_topic',
                  payload: { topic: 'recommendation' },
                },
              ],
              recommendedProducts: [
                { name: 'Huevo Blanco Extra', reason: 'Buena base para una compra familiar.' },
                { name: 'Queso Chanco', reason: 'Acompana bien desayunos y tostadas.' },
                { name: 'Producto Inventado', reason: 'No deberia quedar.' },
              ],
              suggestedBundle: {
                title: 'Pack de prueba',
                summary: 'Una combinacion para avanzar rapido.',
                items: ['Huevo Blanco Extra', 'Producto Inventado'],
                intent: 'bundle',
              },
              nextStep: 'handoff',
              detectedIntent: 'objection',
              shouldHighlightHuman: true,
            });
          }

          if (userMessage.includes('No se si vale la pena llevar queso')) {
            return JSON.stringify({
              message: 'Puede funcionarte bien si buscas algo mas simple.',
              quickReplies: [
                {
                  label: 'Sigue orientandome',
                  intent: 'continue_topic',
                  payload: { topic: 'recommendation' },
                },
              ],
              recommendedProducts: [
                { name: 'Queso Chanco de Lican Ray', reason: 'Se adapta bien a desayuno y tostadas.' },
              ],
              nextStep: 'assist',
              detectedIntent: 'objection',
              shouldHighlightHuman: false,
            });
          }

          return JSON.stringify({
            message: 'Para una mesa mas completa, te sugiero combinar huevos con queso.',
            quickReplies: [
              {
                label: 'Arma un pack para mi',
                intent: 'build_bundle',
                payload: { topic: 'recommendation', prompt: 'Arma un pack para mi' },
              },
            ],
            recommendedProducts: [],
            nextStep: 'assist',
            detectedIntent: 'needs_recommendation',
            shouldHighlightHuman: false,
          });
        },
      },
    });

    const cases = [
      {
        name: 'precio_visible_producto_actual',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Cual es el precio?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: cloneCatalog()[0],
          recentProducts: [],
          sessionContext: {
            topic: 'catalog',
            category: 'huevos',
            currentProductId: 8,
            comparedProductIds: [],
            lastIntent: 'continue_topic',
            lastUserMessage: 'Estoy viendo este producto',
          },
          quickReply: {
            label: 'Ver precio visible',
            intent: 'show_price',
            payload: { topic: 'catalog', currentProductId: 8, prompt: 'Ver precio visible' },
          },
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'price_or_format_doubt',
          nextStep: 'assist',
          lastIntent: 'show_price',
          mustContain: ['$5990'],
          quickReplyIntent: 'show_availability',
        },
      },
      {
        name: 'coming_soon_deriva_correctamente',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Esta disponible la longaniza?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'availability_question',
          nextStep: 'handoff',
          mustContain: ['lanzamiento proximo'],
          quickReplyIntent: 'human_handoff',
        },
      },
      {
        name: 'lista_categoria_visible',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Que quesos tienen hoy?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'availability_question',
          category: 'quesos',
          mustContain: ['quesos'],
          quickReplyIntent: 'show_format',
        },
      },
      {
        name: 'detalle_producto_visible',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Cuentame mas del queso chanco de lican ray',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          lastIntent: 'show_details',
          mustContain: ['Queso Chanco de Lican Ray', 'Origen', 'Hechos visibles'],
          quickReplyIntent: 'show_format',
        },
      },
      {
        name: 'recomendacion_por_uso',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Que queso me conviene para fundir?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'needs_recommendation',
          topRecommendation: 'Queso Mantecoso de Pua (Horma)',
          mustContain: ['Queso Mantecoso de Pua (Horma)'],
        },
      },
      {
        name: 'comparacion_con_contexto',
        type: 'deterministic',
        run: async () => resolveDeterministicSalesReply({
          message: 'Comparalos',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: cloneCatalog()[0],
          recentProducts: [cloneCatalog()[1]],
          sessionContext: {
            topic: 'comparison',
            category: 'huevos',
            currentProductId: 8,
            comparedProductIds: [8, 4],
            lastIntent: 'compare_products',
            lastUserMessage: 'Quiero comparar esos dos',
          },
          quickReply: {
            label: 'Comparar opciones',
            intent: 'compare_products',
            payload: {
              topic: 'comparison',
              comparedProductIds: [8, 4],
              prompt: 'Comparar opciones',
            },
          },
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'comparing',
          lastIntent: 'compare_products',
          mustContain: ['Origen visible', 'Descripcion visible', 'Hechos de familia'],
          quickReplyIntent: 'show_usage',
        },
      },
      {
        name: 'generativo_recomendacion_activa',
        type: 'generative',
        run: async () => service.generateReply({
          message: 'Quiero una recomendacion completa para regalar',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'needs_recommendation',
          nextStep: 'assist',
          mustContain: ['combinar huevos con queso'],
          quickReplyIntent: 'build_bundle',
        },
      },
      {
        name: 'objecion_generativa_responde_sin_romper_flujo',
        type: 'generative',
        run: async () => service.generateReply({
          message: 'No se si vale la pena llevar queso ahora.',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: {
            topic: 'recommendation',
            category: 'quesos',
            currentProductId: 4,
            comparedProductIds: [],
            lastIntent: 'continue_topic',
            lastUserMessage: 'Estoy dudando del queso',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'objection',
          nextStep: 'assist',
          quickReplyIntent: 'continue_topic',
          mustContain: ['Entiendo la duda', 'Queso Chanco de Lican Ray'],
        },
      },
      {
        name: 'handoff_structurado_con_calificacion',
        type: 'generative',
        run: async () => service.generateReply({
          message: 'Todavia no estoy seguro, pero si me ordenas una propuesta para Providencia puedo avanzar.',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: {
            topic: 'recommendation',
            category: 'huevos',
            currentProductId: 8,
            comparedProductIds: [],
            lastIntent: 'continue_topic',
            lastUserMessage: 'Estoy viendo opciones',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          nextStep: 'preclose',
          quickReplyIntent: 'human_handoff',
          extraCheck: (reply) => (
            reply.handoffDetails?.locationHint === 'Providencia'
            && reply.handoffDetails?.channel === 'web_widget'
            && reply.handoffDetails?.proposedProducts?.includes('Huevo Blanco Extra (Bandeja 30 un)')
          ),
        },
      },
    ];

    const results = [];

    for (const testCase of cases) {
      const reply = await testCase.run();
      const checks = buildChecks(reply, testCase.expect);
      results.push({
        name: testCase.name,
        type: testCase.type,
        passed: checks.every(Boolean),
        summary: summarizeCase(reply),
      });
    }

    const passed = results.filter((item) => item.passed).length;
    const accuracy = Number(((passed / results.length) * 100).toFixed(1));

    console.log('[SalesBehaviorReport] resumen');
    console.table(results.map((item) => ({
      caso: item.name,
      tipo: item.type,
      estado: item.passed ? 'PASS' : 'FAIL',
      intent: item.summary.detectedIntent || '-',
      nextStep: item.summary.nextStep,
      topRecommendation: item.summary.topRecommendation || '-',
    })));
    console.log(`[SalesBehaviorReport] accuracy=${passed}/${results.length} (${accuracy}%)`);

    expect(results).toHaveLength(9);
    expect(accuracy).toBeGreaterThanOrEqual(90);
  });
});
