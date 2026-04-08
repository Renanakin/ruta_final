import { describe, expect, it } from 'vitest';
import { resolveDeterministicSalesReply } from '../../alchemist/src/sales/sales.deterministic.js';

const catalog = [
  {
    id: 8,
    name: 'Huevo Blanco Extra (Bandeja 30 un)',
    category: 'huevos',
    description: 'Huevos frescos de campo.',
    price: 5990,
    priceLabel: '$5990',
    badge: 'Mas vendido',
    inStock: true,
    comingSoon: false,
    commercialState: 'available',
    salesNote: 'Producto visible en catalogo. La confirmacion final de disponibilidad la hace el equipo humano.',
    origin: 'Granja Ruta del Nido, Chile',
  },
  {
    id: 4,
    name: 'Queso Chanco de Lican Ray',
    category: 'quesos',
    description: 'Queso tradicional del sur.',
    price: 5490,
    priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
    badge: 'Artesanal',
    inStock: true,
    comingSoon: false,
    commercialState: 'available',
    salesNote: 'Explicar siempre que el valor publicado es referencial por 1/4 kg y el final depende del peso real.',
    origin: 'Lican Ray, IX Region, Chile',
  },
  {
    id: 15,
    name: 'Longaniza de Capitán Pastene',
    category: 'embutidos',
    description: 'Longaniza tradicional ahumada.',
    price: 8990,
    priceLabel: 'Lanzamiento proximo',
    badge: 'Nuevo',
    inStock: false,
    comingSoon: true,
    commercialState: 'coming_soon',
    salesNote: 'Figura como lanzamiento proximo. Se puede captar interes, pero no confirmar venta.',
    origin: 'Capitan Pastene, Chile',
  },
  {
    id: 6,
    name: 'Queso Mantecoso de Pua (Horma)',
    category: 'quesos',
    description: 'Queso mantecoso artesanal, cremoso y de sabor intenso del sur de Chile.',
    price: 5490,
    priceLabel: 'Valor referencial por 1/4 kg; el final depende del peso real.',
    badge: 'Horma',
    inStock: true,
    comingSoon: false,
    commercialState: 'available',
    salesNote: 'Explicar siempre que el valor publicado es referencial por 1/4 kg y el final depende del peso real.',
    origin: 'Campos del Sur de Chile',
    extendedDescription: 'Queso mantecoso de Pua elaborado en lotes artesanales, con maduracion cuidada para lograr cremosidad, buena estructura al corte y sabor persistente. Excelente para compartir o elevar cualquier preparacion.',
  },
];

describe('Sales deterministic resolver', () => {
  it('resuelve precio de un producto actual sin usar el modelo', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Cual es el precio?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: catalog[0],
      recentProducts: [catalog[1]],
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
      catalog,
    });

    expect(reply.message).toContain('$5990');
    expect(reply.detectedIntent).toBe('price_or_format_doubt');
    expect(reply.sessionContext.currentProductId).toBe(8);
  });

  it('resuelve disponibilidad de coming soon con handoff sugerido', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Esta disponible la longaniza?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.nextStep).toBe('handoff');
    expect(reply.shouldHighlightHuman).toBe(true);
    expect(reply.message).toContain('lanzamiento proximo');
  });

  it('lista una categoria usando catalogo visible', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Que quesos tienen hoy?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.recommendedProducts.length).toBeGreaterThan(0);
    expect(reply.message).toContain('quesos');
    expect(reply.quickReplies[0].intent).toBe('show_price');
  });

  it('resuelve detalles visibles de un producto sin LLM', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Cuentame mas del queso chanco de lican ray',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.message).toContain('Queso Chanco de Lican Ray');
    expect(reply.message).toContain('Origen');
    expect(reply.message).toContain('Hechos visibles');
    expect(reply.message).toContain('perfil chanco');
    expect(reply.message).toContain('Perfil visible');
    expect(reply.quickReplies[1].intent).toBe('show_format');
  });

  it('resuelve formato visible de un producto', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Que formato tiene el huevo blanco extra?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.message).toContain('Bandeja');
    expect(reply.sessionContext.lastIntent).toBe('show_format');
    expect(reply.quickReplies[0].intent).toBe('show_details');
  });

  it('muestra formato correcto en quesos sin convertir 1/4 kg a 4 kg', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Que formato tiene el queso mantecoso de pua?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.message).toContain('formato 400 a 500 gr');
    expect(reply.message).not.toContain('formato 4 kg');
    expect(reply.sessionContext.lastIntent).toBe('show_format');
  });

  it('resuelve uso visible de un producto por categoria', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Este queso me sirve para tabla?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: catalog[1],
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
      catalog,
    });

    expect(reply.sessionContext.lastIntent).toBe('show_usage');
    expect(reply.message).toContain('tabla');
    expect(reply.message).toContain('Hechos visibles');
    expect(reply.quickReplies[0].intent).toBe('show_details');
  });

  it('resuelve uso visible de una categoria sin elegir producto aun', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Que me conviene en embutidos para asado?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.detectedIntent).toBe('needs_recommendation');
    expect(reply.sessionContext.category).toBe('embutidos');
    expect(reply.message).toContain('asado');
    expect(reply.recommendedProducts.length).toBeGreaterThan(0);
  });

  it('prioriza mejor la opcion visible dentro de una categoria segun uso', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Que queso me conviene para fundir?',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: null,
      recentProducts: [],
      sessionContext: null,
      quickReply: null,
      catalog,
    });

    expect(reply.detectedIntent).toBe('needs_recommendation');
    expect(reply.message).toContain('Queso Mantecoso de Pua (Horma)');
    expect(reply.recommendedProducts[0].name).toBe('Queso Mantecoso de Pua (Horma)');
  });

  it('compara dos productos desde el contexto corto', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Comparalos',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: catalog[0],
      recentProducts: [catalog[1]],
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
      catalog,
    });

    expect(reply.detectedIntent).toBe('comparing');
    expect(reply.message).toContain(catalog[0].name);
    expect(reply.message).toContain(catalog[1].name);
    expect(reply.message).toContain('Origen visible');
    expect(reply.message).toContain('Descripcion visible');
    expect(reply.message).toContain('Hechos de familia');
    expect(reply.sessionContext.comparedProductIds).toEqual([8, 4]);
  });

  it('agrega comparacion especializada cuando los productos son de la misma familia', () => {
    const reply = resolveDeterministicSalesReply({
      message: 'Comparalos para fundir',
      locale: 'es-CL',
      pagePath: '/',
      currentProduct: catalog[1],
      recentProducts: [catalog[3]],
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
      catalog,
    });

    expect(reply.message).toContain('Dentro de quesos');
    expect(reply.message).toContain('queda mejor perfilado');
    expect(reply.message).toContain('Queso Mantecoso de Pua (Horma)');
  });
});
