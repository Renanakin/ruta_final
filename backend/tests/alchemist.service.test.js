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
});
