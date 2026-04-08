import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const PRODUCTS = [
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
    extendedDescription: 'Nuestro "Huevo Extra" se caracteriza por su gran tamaño y frescura garantizada. Con un peso de entre 61 y 68 gramos por unidad, ofrece un mayor contenido nutricional y de yema por unidad.',
    nutrition: ['6.5g Proteina por huevo', 'Calibre 61g - 68g', 'Rico en Vitaminas A, D, E', 'Yema Naranja Natural'],
    origin: 'Granja Ruta del Nido, Chile',
    reviews: [
      'El tamaño es increible, muy frescos.',
      'La yema es realmente naranja, como los de campo.',
      'Excelente promocion por caja, conviene mucho.'
    ]
  },
  {
    id: 4,
    name: 'Queso Chanco de Licán Ray Pieza de 500g',
    category: 'quesos',
    description: 'Queso artesanal directamente de la zona sur del país. Textura mantecosa y sabor auténtico.',
    price: 8500,
    image: '/images/QUESO_LICANRAY_FINAL.jpg',
    badge: 'Artesanal Sur',
    inStock: true,
    extendedDescription: 'Queso mantecoso artesanal producido en Licán Ray. Caracterizado por su suavidad y proceso tradicional. Ideal para tablas, sándwiches o simplemente disfrutar solo.',
    nutrition: ['359 Kcal Energia por 100g', '24.0g Proteina por 100g', '26.0g Grasas por 100g', 'Sodio: 1.8%'],
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
    extendedDescription: 'El Queso de Pua es una joya de la queseria artesanal chilena. Su nombre proviene de la tecnica tradicional de perforar la horma con finas puas o agujas, creando canales internos que permiten una maduracion profunda y un desarrollo de sabores unico. De textura firme y ligeramente abierta, ofrece un perfil de sabor intenso, terroso y ligeramente picante. Un producto de herencia campesina del sur de Chile, elaborado en lotes pequenos y curado con dedicacion artesanal.',
    nutrition: ['359 Kcal por 100g', '24.0g Proteina por 100g', 'Textura Cremosa', 'Sodio: 1.8%'],
    origin: 'Campos del Sur de Chile',
    reviews: [
      'Increible presentacion y sabor unico.',
      'El favorito de la familia.',
      'Sabor artesanal incomparable.'
    ]
  },
  {
    id: 7,
    name: 'Longaniza de Contulmo Artesanal (Baja en Grasa)',
    category: 'embutidos',
    description: 'Receta tradicional española, elaborada artesanalmente en Contulmo. Sabor auténtico con menos grasa.',
    price: 9600,
    image: '/images/LONGANIZA_CONTULMO.jpg',
    badge: 'Referencia $9.600/kg',
    inStock: true,
    extendedDescription: 'Nuestra famosa longaniza de Contulmo sigue una receta española centenaria. Seleccionamos cortes magros para asegurar un producto bajo en grasa pero con el caracteristico sabor del pimenton y ajo chileno. *El precio final depende del peso exacto de la pieza.',
    nutrition: ['178 Kcal por 100g', '18.0g Proteina por 100g', 'Baja en grasas saturadas', 'Sin conservantes industriales'],
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
    description: 'Chorito, ostión, calamar, camarón y almeja. Una seleccion premium para transformar tu mesa en una experiencia gourmet.',
    price: 5500,
    image: '/images/SURTIDO_MARISCOS_PREMIUM.png',
    badge: 'Contenido 1kg',
    inStock: true,
    extendedDescription: 'Exclusivo mix "Premium Mix" por Sea Garden. Incluye chorito, ostion, calamar, camaron y almeja. Congelado IQF para mantener frescura maxima y facilidad al repartir.',
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
    name: 'Camarón Cocido Pelado ECO',
    category: 'congelados',
    description: 'Camarones cocidos y pelados listos para servir. El equilibrio perfecto entre sabor y conveniencia.',
    price: 6800,
    image: '/images/CAMARON_ECO_BAG.png',
    badge: 'Formato IQF',
    inStock: true,
    extendedDescription: 'Camaron cocido y pelado "ECO" por Sea Garden. Formato ideal para ensaladas, ceviches o pastas rapidas. Calidad uniforme y limpieza garantizada.',
    nutrition: ['18.0g Proteina por porcion', '78 Kcal Energia', 'Bajo en grasas (0.8g)', 'Sodio: 458mg'],
    origin: 'Importado por Sea Garden Spa. Producto de China.',
    reviews: [
      'Vienen super limpios y el tamaño es ideal.',
      'Muy buena relacion precio calidad.',
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
    ],
    comingSoon: true
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

async function syncDb() {
  const db = await open({
    filename: process.env.SQLITE_PATH || './database_dev_local.sqlite',
    driver: sqlite3.Database
  });

  // Limpiar tabla productos
  await db.run('DELETE FROM products');
  
  // Insertar todos los productos
  const stmt = await db.prepare(
    'INSERT INTO products (id, name, description, price, image, badge, in_stock, extended_description, nutrition, origin, reviews, category, coming_soon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const p of PRODUCTS) {
    await stmt.run(
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.badge,
      p.inStock ? 1 : 0,
      p.extendedDescription,
      JSON.stringify(p.nutrition || []),
      p.origin,
      JSON.stringify(p.reviews || []),
      p.category,
      p.comingSoon ? 1 : 0
    );
  }

  await stmt.finalize();
  console.log(`Sincronizados ${PRODUCTS.length} productos con éxito.`);
  await db.close();
}

syncDb().catch(console.error);
