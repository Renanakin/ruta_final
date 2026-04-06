import { z } from 'zod';

const normalizeLine = (value) => value.trim().replace(/\s+/g, ' ');
const normalizeParagraph = (value) => value.trim().replace(/\s+/g, ' ');
const normalizeIntentToken = (value) => value.trim().replace(/\s+/g, '_').toLowerCase();
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const uniquePositiveIds = (values = [], max = 4) => [...new Set(values.filter(isPositiveInteger))].slice(0, max);

const productContextSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2).max(140).transform(normalizeLine),
  category: z.string().min(2).max(80).transform(normalizeLine).optional(),
  description: z.string().min(4).max(220).transform(normalizeParagraph).optional(),
  price: z.number().nonnegative().optional(),
  priceLabel: z.string().max(180).transform(normalizeParagraph).optional(),
  badge: z.string().max(120).transform(normalizeLine).optional(),
  inStock: z.boolean().optional(),
  comingSoon: z.boolean().optional(),
  salesNote: z.string().max(220).transform(normalizeParagraph).optional(),
});

export const salesAssistantSessionContextSchema = z.object({
  topic: z.enum(['recommendation', 'catalog', 'comparison', 'handoff', 'unknown']).optional().nullable(),
  category: z.string().min(2).max(80).transform(normalizeLine).optional().nullable(),
  currentProductId: z.number().int().positive().optional().nullable(),
  comparedProductIds: z.array(z.number().int().positive()).max(4).optional().default([]),
  lastIntent: z.string().min(2).max(60).transform(normalizeIntentToken).optional().nullable(),
  lastUserMessage: z.string().min(1).max(600).transform(normalizeParagraph).optional().nullable(),
}).transform((context) => ({
  topic: context.topic ?? null,
  category: context.category ?? null,
  currentProductId: context.currentProductId ?? null,
  comparedProductIds: uniquePositiveIds(context.comparedProductIds, 4),
  lastIntent: context.lastIntent ?? null,
  lastUserMessage: context.lastUserMessage ?? null,
}));

export const salesAssistantQuickReplyPayloadSchema = z.object({
  prompt: z.string().min(2).max(120).transform(normalizeParagraph).optional(),
  topic: z.enum(['recommendation', 'catalog', 'comparison', 'handoff', 'unknown']).optional().nullable(),
  category: z.string().min(2).max(80).transform(normalizeLine).optional().nullable(),
  currentProductId: z.number().int().positive().optional().nullable(),
  comparedProductIds: z.array(z.number().int().positive()).max(4).optional(),
  highlightHuman: z.boolean().optional(),
}).partial().transform((payload) => ({
  ...(payload.prompt ? { prompt: payload.prompt } : {}),
  ...(payload.topic ? { topic: payload.topic } : {}),
  ...(payload.category ? { category: payload.category } : {}),
  ...(payload.currentProductId ? { currentProductId: payload.currentProductId } : {}),
  ...(payload.comparedProductIds?.length ? { comparedProductIds: uniquePositiveIds(payload.comparedProductIds, 4) } : {}),
  ...(typeof payload.highlightHuman === 'boolean' ? { highlightHuman: payload.highlightHuman } : {}),
}));

const inferQuickReplyIntentFromLabel = (label) => {
  const normalized = label.toLowerCase();

  if (normalized.includes('persona') || normalized.includes('whatsapp')) return 'human_handoff';
  if (normalized.includes('compar')) return 'compare_products';
  if (normalized.includes('precio')) return 'show_price';
  if (normalized.includes('stock') || normalized.includes('dispon')) return 'show_availability';
  if (normalized.includes('pack') || normalized.includes('bundle')) return 'build_bundle';
  if (normalized.includes('recom') || normalized.includes('eleg') || normalized.includes('combina')) return 'show_recommendations';

  return 'continue_topic';
};

export const salesAssistantQuickReplySchema = z.object({
  label: z.string().min(2).max(80).transform(normalizeLine),
  intent: z.string().min(2).max(60).transform(normalizeIntentToken),
  payload: salesAssistantQuickReplyPayloadSchema.optional().default({}),
});

const salesAssistantQuickReplyInputSchema = z.union([
  z.string().min(2).max(80).transform(normalizeLine),
  salesAssistantQuickReplySchema,
]).transform((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return {
    label: value,
    intent: inferQuickReplyIntentFromLabel(value),
    payload: { prompt: value },
  };
});

export const salesAssistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(600),
  locale: z.string().trim().min(2).max(10).optional().default('es-CL'),
  pagePath: z.string().trim().min(1).max(140).optional().default('/'),
  currentProduct: productContextSchema.optional().nullable(),
  recentProducts: z.array(productContextSchema).max(6).optional().default([]),
  sessionContext: salesAssistantSessionContextSchema.optional().nullable(),
  quickReply: salesAssistantQuickReplySchema.optional().nullable(),
  catalog: z.array(productContextSchema).min(1).max(20),
});

const salesRecommendedProductSchema = z.object({
  name: z.string().min(2).max(140).transform(normalizeLine),
  reason: z.string().min(8).max(180).transform(normalizeParagraph),
});

const salesBundleSchema = z.object({
  title: z.string().min(3).max(120).transform(normalizeLine),
  summary: z.string().min(12).max(220).transform(normalizeParagraph),
  items: z.array(z.string().min(2).max(140).transform(normalizeLine)).min(1).max(4),
  intent: z.enum(['cross_sell', 'up_sell', 'bundle']),
});

export const salesAssistantResponseSchema = z.object({
  message: z.string().min(12).max(480).transform(normalizeParagraph),
  quickReplies: z.array(salesAssistantQuickReplyInputSchema).min(1).max(4),
  recommendedProducts: z.array(salesRecommendedProductSchema).max(3).default([]),
  suggestedBundle: salesBundleSchema.nullable().optional(),
  nextStep: z.enum(['assist', 'preclose', 'handoff']),
  detectedIntent: z.enum([
    'buy_specific',
    'needs_recommendation',
    'comparing',
    'price_or_format_doubt',
    'objection',
    'delivery_question',
    'availability_question',
    'outside_catalog',
    'frustrated_customer',
  ]).optional(),
  leadTemperature: z.enum(['frio', 'tibio', 'caliente', 'listo_para_cierre']).optional(),
  handoffSummary: z.string().min(10).max(280).transform(normalizeParagraph).nullable().optional(),
  shouldHighlightHuman: z.boolean().default(false),
  sessionContext: salesAssistantSessionContextSchema.nullable().optional(),
});
