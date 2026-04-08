const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const inferUseContext = (request) => {
  const message = normalizeText(request.message);
  if (/desayuno|brunch/.test(message)) return 'desayuno o brunch';
  if (/tabla|picoteo/.test(message)) return 'tabla o picoteo';
  if (/asado|parrilla/.test(message)) return 'asado o parrilla';
  if (/sandwich|tostada/.test(message)) return 'sandwich o tostadas';
  if (/pasta|fideos/.test(message)) return 'pasta o cocina rapida';
  if (/almuerzo|comida/.test(message)) return 'almuerzo o comida principal';
  return request.sessionContext?.category ? `compra enfocada en ${request.sessionContext.category}` : 'uso por confirmar';
};

const inferLocationHint = (request) => {
  const rawMessage = String(request.message || '');
  const patterns = [
    /comuna de\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)/i,
    /en\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?=\s+(?:puedo|quiero|necesito|avanzar|cerrar|seguir|con)\b|[,.]|$)/i,
    /para\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)(?=\s+(?:puedo|quiero|necesito|avanzar|cerrar|seguir|con)\b|[,.]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = rawMessage.match(pattern);
    if (!match?.[1]) continue;
    const candidate = match[1].trim().replace(/\s+/g, ' ');
    if (candidate.length < 3) continue;
    if (/desayuno|asado|tabla|pasta|pedido|avanzar|cerrar/i.test(candidate)) continue;
    return candidate;
  }

  return null;
};

const inferUrgencyHint = (request) => {
  const message = normalizeText(request.message);
  if (/urgente|ahora|hoy mismo|cuanto antes/.test(message)) return 'alta';
  if (/manana|esta semana|esta tarde/.test(message)) return 'media';
  return null;
};

const inferHandoffReason = ({ response, request }) => {
  if (response.nextStep === 'preclose') {
    return 'cliente listo para validar propuesta y seguir cierre humano';
  }

  switch (response.detectedIntent) {
    case 'objection':
      return 'requiere apoyo humano para resolver objecion y cerrar';
    case 'availability_question':
      return 'requiere confirmacion humana de disponibilidad o cierre';
    case 'frustrated_customer':
      return 'requiere contencion humana y continuidad de cierre';
    case 'buy_specific':
      return 'cliente con intencion clara de compra';
    default:
      return 'continuar cierre comercial por WhatsApp';
  }
};

const getMissingQualificationFields = ({ handoffDetails }) => {
  const missing = [];
  if (!handoffDetails?.useContext || handoffDetails.useContext === 'uso por confirmar') missing.push('use_context');
  if (!handoffDetails?.locationHint) missing.push('location');
  if (!handoffDetails?.urgencyHint) missing.push('urgency');
  return missing;
};

const hasExplicitHumanIntent = (request) => {
  if (request.quickReply?.intent === 'human_handoff') return true;
  const message = normalizeText(request.message);
  return /whatsapp|persona|humano|cerrar|quiero ese pedido|quiero esa propuesta/.test(message);
};

const buildQualificationAsk = (missingFields = []) => {
  const parts = [];
  if (missingFields.includes('location')) parts.push('tu comuna');
  if (missingFields.includes('urgency')) parts.push('para cuando lo necesitas');
  if (missingFields.includes('use_context')) parts.push('el contexto de uso');

  if (!parts.length) return null;
  if (parts.length === 1) return `Antes de pasarte con una persona, dime ${parts[0]}.`;
  if (parts.length === 2) return `Antes de pasarte con una persona, dime ${parts[0]} y ${parts[1]}.`;
  return `Antes de pasarte con una persona, dime ${parts[0]}, ${parts[1]} y ${parts[2]}.`;
};

const buildQualificationReplies = ({ missingFields = [], currentProductId, category }) => {
  const replies = [];
  if (missingFields.includes('location') || missingFields.includes('urgency')) {
    replies.push({
      label: 'Te doy esos datos',
      intent: 'continue_topic',
      payload: { topic: 'recommendation', currentProductId, category },
    });
  }

  if (missingFields.includes('use_context')) {
    replies.push({
      label: 'Te explico para que lo quiero',
      intent: 'continue_topic',
      payload: { topic: 'recommendation', currentProductId, category },
    });
  }

  replies.push({
    label: 'Quiero seguir igual',
    intent: 'human_handoff',
    payload: { topic: 'handoff', currentProductId, category, highlightHuman: true },
  });

  return replies.slice(0, 4);
};

const truncateText = (value = '', max = 80) => {
  const normalized = String(value).trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 3)).trim()}...`;
};

const inferBundleUseLabel = (request, recommendedProducts = []) => {
  const explicitUse = inferUseContext(request);
  if (explicitUse !== 'uso por confirmar') return explicitUse;

  const reasonsText = recommendedProducts.map((item) => normalizeText(item.reason)).join(' ');
  if (/desayuno|brunch/.test(reasonsText)) return 'desayuno o brunch';
  if (/tabla|picoteo/.test(reasonsText)) return 'tabla o picoteo';
  if (/asado|parrilla/.test(reasonsText)) return 'asado o parrilla';
  if (/pasta|rapida|almuerzo/.test(reasonsText)) return 'comida rapida o almuerzo';

  return 'una compra concreta';
};

const inferBundleTitle = (request, recommendedProducts = [], detectedIntent) => {
  const useLabel = inferBundleUseLabel(request, recommendedProducts);
  if (detectedIntent === 'objection') return 'Opcion clara para avanzar';
  if (useLabel.includes('desayuno')) return 'Propuesta para desayuno';
  if (useLabel.includes('tabla')) return 'Propuesta para tabla';
  if (useLabel.includes('asado')) return 'Propuesta para asado';
  if (useLabel.includes('pasta') || useLabel.includes('almuerzo')) return 'Propuesta para comida rapida';
  return 'Propuesta sugerida';
};

const inferBundleSummary = (request, recommendedProducts = []) => {
  const useLabel = inferBundleUseLabel(request, recommendedProducts);
  const productList = recommendedProducts.map((item) => item.name).join(', ');
  return `Una combinacion concreta con ${productList} pensada para ${useLabel} y lista para seguir avanzando.`;
};

const inferCustomerNeed = (request, recommendedProducts = [], suggestedBundle) => {
  if (suggestedBundle?.title) {
    return `cliente interesado en ${suggestedBundle.title}`;
  }

  if (recommendedProducts.length) {
    return `cliente interesado en ${recommendedProducts.map((item) => item.name).join(', ')}`;
  }

  return `cliente consultando por ${request.sessionContext?.category || 'productos del catalogo'}`;
};

const toTitleCase = (value = '') => value
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const uniqueByName = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeText(item.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const findCatalogProduct = (catalog = [], candidateName) => {
  const normalizedCandidate = normalizeText(candidateName);
  if (!normalizedCandidate) return null;

  const exact = catalog.find((product) => normalizeText(product.name) === normalizedCandidate);
  if (exact) return exact;

  const partial = catalog.find((product) => normalizeText(product.name).includes(normalizedCandidate) || normalizedCandidate.includes(normalizeText(product.name)));
  return partial || null;
};

const normalizeRecommendedProducts = (recommendedProducts = [], catalog = []) => uniqueByName(
  recommendedProducts
    .map((item) => {
      const catalogProduct = findCatalogProduct(catalog, item.name);
      if (!catalogProduct) return null;
      return {
        name: catalogProduct.name,
        reason: item.reason,
      };
    })
    .filter(Boolean),
).slice(0, 3);

const normalizeBundleItems = (items = [], catalog = [], recommendedProducts = []) => {
  const recommendedNames = new Set(recommendedProducts.map((item) => normalizeText(item.name)));
  const normalizedItems = items
    .map((name) => findCatalogProduct(catalog, name)?.name)
    .filter(Boolean)
    .filter((name) => recommendedNames.size === 0 || recommendedNames.has(normalizeText(name)));

  return [...new Set(normalizedItems)].slice(0, 4);
};

const buildFallbackBundle = ({ recommendedProducts = [], detectedIntent }) => {
  if (recommendedProducts.length < 2) return null;

  const firstReason = recommendedProducts[0]?.reason || '';
  const inferredUse = /desayuno|brunch/i.test(firstReason)
    ? 'desayuno'
    : /tabla|picoteo/i.test(firstReason)
      ? 'tabla'
      : /asado|parrilla/i.test(firstReason)
        ? 'asado'
        : /pasta|almuerzo|rapida/i.test(firstReason)
          ? 'comida'
          : 'compra';

  return {
    title: detectedIntent === 'objection'
      ? 'Opcion clara para avanzar'
      : `Propuesta para ${inferredUse}`,
    summary: `Una combinacion concreta con ${recommendedProducts.map((item) => item.name).join(', ')} pensada para ${inferredUse} y lista para seguir avanzando.`,
    items: recommendedProducts.map((item) => item.name).slice(0, 4),
    intent: recommendedProducts.length >= 3 ? 'bundle' : 'cross_sell',
  };
};

const normalizeSuggestedBundle = ({ suggestedBundle, catalog = [], recommendedProducts = [], detectedIntent, request, nextStep }) => {
  if (!suggestedBundle) {
    const fallback = buildFallbackBundle({ recommendedProducts, detectedIntent });
    if (!fallback) return null;
    return {
      ...fallback,
      title: inferBundleTitle(request, recommendedProducts, detectedIntent),
      summary: inferBundleSummary(request, recommendedProducts),
    };
  }

  const items = normalizeBundleItems(suggestedBundle.items, catalog, recommendedProducts);
  if (!items.length) {
    const fallback = buildFallbackBundle({ recommendedProducts, detectedIntent });
    if (!fallback) return null;
    return {
      ...fallback,
      title: inferBundleTitle(request, recommendedProducts, detectedIntent),
      summary: inferBundleSummary(request, recommendedProducts),
    };
  }

  return {
    ...suggestedBundle,
    title: detectedIntent === 'objection'
      ? inferBundleTitle(request, recommendedProducts, detectedIntent)
      : (suggestedBundle.title || inferBundleTitle(request, recommendedProducts, detectedIntent)),
    summary: suggestedBundle.summary || inferBundleSummary(request, recommendedProducts),
    items,
  };
};

const ensureQuickReplies = ({ quickReplies = [], nextStep, currentProductId, category, detectedIntent, request, suggestedBundle }) => {
  const normalizedQuickReplies = Array.isArray(quickReplies) ? [...quickReplies] : [];
  const useLabel = inferBundleUseLabel(request, []);
  const bundleLabel = suggestedBundle?.title || 'propuesta';
  const precloseAdjustReply = {
    label: `Ajusta la ${bundleLabel.toLowerCase()}`,
    intent: 'continue_topic',
    payload: { topic: 'recommendation', currentProductId, category },
  };

  if (nextStep === 'preclose') {
    normalizedQuickReplies.unshift({
      label: 'Si, quiero esa propuesta',
      intent: 'human_handoff',
      payload: { topic: 'handoff', currentProductId, category, highlightHuman: true },
    });
    normalizedQuickReplies.splice(1, 0, precloseAdjustReply);
  }

  if (nextStep === 'handoff') {
    normalizedQuickReplies.unshift({
      label: 'Continuar por WhatsApp',
      intent: 'human_handoff',
      payload: { topic: 'handoff', currentProductId, category, highlightHuman: true },
    });
  }

  if (normalizedQuickReplies.length >= 2) {
    const deduped = [];
    const seen = new Set();
    for (const item of normalizedQuickReplies) {
      const key = `${item.intent}:${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped.slice(0, 4);
  }

  const fallbackReplies = [];

  if (nextStep === 'preclose') {
    fallbackReplies.push({
      label: 'Si, quiero esa propuesta',
      intent: 'human_handoff',
      payload: { topic: 'handoff', currentProductId, category, highlightHuman: true },
    });
    fallbackReplies.push({
      ...precloseAdjustReply,
    });
  } else if (nextStep === 'handoff') {
    fallbackReplies.push({
      label: 'Continuar por WhatsApp',
      intent: 'human_handoff',
      payload: { topic: 'handoff', currentProductId, category, highlightHuman: true },
    });
  } else {
    fallbackReplies.push({
      label: detectedIntent === 'objection' ? 'Resuelve mi duda' : `Sigue orientandome para ${useLabel}`,
      intent: 'continue_topic',
      payload: { topic: 'recommendation', currentProductId, category },
    });
  }

  if (currentProductId) {
    fallbackReplies.push({
      label: 'Ver precio visible',
      intent: 'show_price',
      payload: { topic: 'catalog', currentProductId, category },
    });
  }

  const merged = [...normalizedQuickReplies, ...fallbackReplies];
  const deduped = [];
  const seen = new Set();
  for (const item of merged) {
    const key = `${item.intent}:${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, 4);
};

const inferLeadTemperature = (nextStep, detectedIntent, currentLeadTemperature) => {
  if (currentLeadTemperature) return currentLeadTemperature;
  if (nextStep === 'handoff') return 'listo_para_cierre';
  if (nextStep === 'preclose') return 'caliente';
  if (detectedIntent === 'objection') return 'tibio';
  return 'frio';
};

const strengthenObjectionMessage = ({ message, recommendedProducts = [] }) => {
  const firstProduct = recommendedProducts[0]?.name;
  const base = message.trim();
  if (!base) return base;
  if (/entiendo|normal|te sirve|te entiendo|es valido/i.test(base)) return base;

  return `Entiendo la duda. ${base}${firstProduct ? ` Si quieres, lo aterrizo con una opcion concreta como ${firstProduct}.` : ''}`;
};

const strengthenPrecloseMessage = ({ message, recommendedProducts = [], suggestedBundle }) => {
  const base = message.trim();
  const proposal = suggestedBundle?.items?.length
    ? suggestedBundle.items.join(', ')
    : recommendedProducts.map((item) => item.name).join(', ');

  if (!proposal) return base;
  if (/resumen|propuesta|whatsapp|persona/i.test(base)) return base;

  return `${base} En resumen, la propuesta va con ${proposal}. Si te hace sentido, te la dejo lista para seguir por WhatsApp con una persona y cerrar mas rapido.`;
};

const strengthenAssistMessage = ({ message, recommendedProducts = [] }) => {
  const base = message.trim();
  if (!recommendedProducts.length || /te propongo|puedo ayudarte|si quieres/i.test(base)) return base;
  return `${base} Si quieres, te propongo una opcion concreta para avanzar sin complicarte.`;
};

const buildHandoffSummary = ({ existingSummary, recommendedProducts = [], suggestedBundle, request }) => {
  if (existingSummary) return existingSummary;

  const proposedProducts = suggestedBundle?.items?.length
    ? suggestedBundle.items
    : recommendedProducts.map((item) => item.name).slice(0, 4);
  const useContext = inferUseContext(request);
  const leadTemperature = inferLeadTemperature('handoff', null, null);
  const locationHint = inferLocationHint(request);
  const customerNeed = truncateText(inferCustomerNeed(request, recommendedProducts, suggestedBundle), 40);
  const proposal = truncateText(proposedProducts.join(', ') || 'por confirmar', 40);
  const lastMessage = truncateText(request.message, 28);

  let summary = `Interes: ${customerNeed}. Uso: ${truncateText(useContext, 22)}.${locationHint ? ` Ubicacion: ${truncateText(locationHint, 18)}.` : ''} Propuesta: ${proposal}. Temperatura: ${leadTemperature}. Ultimo mensaje: ${lastMessage}`;

  if (summary.length > 280) {
    summary = `Interes: ${customerNeed}. Uso: ${truncateText(useContext, 18)}.${locationHint ? ` Ubicacion: ${truncateText(locationHint, 16)}.` : ''} Propuesta: ${proposal}. Temperatura: ${leadTemperature}.`;
  }

  return summary;
};

const buildHandoffDetails = ({ response, request, recommendedProducts = [], suggestedBundle, leadTemperature }) => {
  const proposedProducts = suggestedBundle?.items?.length
    ? suggestedBundle.items
    : recommendedProducts.map((item) => item.name).slice(0, 4);

  return {
    customerNeed: inferCustomerNeed(request, recommendedProducts, suggestedBundle),
    useContext: inferUseContext(request),
    locationHint: inferLocationHint(request),
    urgencyHint: inferUrgencyHint(request),
    handoffReason: inferHandoffReason({ response, request }),
    channel: 'web_widget',
    lastCustomerMessage: truncateText(request.message, 280),
    proposedProducts,
    bundleTitle: suggestedBundle?.title || null,
    leadTemperature,
    nextAction: response.nextStep === 'handoff'
      ? 'continuar cierre por WhatsApp con una persona'
      : response.nextStep === 'preclose'
        ? 'validar propuesta y ofrecer continuidad por WhatsApp'
        : 'seguir orientando antes de cerrar',
  };
};

export const normalizeGenerativeSalesReply = ({ response, request }) => {
  const recommendedProducts = normalizeRecommendedProducts(response.recommendedProducts, request.catalog);
  const suggestedBundle = normalizeSuggestedBundle({
    suggestedBundle: response.suggestedBundle,
    catalog: request.catalog,
    recommendedProducts,
    detectedIntent: response.detectedIntent,
    request,
    nextStep: response.nextStep,
  });

  const currentProductId = request.currentProduct?.id || request.sessionContext?.currentProductId || null;
  const category = request.currentProduct?.category || request.sessionContext?.category || null;
  const strengthenedMessage = response.detectedIntent === 'objection'
    ? strengthenObjectionMessage({ message: response.message, recommendedProducts })
    : response.nextStep === 'preclose'
      ? strengthenPrecloseMessage({ message: response.message, recommendedProducts, suggestedBundle })
      : strengthenAssistMessage({ message: response.message, recommendedProducts });
  const leadTemperature = inferLeadTemperature(response.nextStep, response.detectedIntent, response.leadTemperature);
  const handoffDetails = response.nextStep === 'handoff' || response.nextStep === 'preclose'
    ? buildHandoffDetails({
      response,
      request,
      recommendedProducts,
      suggestedBundle,
      leadTemperature,
    })
    : response.handoffDetails ?? null;
  const isClosingStep = response.nextStep === 'handoff' || response.nextStep === 'preclose';
  const missingQualificationFields = isClosingStep ? getMissingQualificationFields({ handoffDetails }) : [];
  const requiresQualification = isClosingStep && missingQualificationFields.length > 0 && !hasExplicitHumanIntent(request);

  return {
    ...response,
    message: requiresQualification
      ? `${strengthenedMessage} ${buildQualificationAsk(missingQualificationFields)}`
      : strengthenedMessage,
    recommendedProducts,
    suggestedBundle,
    quickReplies: ensureQuickReplies({
      quickReplies: requiresQualification
        ? buildQualificationReplies({
          missingFields: missingQualificationFields,
          currentProductId,
          category,
        })
        : response.quickReplies,
      nextStep: requiresQualification ? 'preclose' : response.nextStep,
      currentProductId,
      category,
      detectedIntent: response.detectedIntent,
      request,
      suggestedBundle,
    }),
    leadTemperature,
    handoffSummary: requiresQualification
      ? null
      : response.nextStep === 'handoff'
      ? buildHandoffSummary({
        existingSummary: response.handoffSummary,
        recommendedProducts,
        suggestedBundle,
        request,
      })
      : response.handoffSummary ?? null,
    handoffDetails,
    sessionContext: {
      topic: requiresQualification ? 'recommendation' : (response.nextStep === 'handoff' ? 'handoff' : 'recommendation'),
      category: request.currentProduct?.category || request.sessionContext?.category || null,
      currentProductId,
      comparedProductIds: request.sessionContext?.comparedProductIds || [],
      useContext: handoffDetails?.useContext || request.sessionContext?.useContext || null,
      locationHint: handoffDetails?.locationHint || request.sessionContext?.locationHint || null,
      urgencyHint: handoffDetails?.urgencyHint || request.sessionContext?.urgencyHint || null,
      lastIntent: requiresQualification ? 'collect_handoff_details' : (response.nextStep === 'handoff' ? 'human_handoff' : 'continue_topic'),
      lastUserMessage: request.message,
    },
    nextStep: requiresQualification ? 'preclose' : response.nextStep,
  };
};
