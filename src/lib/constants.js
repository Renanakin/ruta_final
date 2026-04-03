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
      extendedDescription: 'Nuestros huevos provienen de gallinas libres de estrés. Verás la diferencia en el color de la yema y la textura de tus preparaciones.',
      nutrition: ['Proteína de alta calidad', 'Yema de color intenso', 'Sin hormonas'],
      origin: 'Granjas del Valle Central, Chile',
      reviews: [
        'Increíble el sabor, nada que ver con los del súper.',
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
    extendedDescription: 'Nuestro "Huevo Extra" se caracteriza por su gran tamaño y frescura garantizada. Con un peso de entre 61 y 68 gramos por unidad, ofrece un mayor contenido nutricional y de yema por unidad.',
    nutrition: ['6.5g Proteína por huevo', 'Calibre 61g - 68g', 'Rico en Vitaminas A, D, E', 'Yema Naranja Natural'],
    origin: 'Granja Ruta del Nido, Chile',
    reviews: [
      'El tamaño es increíble, muy frescos.',
      'La yema es realmente naranja, como los de campo.',
      'Excelente promoción por caja, conviene mucho.'
    ]
  },
  {
    id: 4,
    name: 'Queso Mantecoso de Licán Ray Pieza de 500g',
    category: 'quesos',
    description: 'Queso artesanal directamente de la zona sur del país. Textura mantecosa y sabor auténtico.',
    price: 8500,
    image: '/images/QUESO_LICANRAY_FINAL.jpg',
    badge: 'Artesanal Sur',
    inStock: true,
    extendedDescription: 'Queso mantecoso artesanal producido en Licán Ray. Caracterizado por su suavidad y proceso tradicional. Ideal para tablas, sándwiches o simplemente disfrutar solo.',
    nutrition: ['359 Kcal Energía por 100g', '24.0g Proteína por 100g', '26.0g Grasas por 100g', 'Sodio: 1.8%'],
    origin: 'Licán Ray, IX Región, Chile',
    reviews: [
      'El sabor del sur en mi casa, espectacular.',
      'Muy cremoso, se nota la diferencia artesanal.',
      'Calidad superior, 100% recomendado.'
    ]
  },
  {
    id: 6,
    name: 'Queso Mantecoso de Púa (Horma)',
    category: 'quesos',
    description: 'Queso artesanal maduro del sur de Chile. Textura firme, sabor intenso y terroso curado con la técnica tradicional de púas.',
    price: 8500,
    image: '/images/QUESO_RUEDA_FINAL.jpg',
    badge: 'Selección Nido',
    inStock: true,
    extendedDescription: 'El Queso de Púa es una joya de la quesería artesanal chilena. Su nombre proviene de la técnica tradicional de perforar la horma con finas púas o agujas, creando canales internos que permiten una maduración profunda y un desarrollo de sabores único. De textura firme y ligeramente abierta, ofrece un perfil de sabor intenso, terroso y ligeramente picante — muy distinto a los quesos frescos. Un producto de herencia campesina del sur de Chile, elaborado en lotes pequeños y curado con dedicación artesanal.',
    nutrition: ['359 Kcal Energía por 100g', '24.0g Proteína por 100g', 'Textura Cremosa', 'Sodio: 1.8%'],
    origin: 'Campos del Sur de Chile',
    reviews: [
      'Increíble presentación y sabor único.',
      'El favorito de la familia.',
      'Sabor artesanal incomparable.'
    ]
  },
  {
    id: 7,
    name: 'Longaniza Artesanal de Contulmo (Baja en Grasa)',
    category: 'embutidos',
    description: 'Receta tradicional española, elaborada artesanalmente en Contulmo. Sabor auténtico con menos grasa.',
    price: 9600,
    image: '/images/LONGANIZA_CONTULMO.jpg',
    badge: 'Referencia $9.600/kg',
    inStock: true,
    extendedDescription: 'Nuestra famosa longaniza de Contulmo sigue una receta española centenaria. Seleccionamos cortes magros para asegurar un producto bajo en grasa pero con el característico sabor del pimentón y ajo chileno. *El precio final depende del peso exacto de la pieza.',
    nutrition: ['178 Kcal por 100g', '18.0g Proteína por 100g', 'Baja en grasas saturadas', 'Sin conservantes industriales'],
    origin: 'Contulmo, Región del Biobío, Chile',
    reviews: [
      'La mejor longaniza que he comido, no cae pesada.',
      'Sabor artesanal de verdad, perfecto para el asado.',
      'Textura firme y muy poca grasa.'
    ]
  },
  {
    id: 2,
    name: 'Salmón porcionado 500g',
    category: 'congelados',
    description: 'Cortes premium seleccionados. Calidad de exportación en formato práctico y congelado IQF.',
    price: 7990,
    image: '/images/SALMON_PREMIUM_BAG.png',
    badge: 'Contenido 500g',
    inStock: true,
    extendedDescription: 'Porciones de salmón premium por Sea Garden. Producto seleccionado y congelado individualmente (IQF). Ideal para una cocción uniforme y frescura preservada.',
    nutrition: ['21.0g Proteína por porción', '138 Kcal Energía', '5.9g Grasas Saludables', 'Sodio: 122mg'],
    origin: 'Aguas del Sur de Chile (Puerto Montt)',
    reviews: [
      'La porción justa para un almuerzo saludable.',
      'Excelente color y textura, muy fresco.',
      'Formato muy práctico para no desperdiciar nada.'
    ]
  },
  {
    id: 3,
    name: 'Surtido de Mariscos Premium Mix',
    category: 'congelados',
    description: 'Chorito, ostión, calamar, camarón y almeja. Una selección premium para transformar tu mesa en una experiencia gourmet.',
    price: 5500,
    image: '/images/SURTIDO_MARISCOS_PREMIUM.png',
    badge: 'Contenido 1kg',
    inStock: true,
    extendedDescription: 'Exclusivo mix "Premium Mix" por Sea Garden. Incluye chorito, ostión, calamar, camarón y almeja. Congelado IQF para mantener frescura máxima y facilidad al repartir.',
    nutrition: ['22.0g Proteína por porción', '125 Kcal Energía', 'Solo 3.0g de Grasa', 'Sodio: 273mg'],
    origin: 'Importado por Sea Garden Spa. Producto de China.',
    reviews: [
      'Increíble variedad para preparar una paila marina premium.',
      'Llegaron súper limpios y muy sabrosos.',
      'Calidad superior comparada con el retail tradicional.'
    ]
  },
  {
    id: 5,
    name: 'Camarón Cocido Pelado ECO',
    category: 'congelados',
    description: 'Camarones cocidos y pelados listos para servir. El equilibrio perfecto entre sabor y conveniencia.',
    price: 6800,
    image: '/images/CAMARON_ECO_BAG.png',
    badge: 'Formato IQF',
    inStock: true,
    extendedDescription: 'Camarón cocido y pelado "ECO" por Sea Garden. Formato ideal para ensaladas, ceviches o pastas rápidas. Calidad uniforme y limpieza garantizada.',
    nutrition: ['18.0g Proteína por porción', '78 Kcal Energía', 'Bajo en grasas (0.8g)', 'Sodio: 458mg'],
    origin: 'Importado por Sea Garden Spa. Producto de China.',
    reviews: [
      'Vienen súper limpios y el tamaño es ideal.',
      'Muy buena relación precio calidad.',
      'Perfectos para tener siempre en el freezer.'
    ]
  },
  {
    id: 9,
    name: 'Longaniza de Capitán Pastene',
    category: 'embutidos',
    description: 'Receta tradicional italiana, ahumada con madera nativa de Nahuelbuta. 100% cerdo y artesanal.',
    price: 0, // Precio pendiente - Aparecerá como "Próximamente"
    image: '/images/LONGANIZA_PASTENE.jpg',
    badge: 'NUEVA LLEGADA | RECETA ITALIANA',
    inStock: true,
    extendedDescription: 'Una verdadera joya gastronómica del sur. Esta longaniza artesanal rescata la herencia de los colonos italianos de Módena. Elaborada con carne y tocino 100% de cerdo, aliñada con especias seleccionadas y ahumada lentamente con madera nativa de Nahuelbuta. Su perfil es superior: más magra y proteica que las opciones industriales. Tradición, sabor y calidad premium en cada bocado.',
    nutrition: [
      '78 kcal por porción (45g)',
      '7.3g Proteínas por porción',
      'Perfil Magro: 5.2g grasas',
      '0g Carbohidratos (Artesanal)'
    ],
    origin: 'Capitán Pastene, Región de La Araucanía, Chile',
    reviews: [
      'Se nota de inmediato el ahumado natural, un sabor profundo y muy distinto a lo común.',
      'Muy superior a cualquier longaniza tradicional, textura firme y nada de grasa en exceso.',
      'Producto con identidad real del sur, fue la estrella de mi último asado.'
    ]
  },
  {
    id: 10,
    name: 'Costillar de Cerdo Nacional',
    category: 'costillares',
    description: 'Costillar de criaderos artesanales del sur. Carne de alta calidad con excelente infiltración.',
    price: 0,
    image: '/images/COSTILLAR_NACIONAL.png',
    badge: 'NUEVO',
    inStock: true,
    comingSoon: true,
    extendedDescription: 'Costillar proveniente de criaderos artesanales del sur de Chile. Carne de cerdo de alta calidad, no industrial, con excelente infiltración y sabor natural. Un producto de origen artesanal, no masivo, directo de los campos del sur.',
    nutrition: ['220 Kcal por 100g', '18g Proteína', '16g Grasas', 'Natural, sin marinado industrial'],
    origin: 'Sur de Chile',
    reviews: [
      'Llegó muy bien sellado.',
      'Se nota que es nacional de verdad.',
      'Calidad superior.'
    ]
  },
  {
    id: 11,
    name: 'Costillar Ahumado Capitán Pastene',
    category: 'costillares',
    description: 'Ahumado 48H con madera nativa. Receta tradicional de influencia italiana. Sabor incomparable.',
    price: 0,
    image: '/images/COSTILLAR_AHUMADO.png',
    badge: 'AHUMADO PREMIUM',
    inStock: true,
    comingSoon: true,
    extendedDescription: 'Costillar ahumado durante 48 horas, aliñado con sal y orégano. Receta tradicional de Capitán Pastene con influencia italiana. Disponible en piezas de 1KG al vacío o costillar completo de aproximadamente 5KG.',
    nutrition: ['250 Kcal por 100g', '20g Proteína', 'Textura tierna', 'Ahumado Natural'],
    origin: 'Capitán Pastene, Chile',
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

export function createSessionId() {
  if (typeof window === 'undefined') return 'server';
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
