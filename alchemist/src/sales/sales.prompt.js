import { SALES_ASSISTANT_ROLE_PROMPT } from './sales.playbook.js';

const formatProduct = (product) => {
  const parts = [
    `Nombre: ${product.name}`,
    product.category ? `Categoria: ${product.category}` : null,
    product.description ? `Descripcion: ${product.description}` : null,
    typeof product.price === 'number' ? `Precio: ${product.price}` : null,
    product.priceLabel ? `Precio visible: ${product.priceLabel}` : null,
    product.badge ? `Badge: ${product.badge}` : null,
    typeof product.inStock === 'boolean' ? `Stock: ${product.inStock ? 'si' : 'no'}` : null,
    typeof product.comingSoon === 'boolean' ? `Lanzamiento proximo: ${product.comingSoon ? 'si' : 'no'}` : null,
    product.salesNote ? `Nota comercial: ${product.salesNote}` : null,
  ].filter(Boolean);

  return `- ${parts.join(' | ')}`;
};

const formatSessionContext = (sessionContext) => {
  if (!sessionContext) {
    return '- No hay contexto previo disponible.';
  }

  const parts = [
    sessionContext.topic ? `Tema activo: ${sessionContext.topic}` : null,
    sessionContext.category ? `Categoria activa: ${sessionContext.category}` : null,
    sessionContext.currentProductId ? `Producto activo: ${sessionContext.currentProductId}` : null,
    sessionContext.comparedProductIds?.length ? `Comparacion activa: ${sessionContext.comparedProductIds.join(', ')}` : null,
    sessionContext.lastIntent ? `Ultimo intent: ${sessionContext.lastIntent}` : null,
    sessionContext.lastUserMessage ? `Ultimo mensaje: ${sessionContext.lastUserMessage}` : null,
  ].filter(Boolean);

  return parts.length ? `- ${parts.join(' | ')}` : '- No hay contexto previo util.';
};

const formatQuickReply = (quickReply) => {
  if (!quickReply) {
    return '- No se activo quick reply estructurada.';
  }

  const payload = Object.keys(quickReply.payload || {}).length
    ? JSON.stringify(quickReply.payload)
    : '{}';

  return `- label: ${quickReply.label} | intent: ${quickReply.intent} | payload: ${payload}`;
};

export const buildSalesAssistantPrompt = ({ request }) => {
  const currentProductBlock = request.currentProduct
    ? `\nProducto principal observado:\n${formatProduct(request.currentProduct)}`
    : '\nProducto principal observado:\n- No hay producto principal activo.';

  const recentProductsBlock = request.recentProducts.length
    ? request.recentProducts.map(formatProduct).join('\n')
    : '- No hay historial reciente.';

  const catalogBlock = request.catalog.map(formatProduct).join('\n');

  return `
${SALES_ASSISTANT_ROLE_PROMPT}

Reglas adicionales del sistema:
- solo puedes usar los productos entregados en este catalogo dinamico
- si detectas intencion fuerte de compra, prepara un resumen y marca nextStep="handoff"
- si aun estas orientando o sugiriendo, usa nextStep="assist"
- si ya armaste propuesta y falta validar intencion, usa nextStep="preclose"
- recomienda maximo 3 productos
- el bundle sugerido puede tener maximo 4 items
- si corresponde, completa detectedIntent y leadTemperature
- las quickReplies deben ser objetos con label, intent y payload
- en payload incluye solo claves utiles entre prompt, topic, category, currentProductId y comparedProductIds
- si el usuario dice "ese", "ellos" o "el otro", usa primero el contexto de sesion y la quick reply estructurada antes de pedir aclaracion
- si detectedIntent es "objection", la respuesta debe validar la duda y luego proponer un siguiente paso concreto
- si nextStep es "preclose", el mensaje debe incluir un mini resumen de propuesta y una invitacion clara a seguir
- si propones suggestedBundle, sus items deben ser coherentes entre si y el summary debe explicar el contexto de uso
- evita quickReplies genericas como "continuar" o "ok"; prefiere acciones comerciales claras

Responde SOLO JSON valido con esta forma:
{
  "message": string,
  "quickReplies": [
    {
      "label": string,
      "intent": string,
      "payload": {
        "prompt": string,
        "topic": "recommendation" | "catalog" | "comparison" | "handoff" | "unknown",
        "category": string,
        "currentProductId": number,
        "comparedProductIds": number[]
      }
    }
  ],
  "recommendedProducts": [{"name": string, "reason": string}],
  "suggestedBundle": {
    "title": string,
    "summary": string,
    "items": string[],
    "intent": "cross_sell" | "up_sell" | "bundle"
  },
  "nextStep": "assist" | "preclose" | "handoff",
  "detectedIntent": "buy_specific" | "needs_recommendation" | "comparing" | "price_or_format_doubt" | "objection" | "delivery_question" | "availability_question" | "outside_catalog" | "frustrated_customer",
  "leadTemperature": "frio" | "tibio" | "caliente" | "listo_para_cierre",
  "handoffSummary": string,
  "shouldHighlightHuman": boolean
}

Contexto de navegacion:
- locale: ${request.locale}
- ruta actual: ${request.pagePath}
${currentProductBlock}

Productos vistos recientemente:
${recentProductsBlock}

Contexto corto de la sesion:
${formatSessionContext(request.sessionContext)}

Quick reply activada:
${formatQuickReply(request.quickReply)}

Catalogo disponible:
${catalogBlock}

Mensaje del usuario:
${request.message}
`.trim();
};
