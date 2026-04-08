import { describe, expect, it } from 'vitest';
import {
  createChefService,
  createSalesAssistantService,
  AlchemistProviderError,
} from '../../alchemist/src/index.js';

describe('Alchemist chef service', () => {
  it('extrae y valida JSON aunque venga envuelto en texto del modelo', async () => {
    const service = createChefService({
      textGenerator: {
        async generateText() {
          return `Claro, aqui va tu receta:

\`\`\`json
{
  "title": "Huevos al sarten con tomate",
  "summary": "Una receta rapida y sabrosa para desayuno o cena liviana.",
  "timeMinutes": 12,
  "difficulty": "Facil",
  "ingredients": ["3 huevos", "1 tomate grande", "Aceite de oliva"],
  "steps": ["Calienta el sarten con aceite.", "Agrega tomate picado y cocina 3 minutos.", "Incorpora los huevos y cocina hasta el punto deseado."],
  "flavorTip": "Termina con oregano seco y pimienta negra.",
  "presentationTip": "Sirve en sarten de fierro con pan tostado.",
  "imagePrompt": "A skillet of eggs with roasted tomatoes, rustic plating, natural light, highly detailed food photography"
}
\`\`\``;
        },
      },
    });

    const recipe = await service.generateRecipe({
      query: 'Una receta con huevos y tomate',
    });

    expect(recipe.title).toBe('Huevos al sarten con tomate');
    expect(recipe.timeMinutes).toBe(12);
    expect(recipe.imageUrl).toContain('pollinations');
  });

  it('rechaza payloads invalidos del proveedor', async () => {
    const service = createChefService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            title: 'Receta rota',
            summary: 'Muy corta',
            timeMinutes: 1,
            difficulty: 'Imposible',
            ingredients: [],
            steps: [],
            flavorTip: 'x',
            presentationTip: 'y',
            imagePrompt: 'short',
          });
        },
      },
    });

    await expect(
      service.generateRecipe({
        query: 'algo',
      }),
    ).rejects.toBeInstanceOf(AlchemistProviderError);
  });

  it('normaliza quick replies legacy y construye contexto corto de ventas', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            message: 'Puedo ayudarte a armar una opcion mas completa para desayuno.',
            quickReplies: ['Arma un pack para mi', 'Hablar con una persona'],
            recommendedProducts: [],
            nextStep: 'assist',
            detectedIntent: 'needs_recommendation',
            shouldHighlightHuman: false,
          });
        },
      },
    });

    const reply = await service.generateReply({
      message: 'Que me recomiendas para desayuno?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: {
        id: 8,
        name: 'Huevo Blanco Extra (Bandeja 30 un)',
        category: 'huevos',
        description: 'Huevos frescos de campo.',
        price: 5990,
        priceLabel: '$5990',
        inStock: true,
        comingSoon: false,
        salesNote: 'Disponible',
      },
      recentProducts: [
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
      sessionContext: {
        topic: 'recommendation',
        category: 'huevos',
        currentProductId: 8,
        comparedProductIds: [],
        lastIntent: 'show_recommendations',
        lastUserMessage: 'Quiero algo para desayuno',
      },
      quickReply: {
        label: 'Ayudame a elegir',
        intent: 'show_recommendations',
        payload: {
          topic: 'recommendation',
          prompt: 'Ayudame a elegir',
        },
      },
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
    });

    expect(reply.quickReplies[0].intent).toBe('build_bundle');
    expect(reply.quickReplies[0].payload.topic).toBe('recommendation');
    expect(reply.quickReplies[1].intent).toBe('human_handoff');
    expect(reply.quickReplies[1].payload.highlightHuman).toBe(true);
    expect(reply.sessionContext.topic).toBe('recommendation');
    expect(reply.sessionContext.currentProductId).toBe(8);
    expect(reply.sessionContext.comparedProductIds).toEqual([]);
  });

  it('resuelve preguntas cerradas por reglas sin llamar al textGenerator', async () => {
    let generatorCalls = 0;

    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          generatorCalls += 1;
          return JSON.stringify({
            message: 'Esto no deberia ejecutarse.',
            quickReplies: ['Continuar'],
            recommendedProducts: [],
            nextStep: 'assist',
            shouldHighlightHuman: false,
          });
        },
      },
    });

    const reply = await service.generateReply({
      message: 'Cual es el precio?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: {
        id: 8,
        name: 'Huevo Blanco Extra (Bandeja 30 un)',
        category: 'huevos',
        description: 'Huevos frescos de campo.',
        price: 5990,
        priceLabel: '$5990',
        inStock: true,
        comingSoon: false,
        salesNote: 'Disponible',
      },
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
        payload: {
          topic: 'catalog',
          currentProductId: 8,
          prompt: 'Ver precio visible',
        },
      },
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
      ],
    });

    expect(generatorCalls).toBe(0);
    expect(reply.message).toContain('$5990');
    expect(reply.quickReplies[0].intent).toBe('show_availability');
  });

  it('cae al modelo cuando la consulta no entra al motor deterministico', async () => {
    let generatorCalls = 0;

    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          generatorCalls += 1;
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
      message: 'Que me recomiendas para desayuno?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
      ],
    });

    expect(generatorCalls).toBe(1);
    expect(reply.detectedIntent).toBe('needs_recommendation');
    expect(reply.quickReplies[0].intent).toBe('build_bundle');
  });

  it('normaliza respuestas generativas para mantener bundles y handoff consistentes', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
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
        },
      },
    });

    const reply = await service.generateReply({
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
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
    });

    expect(reply.recommendedProducts.map((item) => item.name)).toEqual([
      'Huevo Blanco Extra (Bandeja 30 un)',
      'Queso Chanco de Lican Ray',
    ]);
    expect(reply.suggestedBundle.title).toBe('Opcion clara para avanzar');
    expect(reply.suggestedBundle.items).toEqual(['Huevo Blanco Extra (Bandeja 30 un)']);
    expect(reply.nextStep).toBe('preclose');
    expect(reply.quickReplies.some((item) => item.intent === 'human_handoff')).toBe(true);
    expect(reply.quickReplies[0].label).toBe('Si, quiero esa propuesta');
    expect(reply.quickReplies.some((item) => item.label === 'Te doy esos datos')).toBe(true);
    expect(reply.leadTemperature).toBe('listo_para_cierre');
    expect(reply.handoffSummary).toBeNull();
    expect(reply.handoffDetails.customerNeed).toContain('cliente interesado');
    expect(reply.handoffDetails.locationHint).toBe('Providencia');
    expect(reply.handoffDetails.channel).toBe('web_widget');
    expect(reply.handoffDetails.handoffReason).toContain('objecion');
    expect(reply.handoffDetails.lastCustomerMessage).toContain('Providencia');
    expect(reply.handoffDetails.proposedProducts).toContain('Huevo Blanco Extra (Bandeja 30 un)');
  });

  it('refuerza objeciones generativas con una salida comercial mas clara', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
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
        },
      },
    });

    const reply = await service.generateReply({
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
      catalog: [
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
    });

    expect(reply.message).toContain('Entiendo la duda');
    expect(reply.message).toContain('Queso Chanco de Lican Ray');
    expect(reply.quickReplies.length).toBeGreaterThanOrEqual(1);
  });

  it('refuerza pre-cierre generativo con resumen y siguiente paso claro', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            message: 'Te deje una opcion bastante ordenada.',
            quickReplies: [
              {
                label: 'Seguir',
                intent: 'continue_topic',
                payload: { topic: 'recommendation' },
              },
            ],
            recommendedProducts: [
              { name: 'Huevo Blanco Extra (Bandeja 30 un)', reason: 'Base principal.' },
              { name: 'Queso Chanco de Lican Ray', reason: 'Complemento directo.' },
            ],
            suggestedBundle: {
              title: 'Pack desayuno',
              summary: 'Una opcion simple.',
              items: ['Huevo Blanco Extra (Bandeja 30 un)', 'Queso Chanco de Lican Ray'],
              intent: 'bundle',
            },
            nextStep: 'preclose',
            detectedIntent: 'buy_specific',
            shouldHighlightHuman: false,
          });
        },
      },
    });

    const reply = await service.generateReply({
      message: 'Ya, dejame una propuesta para avanzar.',
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
        lastUserMessage: 'Quiero una propuesta',
      },
      quickReply: null,
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
    });

    expect(reply.message).toContain('En resumen');
    expect(reply.message).toContain('WhatsApp');
    expect(reply.quickReplies.some((item) => item.intent === 'human_handoff')).toBe(true);
    expect(reply.quickReplies[0].label).toBe('Si, quiero esa propuesta');
    expect(reply.quickReplies[1].label).toContain('Ajusta');
    expect(reply.leadTemperature).toBe('caliente');
    expect(reply.handoffDetails.channel).toBe('web_widget');
    expect(reply.handoffDetails.nextAction).toContain('validar propuesta');
    expect(reply.handoffDetails.bundleTitle).toBe('Pack desayuno');
  });

  it('pide contexto faltante antes de derivar si no hay datos suficientes para cierre humano', async () => {
    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            message: 'Ya podria dejarte una propuesta para cerrar.',
            quickReplies: [
              {
                label: 'Seguir',
                intent: 'continue_topic',
                payload: { topic: 'recommendation' },
              },
            ],
            recommendedProducts: [
              { name: 'Queso Chanco de Lican Ray', reason: 'Sirve bien para tabla y tostadas.' },
            ],
            nextStep: 'handoff',
            detectedIntent: 'buy_specific',
            shouldHighlightHuman: true,
          });
        },
      },
    });

    const reply = await service.generateReply({
      message: 'Ya, quiero avanzar con el queso',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
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
      quickReply: null,
      catalog: [
        {
          id: 4,
          name: 'Queso Chanco de Lican Ray',
          category: 'quesos',
          description: 'Queso tradicional del sur.',
          price: 5490,
          priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
          inStock: true,
          comingSoon: false,
          salesNote: 'Precio referencial',
        },
      ],
    });

    expect(reply.nextStep).toBe('preclose');
    expect(reply.message).toContain('Antes de pasarte con una persona');
    expect(reply.quickReplies.some((item) => item.label === 'Te doy esos datos')).toBe(true);
    expect(reply.handoffSummary).toBeNull();
    expect(reply.sessionContext.lastIntent).toBe('collect_handoff_details');
  });

  it('expone metadata de observabilidad para respuestas deterministicas y generativas', async () => {
    let generatorCalls = 0;

    const service = createSalesAssistantService({
      textGenerator: {
        async generateText() {
          generatorCalls += 1;
          return JSON.stringify({
            message: 'Te sugiero combinar huevos con queso para una compra mas completa.',
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

    const deterministic = await service.generateReplyResult({
      message: 'Cual es el precio?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: {
        id: 8,
        name: 'Huevo Blanco Extra (Bandeja 30 un)',
        category: 'huevos',
        description: 'Huevos frescos de campo.',
        price: 5990,
        priceLabel: '$5990',
        inStock: true,
        comingSoon: false,
        salesNote: 'Disponible',
      },
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
      ],
    });

    const generative = await service.generateReplyResult({
      message: 'Quiero una recomendacion para regalar',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog: [
        {
          id: 8,
          name: 'Huevo Blanco Extra (Bandeja 30 un)',
          category: 'huevos',
          description: 'Huevos frescos de campo.',
          price: 5990,
          priceLabel: '$5990',
          inStock: true,
          comingSoon: false,
          salesNote: 'Disponible',
        },
      ],
    });

    expect(deterministic.observability.resolvedBy).toBe('deterministic');
    expect(deterministic.observability.messageSource).toBe('free_text');
    expect(deterministic.observability.detectedIntent).toBe('price_or_format_doubt');
    expect(deterministic.observability.latencyMs).toBeGreaterThanOrEqual(0);

    expect(generative.observability.resolvedBy).toBe('generative');
    expect(generative.observability.detectedIntent).toBe('needs_recommendation');
    expect(generative.observability.nextStep).toBe('assist');
    expect(generatorCalls).toBe(1);
  });
});
