import { describe, expect, it } from 'vitest';
import {
  createSalesAssistantService,
} from '../../alchemist/src/index.js';
import { resolveDeterministicSalesReply } from '../../alchemist/src/sales/sales.deterministic.js';
import { SALES_TEST_CATALOG } from './fixtures/salesCatalog.fixture.js';

const cloneCatalog = () => SALES_TEST_CATALOG.map((product) => ({ ...product }));

const buildChecks = (reply, expectation) => {
  const checks = [];

  if (expectation.detectedIntent) {
    checks.push(reply.detectedIntent === expectation.detectedIntent);
  }

  if (expectation.nextStep) {
    checks.push(reply.nextStep === expectation.nextStep);
  }

  if (expectation.sessionIntent) {
    checks.push(reply.sessionContext?.lastIntent === expectation.sessionIntent);
  }

  if (expectation.sessionCategory) {
    checks.push(reply.sessionContext?.category === expectation.sessionCategory);
  }

  if (expectation.topRecommendation) {
    checks.push(reply.recommendedProducts?.[0]?.name === expectation.topRecommendation);
  }

  if (expectation.mustContain?.length) {
    checks.push(expectation.mustContain.every((needle) => reply.message.includes(needle)));
  }

  if (expectation.quickReplyIntent) {
    checks.push(reply.quickReplies?.some((item) => item.intent === expectation.quickReplyIntent));
  }

  return checks;
};

describe('Sales conversation evaluation', () => {
  it('mantiene al menos 90% de acierto en escenarios conversacionales base', async () => {
    const evalCases = [
      {
        name: 'precio actual',
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
          sessionIntent: 'show_price',
          mustContain: ['$5990'],
          quickReplyIntent: 'show_availability',
        },
      },
      {
        name: 'coming soon',
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
        name: 'categoria quesos',
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
          sessionCategory: 'quesos',
          mustContain: ['quesos'],
          quickReplyIntent: 'show_format',
        },
      },
      {
        name: 'detalles queso',
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
          sessionIntent: 'show_details',
          mustContain: ['Queso Chanco de Lican Ray', 'Origen', 'Hechos visibles'],
          quickReplyIntent: 'show_format',
        },
      },
      {
        name: 'formato huevo extra',
        run: async () => resolveDeterministicSalesReply({
          message: 'Que formato tiene el huevo blanco extra?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          sessionIntent: 'show_format',
          mustContain: ['Bandeja'],
          quickReplyIntent: 'show_details',
        },
      },
      {
        name: 'uso por producto',
        run: async () => resolveDeterministicSalesReply({
          message: 'Este queso me sirve para tabla?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: cloneCatalog()[1],
          recentProducts: [],
          sessionContext: {
            topic: 'catalog',
            category: 'quesos',
            currentProductId: 4,
            comparedProductIds: [],
            lastIntent: 'show_details',
            lastUserMessage: 'Estoy viendo este queso',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
        expect: {
          sessionIntent: 'show_usage',
          mustContain: ['tabla', 'Hechos visibles'],
          quickReplyIntent: 'show_details',
        },
      },
      {
        name: 'uso por categoria',
        run: async () => resolveDeterministicSalesReply({
          message: 'Que me conviene en embutidos para asado?',
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
          sessionIntent: 'show_usage',
          sessionCategory: 'embutidos',
          mustContain: ['asado'],
        },
      },
      {
        name: 'ranking fundir',
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
        name: 'comparacion cruzada',
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
          sessionIntent: 'compare_products',
          mustContain: ['Origen visible', 'Descripcion visible', 'Hechos de familia'],
          quickReplyIntent: 'show_usage',
        },
      },
      {
        name: 'comparacion misma familia',
        run: async () => resolveDeterministicSalesReply({
          message: 'Comparalos para fundir',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: cloneCatalog()[1],
          recentProducts: [cloneCatalog()[3]],
          sessionContext: {
            topic: 'comparison',
            category: 'quesos',
            currentProductId: 4,
            comparedProductIds: [4, 6],
            lastIntent: 'compare_products',
            lastUserMessage: 'Quiero comparar quesos',
          },
          quickReply: {
            label: 'Comparar opciones',
            intent: 'compare_products',
            payload: {
              topic: 'comparison',
              comparedProductIds: [4, 6],
              prompt: 'Comparar opciones',
            },
          },
          catalog: cloneCatalog(),
        }),
        expect: {
          detectedIntent: 'comparing',
          mustContain: ['Dentro de quesos', 'queda mejor perfilado'],
          quickReplyIntent: 'show_usage',
        },
      },
      {
        name: 'servicio cae al modelo cuando corresponde',
        run: async () => {
          let calls = 0;
          const service = createSalesAssistantService({
            textGenerator: {
              async generateText() {
                calls += 1;
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

          const reply = await service.generateReply({
            message: 'Quiero una recomendacion completa para regalar',
            locale: 'es-CL',
            pagePath: '/',
            currentProduct: null,
            recentProducts: [],
            sessionContext: null,
            quickReply: null,
            catalog: cloneCatalog(),
          });

          return { ...reply, __generatorCalls: calls };
        },
        expect: {
          detectedIntent: 'needs_recommendation',
          quickReplyIntent: 'build_bundle',
          mustContain: ['combinar huevos con queso'],
        },
        extraCheck: (reply) => reply.__generatorCalls === 1,
      },
    ];

    const results = [];

    for (const testCase of evalCases) {
      const reply = await testCase.run();
      const checks = buildChecks(reply, testCase.expect);
      if (typeof testCase.extraCheck === 'function') {
        checks.push(Boolean(testCase.extraCheck(reply)));
      }

      results.push({
        name: testCase.name,
        passed: checks.every(Boolean),
      });
    }

    const passed = results.filter((result) => result.passed).length;
    const accuracy = (passed / results.length) * 100;

    console.log(`Sales QA accuracy: ${passed}/${results.length} (${accuracy.toFixed(1)}%)`);

    expect(results.length).toBeGreaterThanOrEqual(10);
    expect(accuracy).toBeGreaterThanOrEqual(90);
  });
});
