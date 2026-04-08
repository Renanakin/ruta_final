import { describe, expect, it } from 'vitest';
import { createSalesAssistantService } from '../../alchemist/src/index.js';
import { resolveDeterministicSalesReply } from '../../alchemist/src/sales/sales.deterministic.js';
import { SALES_TEST_CATALOG } from './fixtures/salesCatalog.fixture.js';

const cloneCatalog = () => SALES_TEST_CATALOG.map((product) => ({ ...product }));

const summarizeReply = (reply) => ({
  detectedIntent: reply.detectedIntent || null,
  nextStep: reply.nextStep,
  lastIntent: reply.sessionContext?.lastIntent || null,
  category: reply.sessionContext?.category || null,
  quickReplies: reply.quickReplies?.map((item) => item.label) || [],
  handoffSummary: reply.handoffSummary || null,
});

describe('Sales assistant edge report', () => {
  it('ejecuta preguntas mas dificiles y muestra como responde el vendedor', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText(prompt) {
          const userMessage = prompt.split('Mensaje del usuario:').pop()?.trim() || '';

          if (userMessage.includes('mañana') || userMessage.includes('manana')) {
            return JSON.stringify({
              message: 'Puedo orientarte, pero para confirmar horario exacto prefiero dejarte el cierre listo con una persona.',
              quickReplies: [
                {
                  label: 'Si, coordinemos con una persona',
                  intent: 'human_handoff',
                  payload: { topic: 'handoff', prompt: 'Si, coordinemos con una persona', highlightHuman: true },
                },
                {
                  label: 'Antes, dame una propuesta',
                  intent: 'continue_topic',
                  payload: { topic: 'recommendation', prompt: 'Antes, dame una propuesta' },
                },
              ],
              recommendedProducts: [
                { name: 'Huevo Blanco Extra (Bandeja 30 un)', reason: 'Es una base practica para una compra rapida.' },
              ],
              nextStep: 'handoff',
              detectedIntent: 'delivery_question',
              leadTemperature: 'caliente',
              handoffSummary: 'Cliente quiere coordinar entrega y confirmar horario.',
              shouldHighlightHuman: true,
            });
          }

          if (userMessage.includes('parrillada') || userMessage.includes('regalo')) {
            return JSON.stringify({
              message: 'Te puedo ordenar una propuesta simple para ese contexto y dejarla lista para validar.',
              quickReplies: [
                {
                  label: 'Arma esa propuesta',
                  intent: 'build_bundle',
                  payload: { topic: 'recommendation', prompt: 'Arma esa propuesta' },
                },
                {
                  label: 'Hablar con una persona',
                  intent: 'human_handoff',
                  payload: { topic: 'handoff', prompt: 'Hablar con una persona', highlightHuman: true },
                },
              ],
              recommendedProducts: [
                { name: 'Queso Chanco de Lican Ray', reason: 'Aporta una capa artesanal y facil de compartir.' },
                { name: 'Huevo Blanco Extra (Bandeja 30 un)', reason: 'Sirve como base versatil para desayuno o cocina.' },
              ],
              suggestedBundle: {
                title: 'Propuesta campo para compartir',
                summary: 'Una mezcla simple para una mesa artesanal y util.',
                items: ['Queso Chanco de Lican Ray', 'Huevo Blanco Extra (Bandeja 30 un)'],
                intent: 'bundle',
              },
              nextStep: 'preclose',
              detectedIntent: 'needs_recommendation',
              leadTemperature: 'tibio',
              shouldHighlightHuman: false,
            });
          }

          return JSON.stringify({
            message: 'Te ayudo a ordenar la compra y, si quieres, tambien te dejo el paso humano listo.',
            quickReplies: [
              {
                label: 'Dame una propuesta',
                intent: 'continue_topic',
                payload: { topic: 'recommendation', prompt: 'Dame una propuesta' },
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
        name: 'pronombre_ambiguo_con_contexto',
        ask: 'Y ese me sirve para desayuno o no?',
        expect: (reply) => reply.sessionContext?.lastIntent === 'show_usage',
        run: async () => resolveDeterministicSalesReply({
          message: 'Y ese me sirve para desayuno o no?',
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
            lastUserMessage: 'Estoy viendo el queso chanco',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
      },
      {
        name: 'comparacion_solo_con_pronombres',
        ask: 'Y entre esos dos, cual conviene mas?',
        expect: (reply) => reply.detectedIntent === 'comparing' && reply.sessionContext?.lastIntent === 'compare_products',
        run: async () => resolveDeterministicSalesReply({
          message: 'Y entre esos dos, cual conviene mas?',
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
          quickReply: null,
          catalog: cloneCatalog(),
        }),
      },
      {
        name: 'fuera_de_catalogo',
        ask: 'Tienen mantequilla de campo o yogur?',
        expect: (reply) => reply.detectedIntent === 'outside_catalog' && reply.message.includes('No veo') && reply.quickReplies.some((item) => item.intent === 'human_handoff'),
        run: async () => resolveDeterministicSalesReply({
          message: 'Tienen mantequilla de campo o yogur?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [],
          sessionContext: null,
          quickReply: null,
          catalog: cloneCatalog(),
        }),
      },
      {
        name: 'pregunta_logistica_fuerte',
        ask: 'Si te compro hoy, me lo puedes mandar mañana temprano a Providencia?',
        expect: (reply) => reply.detectedIntent === 'delivery_question' && reply.nextStep === 'preclose',
        run: async () => service.generateReply({
          message: 'Si te compro hoy, me lo puedes mandar mañana temprano a Providencia?',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: cloneCatalog()[0],
          recentProducts: [],
          sessionContext: {
            topic: 'handoff',
            category: 'huevos',
            currentProductId: 8,
            comparedProductIds: [],
            useContext: 'desayuno familiar',
            locationHint: 'Providencia',
            urgencyHint: 'mañana temprano',
            lastIntent: 'continue_topic',
            lastUserMessage: 'Quiero coordinar entrega',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
      },
      {
        name: 'pedido_abierto_contextual',
        ask: 'Quiero algo bonito para regalo, pero que igual sirva para una parrillada',
        expect: (reply) => reply.detectedIntent === 'needs_recommendation' && reply.nextStep === 'preclose',
        run: async () => service.generateReply({
          message: 'Quiero algo bonito para regalo, pero que igual sirva para una parrillada',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [cloneCatalog()[1], cloneCatalog()[0]],
          sessionContext: {
            topic: 'recommendation',
            category: null,
            currentProductId: null,
            comparedProductIds: [],
            lastIntent: 'continue_topic',
            lastUserMessage: 'Busco algo especial',
          },
          quickReply: null,
          catalog: cloneCatalog(),
        }),
      },
      {
        name: 'cierre_humano_con_pocos_datos',
        ask: 'Ya, mejor pasame con alguien',
        expect: (reply) => reply.nextStep === 'handoff' && reply.sessionContext?.lastIntent === 'human_handoff' && Boolean(reply.handoffSummary),
        run: async () => service.generateReply({
          message: 'Ya, mejor pasame con alguien',
          locale: 'es-CL',
          pagePath: '/',
          currentProduct: null,
          recentProducts: [cloneCatalog()[1]],
          sessionContext: {
            topic: 'recommendation',
            category: 'quesos',
            currentProductId: 4,
            comparedProductIds: [],
            useContext: null,
            locationHint: null,
            urgencyHint: null,
            lastIntent: 'continue_topic',
            lastUserMessage: 'Estoy viendo el queso',
          },
          quickReply: {
            label: 'Hablar con una persona',
            intent: 'human_handoff',
            payload: { topic: 'handoff', prompt: 'Hablar con una persona', highlightHuman: true },
          },
          catalog: cloneCatalog(),
        }),
      },
    ];

    const results = [];

    for (const testCase of cases) {
      const reply = await testCase.run();
      const summary = summarizeReply(reply);
      results.push({
        name: testCase.name,
        ask: testCase.ask,
        answer: reply.message,
        passed: typeof testCase.expect === 'function' ? Boolean(testCase.expect(reply)) : true,
        summary,
      });
    }

    console.log('[SalesEdgeReport] preguntas y respuestas');
    results.forEach((item, index) => {
      console.log(`\n[${index + 1}] Caso: ${item.name}`);
      console.log(`Pregunta: ${item.ask}`);
      console.log(`Respuesta: ${item.answer}`);
      console.log(`Intent: ${item.summary.detectedIntent || '-'} | Paso: ${item.summary.nextStep} | Ultimo intent: ${item.summary.lastIntent || '-'}`);
      console.log(`Estado: ${item.passed ? 'PASS' : 'FAIL'}`);
      if (item.summary.quickReplies.length) {
        console.log(`Quick replies: ${item.summary.quickReplies.join(' | ')}`);
      }
      if (item.summary.handoffSummary) {
        console.log(`Handoff summary: ${item.summary.handoffSummary}`);
      }
    });

    expect(results).toHaveLength(6);
    expect(results.every((item) => item.passed)).toBe(true);
  });
});
