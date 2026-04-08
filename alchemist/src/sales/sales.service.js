import { ZodError } from 'zod';
import { AlchemistProviderError, AlchemistValidationError } from '../errors.js';
import { parseJsonObjectFromText } from '../json.js';
import { resolveDeterministicSalesReply } from './sales.deterministic.js';
import { buildSalesAssistantPrompt } from './sales.prompt.js';
import {
  salesAssistantQuickReplyPayloadSchema,
  salesAssistantQuickReplySchema,
  salesAssistantRequestSchema,
  salesAssistantResponseSchema,
  salesAssistantSessionContextSchema,
} from './sales.schemas.js';

const normalizeIntentToken = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, '_').toLowerCase();
  return normalized || null;
};

const uniquePositiveIds = (values = [], max = 4) => [...new Set(
  values.filter((value) => Number.isInteger(value) && value > 0),
)].slice(0, max);

const mapDetectedIntentToTopic = (detectedIntent) => {
  switch (detectedIntent) {
    case 'needs_recommendation':
    case 'buy_specific':
    case 'objection':
      return 'recommendation';
    case 'price_or_format_doubt':
    case 'availability_question':
    case 'delivery_question':
    case 'outside_catalog':
      return 'catalog';
    case 'comparing':
      return 'comparison';
    case 'frustrated_customer':
      return 'handoff';
    default:
      return null;
  }
};

const mapIntentToTopic = (intent) => {
  if (!intent) return null;
  if (intent.includes('handoff') || intent.includes('human')) return 'handoff';
  if (intent.includes('compare')) return 'comparison';
  if (intent.includes('price') || intent.includes('availability') || intent.includes('catalog')) return 'catalog';
  if (intent.includes('recommend') || intent.includes('bundle') || intent.includes('continue')) return 'recommendation';
  return null;
};

const buildFallbackComparisonIds = (request, previousContext) => uniquePositiveIds([
  ...(previousContext?.comparedProductIds || []),
  request.currentProduct?.id,
  ...request.recentProducts.map((product) => product.id),
], 4);

const buildSessionContext = ({ request, response }) => {
  const previousContext = request.sessionContext || null;
  const quickReplyPayload = request.quickReply?.payload || {};
  const detectedIntent = normalizeIntentToken(response.detectedIntent);
  const replyIntent = normalizeIntentToken(request.quickReply?.intent);
  const responseContext = response.sessionContext || null;
  const nextTopic = response.nextStep === 'handoff'
    ? 'handoff'
    : responseContext?.topic
      || quickReplyPayload.topic
      || mapDetectedIntentToTopic(response.detectedIntent)
      || mapIntentToTopic(replyIntent)
      || (request.currentProduct ? 'catalog' : null)
      || previousContext?.topic
      || 'unknown';

  const comparedProductIds = nextTopic === 'comparison'
    ? uniquePositiveIds(
      quickReplyPayload.comparedProductIds?.length
        ? quickReplyPayload.comparedProductIds
        : buildFallbackComparisonIds(request, previousContext),
      4,
    )
    : [];

  return salesAssistantSessionContextSchema.parse({
    topic: nextTopic,
    category: responseContext?.category || quickReplyPayload.category || request.currentProduct?.category || previousContext?.category || null,
    currentProductId: responseContext?.currentProductId || quickReplyPayload.currentProductId || request.currentProduct?.id || previousContext?.currentProductId || null,
    comparedProductIds: responseContext?.comparedProductIds?.length ? responseContext.comparedProductIds : comparedProductIds,
    lastIntent: responseContext?.lastIntent || replyIntent || detectedIntent || previousContext?.lastIntent || 'continue_topic',
    lastUserMessage: responseContext?.lastUserMessage || request.message,
  });
};

const buildQuickReplyPayload = ({ reply, request, sessionContext }) => {
  const replyIntent = normalizeIntentToken(reply.intent) || 'continue_topic';
  const basePayload = reply.payload || {};
  const nextPayload = {
    ...basePayload,
    prompt: basePayload.prompt || reply.label,
    topic: basePayload.topic || mapIntentToTopic(replyIntent) || sessionContext.topic || 'unknown',
  };

  if (!nextPayload.category && sessionContext.category) {
    nextPayload.category = sessionContext.category;
  }

  if (!nextPayload.currentProductId && sessionContext.currentProductId) {
    nextPayload.currentProductId = sessionContext.currentProductId;
  }

  if (replyIntent.includes('compare') && !nextPayload.comparedProductIds?.length) {
    const fallbackComparisonIds = sessionContext.comparedProductIds?.length
      ? sessionContext.comparedProductIds
      : buildFallbackComparisonIds(request, sessionContext);

    if (fallbackComparisonIds.length) {
      nextPayload.comparedProductIds = fallbackComparisonIds;
    }
  }

  if (replyIntent.includes('handoff') && typeof nextPayload.highlightHuman !== 'boolean') {
    nextPayload.highlightHuman = true;
  }

  return salesAssistantQuickReplyPayloadSchema.parse(nextPayload);
};

const enrichQuickReplies = (quickReplies, { request, sessionContext }) => quickReplies.map((reply) => salesAssistantQuickReplySchema.parse({
  label: reply.label,
  intent: reply.intent,
  payload: buildQuickReplyPayload({ reply, request, sessionContext }),
}));

export const createSalesAssistantService = ({ textGenerator, logger } = {}) => {
  if (!textGenerator || typeof textGenerator.generateText !== 'function') {
    throw new Error('createSalesAssistantService requiere un textGenerator con generateText().');
  }

  return {
    async generateReply(input) {
      let request;

      try {
        request = salesAssistantRequestSchema.parse(input);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new AlchemistValidationError('Solicitud invalida para el asistente de ventas.', error.flatten());
        }

        throw error;
      }

      const deterministicReply = resolveDeterministicSalesReply(request);
      if (deterministicReply) {
        const parsedResponse = salesAssistantResponseSchema.parse(deterministicReply);
        const sessionContext = buildSessionContext({ request, response: parsedResponse });
        const quickReplies = enrichQuickReplies(parsedResponse.quickReplies, { request, sessionContext });

        return salesAssistantResponseSchema.parse({
          ...parsedResponse,
          quickReplies,
          sessionContext,
        });
      }

      const prompt = buildSalesAssistantPrompt({ request });
      const rawText = await textGenerator.generateText(prompt, {
        feature: 'sales_assistant',
        locale: request.locale,
      });

      const parsedPayload = parseJsonObjectFromText(rawText);

      try {
        const parsedResponse = salesAssistantResponseSchema.parse(parsedPayload);
        const sessionContext = buildSessionContext({ request, response: parsedResponse });
        const quickReplies = enrichQuickReplies(parsedResponse.quickReplies, { request, sessionContext });

        return salesAssistantResponseSchema.parse({
          ...parsedResponse,
          quickReplies,
          sessionContext,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          logger?.warn?.(
            {
              feature: 'sales_assistant',
              validation: error.flatten(),
              payloadPreview: parsedPayload,
            },
            'El proveedor de IA devolvio una respuesta de ventas invalida',
          );

          throw new AlchemistProviderError('La IA de ventas devolvio una respuesta invalida.', error.flatten());
        }

        throw error;
      }
    },
  };
};
