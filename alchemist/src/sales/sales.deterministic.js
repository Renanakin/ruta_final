const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const uniqueById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const buildQuickReply = (label, intent, payload = {}) => ({
  label,
  intent,
  payload,
});

const normalizeLabel = (value = '') => value
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const buildRecommendation = (product, reason) => ({
  name: product.name,
  reason,
});

const CATEGORY_USAGE_GUIDES = {
  huevos: {
    default: 'Se mueven bien para desayuno, cocina diaria y preparaciones donde importa una buena yema y una clara firme.',
    desayuno: 'Van muy bien para desayuno y brunch, sobre todo cuando buscas una yema marcada y buena presencia en el plato.',
    reposteria: 'Sirven para reposteria y masas donde ayuda tener calibre parejo y buen rendimiento por unidad.',
    cocina_diaria: 'Funcionan bien para tortillas, revueltos, sandwiches y cocina diaria.',
  },
  quesos: {
    default: 'Se usan bien para tablas, sandwiches, picoteo y cocina donde importa textura y fundido.',
    tabla: 'Van bien para tabla y picoteo porque aportan presencia, corte y sabor visible.',
    sandwich: 'Funcionan muy bien en sandwiches, tostadas y preparaciones calientes.',
    fundir: 'Sirven para fundir o gratinar cuando buscas textura cremosa y buena respuesta al calor.',
  },
  embutidos: {
    default: 'Van bien para asado, picoteo o sandwiches con perfil mas intenso.',
    asado: 'Funcionan bien para asado o parrilla, donde se aprecia mejor su sabor y textura.',
    tabla: 'Sirven para picoteo o tabla salada si buscas algo mas sabroso y directo.',
    sandwich: 'Tambien se pueden mover en sandwich o pan caliente cuando quieres un perfil mas marcado.',
  },
  congelados: {
    default: 'Resuelven bien almuerzos rapidos y cocina practica con formato facil de porcionar.',
    pasta: 'Van bien para pasta y salteados porque el formato ayuda a cocinar porcionado y rapido.',
    ceviche: 'Algunos sirven para preparaciones frias o marinas cuando el producto ya viene limpio o porcionado.',
    almuerzo: 'Funcionan bien para almuerzo rapido, plancha u horno segun el producto.',
  },
  costillares: {
    default: 'Se piensan mas para horno, asado o una comida central con protagonismo.',
    asado: 'Van directo a contexto de asado o parrilla si buscas algo mas protagonista.',
    horno: 'Tambien calzan bien para horno lento o preparaciones de mesa mas abundantes.',
  },
};

const getFormatLabel = (product) => {
  if (product.category === 'quesos') {
    return '400 a 500 gr';
  }

  const sources = [
    product.badge,
    product.description,
    product.extendedDescription,
    product.name,
  ].filter(Boolean).join(' | ');

  const patterns = [
    /bandeja\s*\d+\s*un/i,
    /contenido\s*\d+\s*(kg|g)/i,
    /1\/4\s*kg/i,
    /\d+\s*(kg|g)\b/i,
    /\b\d+\s*un\b/i,
    /formato iqf/i,
    /horma/i,
    /porcionado\s*500g/i,
  ];

  for (const pattern of patterns) {
    const match = sources.match(pattern);
    if (match) return match[0];
  }

  return product.badge || 'Formato visible en ficha';
};

const summarizeDescription = (product) => product.description || product.extendedDescription || 'Producto visible en catalogo.';

const getFamilyFacts = (product) => {
  const searchText = buildProductSearchText(product);
  const facts = [];

  if (product.category === 'huevos') {
    if (searchText.includes('premium')) facts.push('perfil premium visible en la ficha');
    if (searchText.includes('extra')) facts.push('calibre grande o extra');
    if (searchText.includes('yema')) facts.push('enfasis visible en yema marcada');
    if (searchText.includes('clara')) facts.push('enfasis visible en clara firme');
  }

  if (product.category === 'quesos') {
    if (searchText.includes('artesanal')) facts.push('perfil artesanal');
    if (searchText.includes('cremosa')) facts.push('textura cremosa visible');
    if (searchText.includes('mantecoso')) facts.push('perfil mantecoso');
    if (searchText.includes('chanco')) facts.push('perfil chanco');
    facts.push('precio visible referencial por 1/4 kg');
  }

  if (product.category === 'embutidos') {
    if (searchText.includes('ahumad')) facts.push('perfil ahumado');
    if (searchText.includes('baja en grasa')) facts.push('perfil mas liviano o bajo en grasa');
    if (searchText.includes('artesanal')) facts.push('elaboracion artesanal visible');
  }

  if (product.category === 'congelados') {
    if (searchText.includes('iqf')) facts.push('formato IQF visible');
    if (searchText.includes('porcion')) facts.push('formato porcionado');
    if (searchText.includes('pelado')) facts.push('producto pelado o listo para usar');
    if (searchText.includes('premium')) facts.push('perfil premium visible');
    if (searchText.includes('mix')) facts.push('mezcla o surtido visible');
  }

  if (product.category === 'costillares') {
    if (searchText.includes('ahumad')) facts.push('perfil ahumado');
    if (searchText.includes('parrilla') || searchText.includes('asado')) facts.push('orientado a asado u horno');
  }

  return [...new Set(facts)];
};

const inferUseCase = (message) => {
  const normalizedMessage = normalizeText(message);

  if (/desayuno|brunch/.test(normalizedMessage)) return 'desayuno';
  if (/reposteria|queque|bizcocho|torta|masa/.test(normalizedMessage)) return 'reposteria';
  if (/tabla|picoteo|aperitivo/.test(normalizedMessage)) return 'tabla';
  if (/sandwich|sanguch|tostada/.test(normalizedMessage)) return 'sandwich';
  if (/fundir|gratin|hornead[oa] con queso/.test(normalizedMessage)) return 'fundir';
  if (/asado|parrilla|bbq/.test(normalizedMessage)) return 'asado';
  if (/pasta|fideos/.test(normalizedMessage)) return 'pasta';
  if (/ceviche/.test(normalizedMessage)) return 'ceviche';
  if (/horno/.test(normalizedMessage)) return 'horno';
  if (/almuerzo|comida/.test(normalizedMessage)) return 'almuerzo';
  if (/diario|todos los dias|diaria/.test(normalizedMessage)) return 'cocina_diaria';

  return null;
};

const getUsageGuide = (category, useCase) => {
  const guide = CATEGORY_USAGE_GUIDES[category];
  if (!guide) return null;
  return guide[useCase] || guide.default || null;
};

const CATEGORY_USE_SIGNALS = {
  huevos: {
    desayuno: ['desayuno', 'yema', 'clara', 'extra', 'premium', 'campo'],
    reposteria: ['calibre', 'parejo', 'unidad', 'bandeja'],
    cocina_diaria: ['campo', 'bandeja', 'gourmet', 'frescos'],
  },
  quesos: {
    tabla: ['artesanal', 'sabor', 'compartir', 'tabla'],
    sandwich: ['cremosa', 'sandwich', 'tostadas', 'cocina diaria'],
    fundir: ['cremosa', 'fundido', 'mantecoso', 'gratin', 'caliente'],
  },
  embutidos: {
    asado: ['ahumada', 'ahumado', 'artesanal', 'sabor', 'firme'],
    tabla: ['artesanal', 'sabor', 'directo'],
    sandwich: ['perfil', 'marcado', 'artesanal'],
  },
  congelados: {
    pasta: ['porcionado', 'porcion', 'pelado', 'rapidas', 'salteados', 'practico'],
    ceviche: ['pelado', 'limpios', 'servir'],
    almuerzo: ['premium', 'practico', 'porcionado', 'congelado'],
  },
  costillares: {
    asado: ['ahumado', 'parrilla', 'protagonista'],
    horno: ['horno', 'lento', 'abundantes'],
  },
};

const PRODUCT_FAMILY_PROFILES = [
  {
    match: (product) => normalizeText(product.name).includes('huevo de gallina feliz premium'),
    summary: 'huevo premium de campo con foco en sabor y yema marcada',
    useCases: ['desayuno', 'cocina_diaria'],
  },
  {
    match: (product) => normalizeText(product.name).includes('huevo blanco extra'),
    summary: 'bandeja extra de calibre grande y perfil practico para volumen',
    useCases: ['desayuno', 'reposteria', 'cocina_diaria'],
  },
  {
    match: (product) => normalizeText(product.name).includes('queso chanco'),
    summary: 'queso chanco artesanal con perfil versatil para tabla y sandwich',
    useCases: ['tabla', 'sandwich'],
  },
  {
    match: (product) => normalizeText(product.name).includes('queso mantecoso'),
    summary: 'queso mantecoso en horma con perfil mas cremoso para fundir',
    useCases: ['fundir', 'sandwich'],
  },
  {
    match: (product) => normalizeText(product.name).includes('longaniza artesanal de contulmo'),
    summary: 'longaniza artesanal con perfil mas liviano o baja en grasa',
    useCases: ['asado', 'sandwich'],
  },
  {
    match: (product) => normalizeText(product.name).includes('longaniza de capitan pastene'),
    summary: 'longaniza de perfil ahumado y tradicional para asado o tabla',
    useCases: ['asado', 'tabla'],
  },
  {
    match: (product) => normalizeText(product.name).includes('salmon porcionado'),
    summary: 'salmon porcionado premium, practico para almuerzo o cocina rapida',
    useCases: ['almuerzo', 'cocina_diaria'],
  },
  {
    match: (product) => normalizeText(product.name).includes('camaron cocido pelado'),
    summary: 'camaron pelado listo para usar, muy practico para pasta o preparaciones rapidas',
    useCases: ['pasta', 'almuerzo', 'ceviche'],
  },
  {
    match: (product) => normalizeText(product.name).includes('surtido de mariscos premium mix'),
    summary: 'mix surtido pensado para preparaciones marinas con varias especies',
    useCases: ['almuerzo', 'ceviche'],
  },
];

const buildProductSearchText = (product) => normalizeText([
  product.name,
  product.badge,
  product.description,
  product.extendedDescription,
  product.origin,
  product.salesNote,
].filter(Boolean).join(' '));

const scoreProductForUse = (product, useCase) => {
  const searchText = buildProductSearchText(product);
  const signals = CATEGORY_USE_SIGNALS[product.category]?.[useCase] || [];
  const profile = PRODUCT_FAMILY_PROFILES.find((entry) => entry.match(product)) || null;
  let score = product.commercialState === 'available' ? 3 : (product.commercialState === 'coming_soon' ? -1 : -3);

  signals.forEach((signal) => {
    if (searchText.includes(normalizeText(signal))) {
      score += 2;
    }
  });

  if (useCase === 'tabla' && searchText.includes('artesanal')) score += 1;
  if (useCase === 'fundir' && (searchText.includes('cremosa') || searchText.includes('mantecoso'))) score += 2;
  if (useCase === 'desayuno' && (searchText.includes('yema') || searchText.includes('clara'))) score += 2;
  if (useCase === 'asado' && (searchText.includes('ahumad') || searchText.includes('parrilla'))) score += 2;
  if (useCase === 'pasta' && (searchText.includes('porcion') || searchText.includes('pelado'))) score += 2;
  if (profile?.useCases?.includes(useCase)) score += 3;

  return score;
};

const sortProductsForUse = (products, useCase) => {
  if (!useCase) return products;

  return [...products]
    .map((product) => ({ product, score: scoreProductForUse(product, useCase) }))
    .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
    .map((entry) => entry.product);
};

const buildCategoryAliasMap = (catalog = []) => {
  const aliasMap = new Map();

  catalog.forEach((product) => {
    const rawCategory = normalizeText(product.category);
    if (!rawCategory) return;

    const aliases = new Set([
      rawCategory,
      rawCategory.endsWith('s') ? rawCategory.slice(0, -1) : `${rawCategory}s`,
    ]);

    aliases.forEach((alias) => {
      if (alias) aliasMap.set(alias, product.category);
    });
  });

  return aliasMap;
};

const findProductsMentionedInMessage = (message, catalog = []) => {
  const normalizedMessage = normalizeText(message);

  return uniqueById(catalog.filter((product) => {
    const normalizedName = normalizeText(product.name);
    if (normalizedMessage.includes(normalizedName)) {
      return true;
    }

    const tokens = normalizedName.split(/[^a-z0-9]+/).filter((token) => token.length >= 5);
    return tokens.some((token) => normalizedMessage.includes(token));
  }));
};

const findBestProductMention = (message, catalog = []) => {
  const normalizedMessage = normalizeText(message);
  const ranked = catalog
    .map((product) => {
      const tokens = normalizeText(product.name).split(/[^a-z0-9]+/).filter((token) => token.length >= 4);
      const score = tokens.reduce((total, token) => total + (normalizedMessage.includes(token) ? 1 : 0), 0);
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name));

  if (!ranked.length) return null;
  if (ranked.length === 1) return ranked[0].product;
  if (ranked[0].score > ranked[1].score) return ranked[0].product;
  return null;
};

const findProductById = (catalog = [], productId) => catalog.find((product) => product.id === productId) || null;

const findCurrentProduct = (request) => {
  if (request.currentProduct) return request.currentProduct;
  if (request.sessionContext?.currentProductId) {
    return findProductById(request.catalog, request.sessionContext.currentProductId);
  }
  return null;
};

const findTargetProduct = (request) => {
  const explicitMatches = findProductsMentionedInMessage(request.message, request.catalog);
  if (explicitMatches.length === 1) return explicitMatches[0];
  if (explicitMatches.length > 1) {
    const bestMatch = findBestProductMention(request.message, explicitMatches);
    if (bestMatch) return bestMatch;
  }

  if (request.quickReply?.payload?.currentProductId) {
    return findProductById(request.catalog, request.quickReply.payload.currentProductId);
  }

  return findCurrentProduct(request);
};

const findCategoryTarget = (request) => {
  const quickReplyCategory = request.quickReply?.payload?.category;
  if (quickReplyCategory) return quickReplyCategory;

  const aliasMap = buildCategoryAliasMap(request.catalog);
  const normalizedMessage = normalizeText(request.message);

  for (const [alias, category] of aliasMap.entries()) {
    if (normalizedMessage.includes(alias)) {
      return category;
    }
  }

  return request.sessionContext?.category || null;
};

const findComparisonProducts = (request) => {
  const idsFromContext = request.quickReply?.payload?.comparedProductIds?.length
    ? request.quickReply.payload.comparedProductIds
    : request.sessionContext?.comparedProductIds || [];

  const productsFromContext = uniqueById(
    idsFromContext.map((id) => findProductById(request.catalog, id)).filter(Boolean),
  );

  if (productsFromContext.length >= 2) {
    return productsFromContext.slice(0, 2);
  }

  const mentionedProducts = findProductsMentionedInMessage(request.message, request.catalog);
  if (mentionedProducts.length >= 2) {
    return mentionedProducts.slice(0, 2);
  }

  const currentProduct = findCurrentProduct(request);
  const recentProducts = uniqueById(request.recentProducts || []);
  if (currentProduct && recentProducts.length) {
    return uniqueById([currentProduct, ...recentProducts]).slice(0, 2);
  }

  return [];
};

const detectDeterministicIntent = (request) => {
  const quickIntent = request.quickReply?.intent;
  if (quickIntent === 'human_handoff') return 'human_handoff';
  if (quickIntent === 'show_price') return 'show_price';
  if (quickIntent === 'show_availability') return 'show_availability';
  if (quickIntent === 'show_category') return 'show_category';
  if (quickIntent === 'compare_products') return 'compare_products';
  if (quickIntent === 'show_details') return 'show_details';
  if (quickIntent === 'show_format') return 'show_format';
  if (quickIntent === 'show_usage') return 'show_usage';
  if (quickIntent) return null;

  const normalizedMessage = normalizeText(request.message);
  const hasCategory = Boolean(findCategoryTarget(request));
  const hasProduct = Boolean(findTargetProduct(request));

  if (/hablar con una persona|hablar con alguien|pasame con alguien|pasame con una persona|mejor pasame con alguien|mejor pasame con una persona|quiero una persona|quiero hablar con una persona|whatsapp|humano|humana/.test(normalizedMessage)) {
    return 'human_handoff';
  }

  if (/(^| )vs( |$)|compar|diferenc|cual conviene|que cambia/.test(normalizedMessage)) {
    return 'compare_products';
  }

  if (/precio|cuanto|cuanto|valor/.test(normalizedMessage)) {
    return 'show_price';
  }

  if (/formato|contenido|peso|cuanto trae|bandeja|horma|kg|gram|gramos|porcion|unidad|unidades/.test(normalizedMessage)) {
    return 'show_format';
  }

  if (/detalle|detalles|descripcion|que es|que trae|cuentame|origen|de donde viene|mas info/.test(normalizedMessage)) {
    return 'show_details';
  }

  if ((hasCategory || hasProduct) && /para que sirve|para desayuno|para asado|para tabla|para picoteo|para sandwich|para pasta|para ceviche|conviene para|sirve para|me sirve para|uso|usar|ocasion/.test(normalizedMessage)) {
    return 'show_usage';
  }

  if (hasCategory && /que hay|que .*tienen|tienen|hay|muestr|lista|catalog|opciones|productos/.test(normalizedMessage)) {
    return 'show_category';
  }

  if (/dispon|stock|hay |tienen|queda|quedan|se puede pedir|esta disponible/.test(normalizedMessage)) {
    return 'show_availability';
  }

  return null;
};

const buildProductSummary = (product) => {
  const fragments = [product.name];

  if (product.priceLabel) fragments.push(`precio visible ${product.priceLabel}`);
  if (product.commercialState === 'coming_soon') {
    fragments.push('figura como lanzamiento proximo');
  } else if (product.commercialState === 'available') {
    fragments.push('esta visible para venta');
  } else {
    fragments.push('no aparece disponible para venta directa');
  }

  return fragments.join(', ');
};

const buildFamilyFactsLine = (product) => {
  const facts = getFamilyFacts(product);
  if (!facts.length) return null;
  return `Hechos visibles: ${facts.join(', ')}.`;
};

const buildFamilyProfileLine = (product) => {
  const profile = PRODUCT_FAMILY_PROFILES.find((entry) => entry.match(product));
  return profile ? `Perfil visible: ${profile.summary}.` : null;
};

const buildFamilyComparisonLine = (firstProduct, secondProduct) => {
  if (firstProduct.category !== secondProduct.category) return null;

  const firstProfile = PRODUCT_FAMILY_PROFILES.find((entry) => entry.match(firstProduct));
  const secondProfile = PRODUCT_FAMILY_PROFILES.find((entry) => entry.match(secondProduct));
  if (!firstProfile && !secondProfile) return null;

  if (firstProduct.category === 'quesos') {
    return `Dentro de quesos, ${firstProduct.name} va mas hacia ${firstProfile?.summary || 'su perfil visible'} y ${secondProduct.name} hacia ${secondProfile?.summary || 'su perfil visible'}.`;
  }

  if (firstProduct.category === 'embutidos') {
    return `Dentro de embutidos, ${firstProduct.name} muestra ${firstProfile?.summary || 'un perfil propio'} y ${secondProduct.name} ${secondProfile?.summary || 'otro perfil visible'}.`;
  }

  if (firstProduct.category === 'congelados') {
    return `Dentro de congelados, ${firstProduct.name} se ve mas orientado a ${firstProfile?.summary || 'su formato visible'} y ${secondProduct.name} a ${secondProfile?.summary || 'su ficha visible'}.`;
  }

  if (firstProduct.category === 'huevos') {
    return `Dentro de huevos, ${firstProduct.name} muestra ${firstProfile?.summary || 'un perfil visible'} y ${secondProduct.name} ${secondProfile?.summary || 'otro perfil visible'}.`;
  }

  return null;
};

const extractOutsideCatalogCandidates = (message) => {
  const normalized = normalizeText(message)
    .replace(/tienen|hay|me muestras|busco|quiero|venden|manejan|trabajan con|de campo|artesanal/g, ' ')
    .replace(/[?.,!]/g, ' ')
    .split(/\s+o\s+|\s+y\s+|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.length >= 3)
    .slice(0, 3);

  return [...new Set(normalized)].map(normalizeLabel);
};

const resolveOutsideCatalogResponse = (request) => {
  const candidates = extractOutsideCatalogCandidates(request.message);
  const visibleCategories = [...new Set(request.catalog.map((product) => product.category).filter(Boolean))].slice(0, 4);
  const categoryLabel = visibleCategories.join(', ');
  const candidateLabel = candidates.length ? candidates.join(' y ') : 'ese producto';

  return {
    message: `No veo ${candidateLabel} dentro del catalogo visible que tengo ahora. En este momento si puedo ayudarte con categorias visibles como ${categoryLabel}. Si quieres, te muestro una alternativa cercana o te paso con una persona para revisar opciones fuera de catalogo.`,
    quickReplies: [
      buildQuickReply('Ver productos visibles', 'show_category', {
        prompt: `Que productos visibles tienen hoy`,
        topic: 'catalog',
      }),
      buildQuickReply('Hablar con una persona', 'human_handoff', {
        prompt: `Quiero revisar ${candidateLabel} con una persona`,
        topic: 'handoff',
        highlightHuman: true,
      }),
    ],
    recommendedProducts: request.catalog.slice(0, 2).map((product) => buildRecommendation(
      product,
      'Alternativa visible cercana mientras revisamos catalogo publicado.',
    )),
    nextStep: 'assist',
    detectedIntent: 'outside_catalog',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: 'catalog',
      category: null,
      currentProductId: null,
      comparedProductIds: [],
      lastIntent: 'outside_catalog',
      lastUserMessage: request.message,
    },
  };
};

const resolveDirectHandoffResponse = (request) => {
  const currentProduct = request.currentProduct || null;
  const recentProducts = uniqueById([
    ...(currentProduct ? [currentProduct] : []),
    ...(request.recentProducts || []),
  ]).slice(0, 3);
  const useContext = request.sessionContext?.useContext
    || (request.sessionContext?.category ? `compra enfocada en ${request.sessionContext.category}` : 'uso por confirmar');
  const locationHint = request.sessionContext?.locationHint || null;
  const urgencyHint = request.sessionContext?.urgencyHint || null;

  return {
    message: 'Perfecto. Te dejo el paso humano listo para continuar el cierre por WhatsApp con el equipo.',
    quickReplies: [
      buildQuickReply('Continuar con una persona', 'human_handoff', {
        prompt: 'Continuar con una persona',
        topic: 'handoff',
        currentProductId: currentProduct?.id || null,
        highlightHuman: true,
      }),
      buildQuickReply('Antes, dame una propuesta', 'continue_topic', {
        prompt: 'Antes, dame una propuesta',
        topic: 'recommendation',
        currentProductId: currentProduct?.id || null,
      }),
    ],
    recommendedProducts: recentProducts.map((product) => buildRecommendation(
      product,
      'Producto reciente relevante para continuar el cierre humano.',
    )),
    nextStep: 'handoff',
    detectedIntent: 'buy_specific',
    handoffSummary: `Cliente pide continuar con una persona${recentProducts.length ? ` tras revisar ${recentProducts.map((product) => product.name).join(', ')}` : ''}.`,
    shouldHighlightHuman: true,
    handoffDetails: {
      customerNeed: 'cliente solicita apoyo humano directo',
      useContext,
      locationHint,
      urgencyHint,
      handoffReason: 'solicitud explicita de cierre con una persona',
      channel: 'web_widget',
      lastCustomerMessage: request.message,
      proposedProducts: recentProducts.map((product) => product.name),
      bundleTitle: null,
      leadTemperature: 'caliente',
      nextAction: 'continuar cierre por WhatsApp con una persona',
    },
    sessionContext: {
      topic: 'handoff',
      category: request.sessionContext?.category || currentProduct?.category || null,
      currentProductId: currentProduct?.id || request.sessionContext?.currentProductId || null,
      comparedProductIds: request.sessionContext?.comparedProductIds || [],
      useContext,
      locationHint,
      urgencyHint,
      lastIntent: 'human_handoff',
      lastUserMessage: request.message,
    },
  };
};

const buildClarifyResponse = (request, reason) => {
  const candidates = uniqueById([
    findCurrentProduct(request),
    ...(request.recentProducts || []),
    ...request.catalog.slice(0, 2),
  ].filter(Boolean)).slice(0, 3);

  const quickReplies = candidates.length
    ? candidates.map((product) => buildQuickReply(
      `Ver ${product.name}`,
      reason === 'comparison' ? 'compare_products' : 'show_price',
      {
        prompt: reason === 'comparison' ? `Comparemos ${product.name}` : `Quiero revisar ${product.name}`,
        topic: reason === 'comparison' ? 'comparison' : 'catalog',
        currentProductId: product.id,
      },
    ))
    : [
      buildQuickReply('Hablar con una persona', 'human_handoff', {
        prompt: 'Hablar con una persona',
        topic: 'handoff',
        highlightHuman: true,
      }),
    ];

  return {
    message: reason === 'comparison'
      ? 'Puedo comparar opciones, pero necesito que me indiques cuales productos quieres revisar.'
      : 'Puedo responder eso por catalogo, pero necesito que me indiques que producto quieres revisar.',
    quickReplies,
    recommendedProducts: [],
    nextStep: 'assist',
    detectedIntent: reason === 'comparison' ? 'comparing' : 'price_or_format_doubt',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: reason === 'comparison' ? 'comparison' : 'catalog',
      category: request.sessionContext?.category || null,
      currentProductId: request.sessionContext?.currentProductId || null,
      comparedProductIds: request.sessionContext?.comparedProductIds || [],
      lastIntent: reason === 'comparison' ? 'compare_products' : 'clarify_catalog_target',
      lastUserMessage: request.message,
    },
  };
};

const resolvePriceResponse = (request, product) => ({
  message: product.category === 'quesos'
    ? `${product.name} se muestra con ${product.priceLabel}. En quesos ese valor es referencial por 1/4 kg y el total final depende del peso real.`
    : `${product.name} se muestra con ${product.priceLabel}. Si quieres, tambien puedo decirte si esta disponible o compararlo con otra opcion.`,
  quickReplies: [
    buildQuickReply('Ver disponibilidad', 'show_availability', {
      prompt: `Quiero saber disponibilidad de ${product.name}`,
      topic: 'catalog',
      currentProductId: product.id,
    }),
    buildQuickReply('Comparar con otra opcion', 'compare_products', {
      prompt: `Comparemos ${product.name} con otra opcion`,
      topic: 'comparison',
      currentProductId: product.id,
    }),
  ],
  recommendedProducts: [buildRecommendation(product, 'Precio visible consultado desde catalogo.')],
  nextStep: 'assist',
  detectedIntent: 'price_or_format_doubt',
  handoffSummary: null,
  shouldHighlightHuman: false,
  sessionContext: {
    topic: 'catalog',
    category: product.category || null,
    currentProductId: product.id,
    comparedProductIds: [],
    lastIntent: 'show_price',
    lastUserMessage: request.message,
  },
});

const resolveAvailabilityResponse = (request, product) => {
  let message = '';

  if (product.commercialState === 'coming_soon') {
    message = `${product.name} figura como lanzamiento proximo. Puedo dejarte una alternativa disponible ahora o pasarte con una persona para registrar interes.`;
  } else if (product.commercialState === 'available') {
    message = `${product.name} aparece disponible en el catalogo. La confirmacion final la hace el equipo humano al cerrar, pero hoy si se puede trabajar como opcion vigente.`;
  } else {
    message = `${product.name} no aparece disponible para venta directa en este momento. Si quieres, te muestro una alternativa cercana o te paso con una persona.`;
  }

  return {
    message,
    quickReplies: [
      buildQuickReply('Ver precio visible', 'show_price', {
        prompt: `Quiero el precio de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Ver detalles del producto', 'show_details', {
        prompt: `Quiero mas detalles de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Hablar con una persona', 'human_handoff', {
        prompt: `Quiero ayuda humana con ${product.name}`,
        topic: 'handoff',
        currentProductId: product.id,
        highlightHuman: true,
      }),
    ],
    recommendedProducts: [buildRecommendation(product, 'Disponibilidad consultada directamente desde catalogo.')],
    nextStep: product.commercialState === 'available' ? 'assist' : 'handoff',
    detectedIntent: 'availability_question',
    handoffSummary: product.commercialState === 'available'
      ? null
      : `Cliente consulto por ${product.name} y necesita confirmacion humana de disponibilidad.`,
    shouldHighlightHuman: product.commercialState !== 'available',
    sessionContext: {
      topic: product.commercialState === 'available' ? 'catalog' : 'handoff',
      category: product.category || null,
      currentProductId: product.id,
      comparedProductIds: [],
      lastIntent: 'show_availability',
      lastUserMessage: request.message,
    },
  };
};

const resolveCategoryResponse = (request, category) => {
  const products = request.catalog.filter((product) => product.category === category).slice(0, 4);
  const summary = products.map(buildProductSummary).join('; ');
  const categoryFacts = products
    .map((product) => `${product.name} (${getFormatLabel(product)})`)
    .join(', ');

  return {
    message: products.length
      ? `En ${category} hoy veo ${products.length} opcion(es): ${summary}. Formatos visibles: ${categoryFacts}. Si quieres, te digo precio, formato o comparo alguna de ellas.`
      : `No encuentro productos visibles en la categoria ${category} ahora mismo. Si quieres, puedo revisar otra categoria o pasarte con una persona.`,
    quickReplies: products.length
      ? [
        buildQuickReply(`Precio de ${products[0].name}`, 'show_price', {
          prompt: `Quiero el precio de ${products[0].name}`,
          topic: 'catalog',
          category,
          currentProductId: products[0].id,
        }),
        buildQuickReply('Comparar opciones', 'compare_products', {
          prompt: `Quiero comparar opciones de ${category}`,
          topic: 'comparison',
          category,
          comparedProductIds: products.slice(0, 2).map((product) => product.id),
        }),
        buildQuickReply(`Formato de ${products[0].name}`, 'show_format', {
          prompt: `Quiero saber el formato de ${products[0].name}`,
          topic: 'catalog',
          category,
          currentProductId: products[0].id,
        }),
        buildQuickReply(`Uso de ${products[0].name}`, 'show_usage', {
          prompt: `Quiero saber para que sirve ${products[0].name}`,
          topic: 'catalog',
          category,
          currentProductId: products[0].id,
        }),
      ]
      : [
        buildQuickReply('Hablar con una persona', 'human_handoff', {
          prompt: 'Hablar con una persona',
          topic: 'handoff',
          highlightHuman: true,
        }),
      ],
    recommendedProducts: products.map((product) => buildRecommendation(
      product,
      product.commercialState === 'coming_soon'
        ? 'Lanzamiento proximo dentro de la categoria.'
        : 'Producto visible dentro de la categoria solicitada.',
    )),
    nextStep: products.length ? 'assist' : 'handoff',
    detectedIntent: 'availability_question',
    handoffSummary: products.length ? null : `Cliente busco productos de ${category} y necesita apoyo humano.`,
    shouldHighlightHuman: !products.length,
    sessionContext: {
      topic: products.length ? 'catalog' : 'handoff',
      category,
      currentProductId: products[0]?.id || null,
      comparedProductIds: [],
      lastIntent: 'show_category',
      lastUserMessage: request.message,
    },
  };
};

const resolveDetailsResponse = (request, product) => {
  const details = [
    summarizeDescription(product),
    `Formato visible: ${getFormatLabel(product)}.`,
    product.origin ? `Origen: ${product.origin}.` : null,
    buildFamilyFactsLine(product),
    buildFamilyProfileLine(product),
    product.salesNote ? `Nota comercial: ${product.salesNote}` : null,
  ].filter(Boolean).join(' ');

  return {
    message: `${product.name}: ${details}`,
    quickReplies: [
      buildQuickReply('Ver precio visible', 'show_price', {
        prompt: `Quiero el precio de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Ver formato', 'show_format', {
        prompt: `Quiero saber el formato de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Comparar con otra opcion', 'compare_products', {
        prompt: `Comparemos ${product.name} con otra opcion`,
        topic: 'comparison',
        currentProductId: product.id,
      }),
    ],
    recommendedProducts: [buildRecommendation(product, 'Detalles visibles entregados directamente desde la ficha del catalogo.')],
    nextStep: 'assist',
    detectedIntent: 'price_or_format_doubt',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: 'catalog',
      category: product.category || null,
      currentProductId: product.id,
      comparedProductIds: [],
      lastIntent: 'show_details',
      lastUserMessage: request.message,
    },
  };
};

const resolveFormatResponse = (request, product) => {
  const formatLabel = getFormatLabel(product);
  const detailLine = product.badge && !formatLabel.toLowerCase().includes(normalizeText(product.badge))
    ? `Badge visible: ${product.badge}.`
    : null;

  return {
    message: `${product.name} se muestra en formato ${formatLabel}. ${detailLine || ''} ${product.category === 'quesos' ? 'En quesos recuerda que el valor visible es referencial por 1/4 kg.' : ''}`.trim(),
    quickReplies: [
      buildQuickReply('Ver detalles del producto', 'show_details', {
        prompt: `Quiero mas detalles de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Ver precio visible', 'show_price', {
        prompt: `Quiero el precio de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Para que sirve', 'show_usage', {
        prompt: `Quiero saber para que sirve ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
    ],
    recommendedProducts: [buildRecommendation(product, 'Formato visible respondido desde badge y ficha del catalogo.')],
    nextStep: 'assist',
    detectedIntent: 'price_or_format_doubt',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: 'catalog',
      category: product.category || null,
      currentProductId: product.id,
      comparedProductIds: [],
      lastIntent: 'show_format',
      lastUserMessage: request.message,
    },
  };
};

const resolveUsageResponse = (request, product) => {
  const useCase = inferUseCase(request.message);
  const usageGuide = getUsageGuide(product.category, useCase);
  const useCaseLabel = useCase ? `Para ${useCase.replace('_', ' ')}` : 'Por uso visible';
  const familyFactsLine = buildFamilyFactsLine(product);

  return {
    message: `${product.name}: ${usageGuide || 'Por lo visible en su ficha, este producto funciona bien dentro de su categoria.'} ${summarizeDescription(product)} Formato visible: ${getFormatLabel(product)}. ${familyFactsLine || ''} ${buildFamilyProfileLine(product) || ''}`.trim(),
    quickReplies: [
      buildQuickReply('Ver detalles del producto', 'show_details', {
        prompt: `Quiero mas detalles de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Ver precio visible', 'show_price', {
        prompt: `Quiero el precio de ${product.name}`,
        topic: 'catalog',
        currentProductId: product.id,
      }),
      buildQuickReply('Comparar con otra opcion', 'compare_products', {
        prompt: `Comparemos ${product.name} con otra opcion`,
        topic: 'comparison',
        currentProductId: product.id,
      }),
    ],
    recommendedProducts: [buildRecommendation(product, `${useCaseLabel} respondido desde categoria y descripcion visibles.`)],
    nextStep: 'assist',
    detectedIntent: 'price_or_format_doubt',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: 'catalog',
      category: product.category || null,
      currentProductId: product.id,
      comparedProductIds: [],
      lastIntent: 'show_usage',
      lastUserMessage: request.message,
    },
  };
};

const resolveCategoryUsageResponse = (request, category) => {
  const useCase = inferUseCase(request.message);
  const usageGuide = getUsageGuide(category, useCase);
  const products = sortProductsForUse(
    request.catalog.filter((product) => product.category === category),
    useCase,
  ).slice(0, 3);
  const productSummary = products.map((product) => `${product.name} (${getFormatLabel(product)})`).join(', ');
  const topChoice = products[0];

  return {
    message: usageGuide
      ? `En ${category}, ${usageGuide} ${topChoice ? `De lo visible, partiria por ${topChoice.name}. ` : ''}Opciones visibles: ${productSummary}.`
      : `En ${category} puedo apoyarme en las fichas visibles para orientarte por uso. Hoy veo: ${productSummary}.`,
    quickReplies: products.length
      ? [
        buildQuickReply(`Detalles de ${products[0].name}`, 'show_details', {
          prompt: `Quiero mas detalles de ${products[0].name}`,
          topic: 'catalog',
          category,
          currentProductId: products[0].id,
        }),
        buildQuickReply('Comparar opciones', 'compare_products', {
          prompt: `Quiero comparar opciones de ${category}`,
          topic: 'comparison',
          category,
          comparedProductIds: products.slice(0, 2).map((product) => product.id),
        }),
      ]
      : [
        buildQuickReply('Hablar con una persona', 'human_handoff', {
          prompt: 'Hablar con una persona',
          topic: 'handoff',
          highlightHuman: true,
        }),
      ],
    recommendedProducts: products.map((product) => buildRecommendation(
      product,
      'Categoria sugerida por uso visible y formato del catalogo.',
    )),
    nextStep: products.length ? 'assist' : 'handoff',
    detectedIntent: 'needs_recommendation',
    handoffSummary: products.length ? null : `Cliente busca uso dentro de ${category} y necesita apoyo humano.`,
    shouldHighlightHuman: !products.length,
    sessionContext: {
      topic: products.length ? 'catalog' : 'handoff',
      category,
      currentProductId: products[0]?.id || null,
      comparedProductIds: [],
      lastIntent: 'show_usage',
      lastUserMessage: request.message,
    },
  };
};

const resolveComparisonResponse = (request, products) => {
  const [firstProduct, secondProduct] = products;
  const lines = [
    `${firstProduct.name}: ${firstProduct.priceLabel}, ${firstProduct.commercialState === 'available' ? 'disponible' : firstProduct.commercialState === 'coming_soon' ? 'proximamente' : 'no disponible'}, formato ${getFormatLabel(firstProduct)}.`,
    `${secondProduct.name}: ${secondProduct.priceLabel}, ${secondProduct.commercialState === 'available' ? 'disponible' : secondProduct.commercialState === 'coming_soon' ? 'proximamente' : 'no disponible'}, formato ${getFormatLabel(secondProduct)}.`,
  ];

  if (firstProduct.category !== secondProduct.category) {
    lines.push(`Son categorias distintas: ${firstProduct.category} frente a ${secondProduct.category}.`);
  }

  if (firstProduct.origin || secondProduct.origin) {
    lines.push(`Origen visible: ${firstProduct.name} -> ${firstProduct.origin || 'sin dato visible'}; ${secondProduct.name} -> ${secondProduct.origin || 'sin dato visible'}.`);
  }

  lines.push(`Descripcion visible: ${firstProduct.name} -> ${summarizeDescription(firstProduct)} ${secondProduct.name} -> ${summarizeDescription(secondProduct)}`);

  const firstFacts = getFamilyFacts(firstProduct);
  const secondFacts = getFamilyFacts(secondProduct);
  if (firstFacts.length || secondFacts.length) {
    lines.push(`Hechos de familia: ${firstProduct.name} -> ${firstFacts.join(', ') || 'sin hechos especificos'}; ${secondProduct.name} -> ${secondFacts.join(', ') || 'sin hechos especificos'}.`);
  }

  const familyComparisonLine = buildFamilyComparisonLine(firstProduct, secondProduct);
  if (familyComparisonLine) {
    lines.push(familyComparisonLine);
  }

  if (firstProduct.salesNote || secondProduct.salesNote) {
    lines.push(`Ojo comercial: ${firstProduct.name} -> ${firstProduct.salesNote}; ${secondProduct.name} -> ${secondProduct.salesNote}`);
  }

  const useCase = inferUseCase(request.message);
  const firstUsageGuide = getUsageGuide(firstProduct.category, useCase);
  const secondUsageGuide = getUsageGuide(secondProduct.category, useCase);
  if (firstUsageGuide || secondUsageGuide) {
    lines.push(`Uso visible: ${firstProduct.name} -> ${firstUsageGuide || 'sin guia especifica'}; ${secondProduct.name} -> ${secondUsageGuide || 'sin guia especifica'}.`);
    const firstScore = scoreProductForUse(firstProduct, useCase);
    const secondScore = scoreProductForUse(secondProduct, useCase);
    if (firstScore !== secondScore) {
      lines.push(`Para ese uso visible, ${firstScore > secondScore ? firstProduct.name : secondProduct.name} queda mejor perfilado dentro de lo publicado.`);
    }
  }

  return {
    message: `Te los comparo rapido. ${lines.join(' ')}`,
    quickReplies: [
      buildQuickReply(`Precio de ${firstProduct.name}`, 'show_price', {
        prompt: `Quiero el precio de ${firstProduct.name}`,
        topic: 'catalog',
        currentProductId: firstProduct.id,
      }),
      buildQuickReply(`Detalles de ${secondProduct.name}`, 'show_details', {
        prompt: `Quiero mas detalles de ${secondProduct.name}`,
        topic: 'catalog',
        currentProductId: secondProduct.id,
      }),
      buildQuickReply(`Uso de ${firstProduct.name}`, 'show_usage', {
        prompt: `Quiero saber para que sirve ${firstProduct.name}`,
        topic: 'catalog',
        currentProductId: firstProduct.id,
      }),
    ],
    recommendedProducts: products.map((product) => buildRecommendation(
      product,
      'Incluido en comparacion deterministica por contexto activo.',
    )),
    nextStep: 'assist',
    detectedIntent: 'comparing',
    handoffSummary: null,
    shouldHighlightHuman: false,
    sessionContext: {
      topic: 'comparison',
      category: request.sessionContext?.category || firstProduct.category || null,
      currentProductId: firstProduct.id,
      comparedProductIds: products.map((product) => product.id),
      lastIntent: 'compare_products',
      lastUserMessage: request.message,
    },
  };
};

export const resolveDeterministicSalesReply = (request) => {
  const intent = detectDeterministicIntent(request);
  if (!intent) return null;

  if (intent === 'human_handoff') {
    return resolveDirectHandoffResponse(request);
  }

  if (intent === 'show_category') {
    const category = findCategoryTarget(request);
    if (!category) {
      return resolveOutsideCatalogResponse(request);
    }

    return resolveCategoryResponse(request, category);
  }

  if (intent === 'compare_products') {
    const comparisonProducts = findComparisonProducts(request);
    if (comparisonProducts.length < 2) {
      return buildClarifyResponse(request, 'comparison');
    }

    return resolveComparisonResponse(request, comparisonProducts);
  }

  if (intent === 'show_usage') {
    const targetProduct = findTargetProduct(request);
    if (targetProduct) {
      return resolveUsageResponse(request, targetProduct);
    }

    const category = findCategoryTarget(request);
    if (category) {
      return resolveCategoryUsageResponse(request, category);
    }

    return buildClarifyResponse(request, 'catalog');
  }

  const targetProduct = findTargetProduct(request);
  if (!targetProduct) {
    if (!findCategoryTarget(request)) {
      return resolveOutsideCatalogResponse(request);
    }
    return buildClarifyResponse(request, 'catalog');
  }

  if (intent === 'show_price') {
    return resolvePriceResponse(request, targetProduct);
  }

  if (intent === 'show_availability') {
    return resolveAvailabilityResponse(request, targetProduct);
  }

  if (intent === 'show_details') {
    return resolveDetailsResponse(request, targetProduct);
  }

  if (intent === 'show_format') {
    return resolveFormatResponse(request, targetProduct);
  }

  return null;
};
