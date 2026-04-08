import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export const PRODUCTS = [
  {
    id: 1,
    name: 'Huevo de Gallina Feliz Premium',
    category: 'huevos',
    description: 'Yema naranja, sabor intenso y real de campo. Libres de jaulas, alimentadas con granos naturales.',
    price: 8400,
    image: '/images/EGGS_EPIC.png',
    badge: 'Premium',
    inStock: true,
    extendedDescription: 'Nuestros huevos provienen de gallinas libres de estres. Veras la diferencia en el color de la yema y la textura de tus preparaciones.',
    nutrition: ['Proteina de alta calidad', 'Yema de color intenso', 'Sin hormonas'],
    origin: 'Granjas del Valle Central, Chile',
    reviews: [
      'Increible el sabor, nada que ver con los del super.',
      'La yema es naranja de verdad.',
      'Llegan siempre frescos.'
    ]
  },
  {
    id: 8,
    name: 'Huevo Blanco Extra (Bandeja 30 un)',
    category: 'huevos',
    description: 'Calibre Superior (61g - 68g). Yema de color intenso y clara densa para resultados gourmet.',
    price: 7900,
    image: '/images/HUEVOS_EXTRA_TRAY.png',
    badge: 'Extra Grande',
    inStock: true,
    extendedDescription: 'Nuestro Huevo Extra se caracteriza por su gran tamano y frescura garantizada. Con un peso de entre 61 y 68 gramos por unidad, ofrece mayor contenido nutricional y de yema por unidad.',
    nutrition: ['6.5g Proteina por huevo', 'Calibre 61g - 68g', 'Rico en Vitaminas A, D, E', 'Yema Naranja Natural'],
    origin: 'Granja Ruta del Nido, Chile',
    reviews: [
      'El tamano es increible, muy frescos.',
      'La yema es realmente naranja, como los de campo.',
      'Excelente promocion por caja, conviene mucho.'
    ]
  },
  {
    id: 4,
    name: 'Queso Chanco de Lican Ray',
    category: 'quesos',
    description: 'Queso artesanal del sur, de textura cremosa y sabor autentico.',
    price: 4250,
    image: '/images/QUESO_LICANRAY_FINAL.jpg',
    badge: 'Referencia $4.250 / 1/4 kg',
    inStock: true,
    extendedDescription: 'Queso chanco artesanal producido en Lican Ray, elaborado con metodo tradicional para lograr una textura suave, cremosa y de excelente fundido. Ideal para tablas, sandwiches y cocina diaria.',
    nutrition: ['359 Kcal Energia por 100g', '24.0g Proteina por 100g', '26.0g Grasas por 100g', 'Sodio: 1.8%'],
    origin: 'Lican Ray, IX Region, Chile',
    reviews: [
      'El sabor del sur en mi casa, espectacular.',
      'Muy cremoso, se nota la diferencia artesanal.',
      'Calidad superior, 100% recomendado.'
    ]
  },
  {
    id: 6,
    name: 'Queso Mantecoso de Pua (Horma)',
    category: 'quesos',
    description: 'Queso mantecoso artesanal, cremoso y de sabor intenso del sur de Chile.',
    price: 4250,
    image: '/images/QUESO_RUEDA_FINAL.jpg',
    badge: 'Referencia $4.250 / 1/4 kg',
    inStock: true,
    extendedDescription: 'Queso mantecoso de Pua elaborado en lotes artesanales, con maduracion cuidada para lograr cremosidad, buena estructura al corte y sabor persistente. Excelente para compartir o elevar cualquier preparacion.',
    nutrition: ['359 Kcal Energia por 100g', '24.0g Proteina por 100g', 'Textura Cremosa', 'Sodio: 1.8%'],
    origin: 'Campos del Sur de Chile',
    reviews: [
      'Increible presentacion y sabor unico.',
      'El favorito de la familia.',
      'Sabor artesanal incomparable.'
    ]
  },
  {
    id: 7,
    name: 'Longaniza Artesanal de Contulmo (Baja en Grasa)',
    category: 'embutidos',
    description: 'Receta tradicional espanola, elaborada artesanalmente en Contulmo. Sabor autentico con menos grasa.',
    price: 9600,
    image: '/images/LONGANIZA_CONTULMO.jpg',
    badge: 'Referencia $9.600/kg',
    inStock: true,
    extendedDescription: 'Nuestra famosa longaniza de Contulmo sigue una receta espanola centenaria. Seleccionamos cortes magros para asegurar un producto bajo en grasa pero con el caracteristico sabor del pimenton y ajo chileno. El precio final depende del peso exacto de la pieza.',
    nutrition: ['178 Kcal por 100g', '18.0g Proteina por 100g', 'Baja en grasas saturadas', 'Sin conservantes industriales'],
    origin: 'Contulmo, Region del Biobio, Chile',
    reviews: [
      'La mejor longaniza que he comido, no cae pesada.',
      'Sabor artesanal de verdad, perfecto para el asado.',
      'Textura firme y muy poca grasa.'
    ]
  },
  {
    id: 2,
    name: 'Salmon porcionado 500g',
    category: 'congelados',
    description: 'Cortes premium seleccionados. Calidad de exportacion en formato practico y congelado IQF.',
    price: 7990,
    image: '/images/SALMON_PREMIUM_BAG.png',
    badge: 'Contenido 500g',
    inStock: true,
    extendedDescription: 'Porciones de salmon premium por Sea Garden. Producto seleccionado y congelado individualmente (IQF). Ideal para una coccion uniforme y frescura preservada.',
    nutrition: ['21.0g Proteina por porcion', '138 Kcal Energia', '5.9g Grasas Saludables', 'Sodio: 122mg'],
    origin: 'Aguas del Sur de Chile (Puerto Montt)',
    reviews: [
      'La porcion justa para un almuerzo saludable.',
      'Excelente color y textura, muy fresco.',
      'Formato muy practico para no desperdiciar nada.'
    ]
  },
  {
    id: 3,
    name: 'Surtido de Mariscos Premium Mix',
    category: 'congelados',
    description: 'Chorito, ostion, calamar, camaron y almeja. Una seleccion premium para transformar tu mesa en una experiencia gourmet.',
    price: 5500,
    image: '/images/SURTIDO_MARISCOS_PREMIUM.png',
    badge: 'Contenido 1kg',
    inStock: true,
    extendedDescription: 'Exclusivo mix Premium Mix por Sea Garden. Incluye chorito, ostion, calamar, camaron y almeja. Congelado IQF para mantener frescura maxima y facilidad al repartir.',
    nutrition: ['22.0g Proteina por porcion', '125 Kcal Energia', 'Solo 3.0g de Grasa', 'Sodio: 273mg'],
    origin: 'Importado por Sea Garden Spa. Producto de China.',
    reviews: [
      'Increible variedad para preparar una paila marina premium.',
      'Llegaron super limpios y muy sabrosos.',
      'Calidad superior comparada con el retail tradicional.'
    ]
  },
  {
    id: 5,
    name: 'Camaron Cocido Pelado ECO',
    category: 'congelados',
    description: 'Camarones cocidos y pelados listos para servir. El equilibrio perfecto entre sabor y conveniencia.',
    price: 6800,
    image: '/images/CAMARON_ECO_BAG.png',
    badge: 'Formato IQF',
    inStock: true,
    extendedDescription: 'Camaron cocido y pelado ECO por Sea Garden. Formato ideal para ensaladas, ceviches o pastas rapidas. Calidad uniforme y limpieza garantizada.',
    nutrition: ['18.0g Proteina por porcion', '78 Kcal Energia', 'Bajo en grasas (0.8g)', 'Sodio: 458mg'],
    origin: 'Importado por Sea Garden Spa. Producto de China.',
    reviews: [
      'Vienen super limpios y el tamano es ideal.',
      'Muy buena relacion precio calidad.',
      'Perfectos para tener siempre en el freezer.'
    ]
  },
  {
    id: 9,
    name: 'Longaniza de Capitan Pastene',
    category: 'embutidos',
    description: 'Receta tradicional italiana, ahumada con madera nativa de Nahuelbuta. 100% cerdo y artesanal.',
    price: 0,
    image: '/images/LONGANIZA_PASTENE.jpg',
    badge: 'NUEVA LLEGADA | RECETA ITALIANA',
    inStock: true,
    extendedDescription: 'Una verdadera joya gastronomica del sur. Esta longaniza artesanal rescata la herencia de los colonos italianos de Modena. Elaborada con carne y tocino 100% de cerdo, alinada con especias seleccionadas y ahumada lentamente con madera nativa de Nahuelbuta.',
    nutrition: ['78 kcal por porcion (45g)', '7.3g Proteinas por porcion', 'Perfil Magro: 5.2g grasas', '0g Carbohidratos (Artesanal)'],
    origin: 'Capitan Pastene, Region de La Araucania, Chile',
    reviews: [
      'Se nota de inmediato el ahumado natural, un sabor profundo y muy distinto a lo comun.',
      'Muy superior a cualquier longaniza tradicional, textura firme y nada de grasa en exceso.',
      'Producto con identidad real del sur, fue la estrella de mi ultimo asado.'
    ]
  },
  {
    id: 10,
    name: 'Costillar de Cerdo Nacional',
    category: 'costillares',
    description: 'Costillar de criaderos artesanales del sur. Carne de alta calidad con excelente infiltracion.',
    price: 0,
    image: '/images/COSTILLAR_NACIONAL.png',
    badge: 'NUEVO',
    inStock: true,
    comingSoon: true,
    extendedDescription: 'Costillar proveniente de criaderos artesanales del sur de Chile. Carne de cerdo de alta calidad, no industrial, con excelente infiltracion y sabor natural.',
    nutrition: ['220 Kcal por 100g', '18g Proteina', '16g Grasas', 'Natural, sin marinado industrial'],
    origin: 'Sur de Chile',
    reviews: [
      'Llego muy bien sellado.',
      'Se nota que es nacional de verdad.',
      'Calidad superior.'
    ]
  },
  {
    id: 11,
    name: 'Costillar Ahumado Capitan Pastene',
    category: 'costillares',
    description: 'Ahumado 48H con madera nativa. Receta tradicional de influencia italiana. Sabor incomparable.',
    price: 0,
    image: '/images/COSTILLAR_AHUMADO.png',
    badge: 'AHUMADO PREMIUM',
    inStock: true,
    comingSoon: true,
    extendedDescription: 'Costillar ahumado durante 48 horas, alinado con sal y oregano. Receta tradicional de Capitan Pastene con influencia italiana.',
    nutrition: ['250 Kcal por 100g', '20g Proteina', 'Textura tierna', 'Ahumado Natural'],
    origin: 'Capitan Pastene, Chile',
    reviews: [
      'El mejor costillar ahumado que he probado.',
      'Sabor artesanal incomparable.',
      'Perfecto para calentar y servir.'
    ]
  }
];

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '56947529379';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';
export const BRAND_NAME = 'Ruta del Nido';
export const BRAND_FULL_NAME = 'Ruta del Nido - Alimentos Naturales';
export const PRICE_PLACEHOLDER = 'Proximamente';
export const FLOATING_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = 'https://www.instagram.com/rutadelnido/';
export const ANALYTICS_SCHEMA_VERSION = '1.0';

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppProductUrl(productName) {
  return buildWhatsAppUrl(`Hola ${BRAND_NAME}, me estoy contactando desde su sitio web. Estoy interesado/a en: ${productName}.`);
}

export function buildWhatsAppContextUrl(contextLabel) {
  return buildWhatsAppUrl(`Hola ${BRAND_NAME}, me estoy contactando desde su sitio web. Quiero ayuda con: ${contextLabel}.`);
}

export function buildWhatsAppSalesHandoffUrl({ summary, details } = {}) {
  const lines = [
    `Hola ${BRAND_NAME}, me estoy contactando desde su sitio web.`,
    details?.channel ? `Canal: ${details.channel}` : null,
    details?.customerNeed ? `Interes: ${details.customerNeed}` : null,
    details?.useContext ? `Uso: ${details.useContext}` : null,
    details?.locationHint ? `Ubicacion: ${details.locationHint}` : null,
    details?.urgencyHint ? `Urgencia: ${details.urgencyHint}` : null,
    details?.proposedProducts?.length ? `Propuesta: ${details.proposedProducts.join(', ')}` : null,
    details?.bundleTitle ? `Bundle: ${details.bundleTitle}` : null,
    details?.leadTemperature ? `Temperatura: ${details.leadTemperature}` : null,
    details?.handoffReason ? `Motivo de derivacion: ${details.handoffReason}` : null,
    details?.lastCustomerMessage ? `Ultimo mensaje cliente: ${details.lastCustomerMessage}` : null,
    details?.nextAction ? `Siguiente paso sugerido: ${details.nextAction}` : null,
    summary ? `Resumen: ${summary}` : null,
  ].filter(Boolean);

  return buildWhatsAppUrl(lines.join('\n'));
}

export function createSessionId() {
  if (typeof window === 'undefined') return 'server';
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
