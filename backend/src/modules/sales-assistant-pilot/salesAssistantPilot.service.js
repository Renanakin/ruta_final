import crypto from 'crypto';
import { getDb } from '../../config/db.js';

const DEFAULT_CONFIG = {
  enabled: false,
  rollout_percentage: 0,
  allowlist_enabled: false,
  allowlist_tokens: [],
  qa_force_enabled: true,
  page_scope: 'product_only',
  notes: '',
  updated_by: 'system',
  updated_at: null,
};

const normalizeTokens = (tokens = []) => [...new Set(
  (Array.isArray(tokens) ? tokens : [])
    .map((token) => String(token || '').trim())
    .filter(Boolean),
)].slice(0, 50);

const parseAllowlistTokens = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return normalizeTokens(value);

  try {
    return normalizeTokens(JSON.parse(value));
  } catch {
    return [];
  }
};

const normalizeConfigRow = (row) => {
  if (!row) return { ...DEFAULT_CONFIG };

  return {
    enabled: Boolean(row.enabled),
    rollout_percentage: Math.min(Math.max(Number(row.rollout_percentage || 0), 0), 100),
    allowlist_enabled: Boolean(row.allowlist_enabled),
    allowlist_tokens: parseAllowlistTokens(row.allowlist_tokens),
    qa_force_enabled: Boolean(row.qa_force_enabled),
    page_scope: row.page_scope === 'all' ? 'all' : 'product_only',
    notes: row.notes || '',
    updated_by: row.updated_by || 'system',
    updated_at: row.updated_at || null,
  };
};

const buildCohort = (sessionId) => {
  const digest = crypto.createHash('sha256').update(String(sessionId || '')).digest('hex');
  return Number.parseInt(digest.slice(0, 8), 16) % 100;
};

export const getSalesAssistantPilotConfig = async () => {
  const db = getDb();
  const row = await db.get('SELECT * FROM sales_assistant_pilot_config WHERE id = 1');
  return normalizeConfigRow(row);
};

export const updateSalesAssistantPilotConfig = async (input, updatedBy = 'system') => {
  const db = getDb();
  const payload = {
    enabled: Boolean(input.enabled),
    rollout_percentage: Math.min(Math.max(Number(input.rollout_percentage || 0), 0), 100),
    allowlist_enabled: Boolean(input.allowlist_enabled),
    allowlist_tokens: normalizeTokens(input.allowlist_tokens),
    qa_force_enabled: Boolean(input.qa_force_enabled),
    page_scope: input.page_scope === 'all' ? 'all' : 'product_only',
    notes: String(input.notes || '').trim(),
  };

  await db.run(
    `UPDATE sales_assistant_pilot_config
     SET enabled = ?, rollout_percentage = ?, allowlist_enabled = ?, allowlist_tokens = ?,
         qa_force_enabled = ?, page_scope = ?, notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    [
      payload.enabled ? 1 : 0,
      payload.rollout_percentage,
      payload.allowlist_enabled ? 1 : 0,
      JSON.stringify(payload.allowlist_tokens),
      payload.qa_force_enabled ? 1 : 0,
      payload.page_scope,
      payload.notes,
      updatedBy,
    ],
  );

  return getSalesAssistantPilotConfig();
};

export const evaluateSalesAssistantPilot = async ({
  sessionId,
  pagePath = '/',
  currentProductId = null,
  previewMode = null,
  previewToken = null,
} = {}) => {
  const config = await getSalesAssistantPilotConfig();
  const cohort = buildCohort(sessionId);
  const normalizedPreviewToken = String(previewToken || '').trim();

  if (!config.enabled) {
    return { enabled: false, eligible: false, reason: 'disabled', cohort, config };
  }

  if (previewMode === 'off') {
    return { enabled: true, eligible: false, reason: 'preview_off', cohort, config };
  }

  if (config.qa_force_enabled && previewMode === 'force') {
    return { enabled: true, eligible: true, reason: 'qa_force', cohort, config };
  }

  if (
    config.allowlist_enabled
    && normalizedPreviewToken
    && config.allowlist_tokens.includes(normalizedPreviewToken)
  ) {
    return { enabled: true, eligible: true, reason: 'allowlist', cohort, config };
  }

  if (config.page_scope === 'product_only' && !currentProductId) {
    return { enabled: true, eligible: false, reason: 'page_scope', cohort, config };
  }

  if (!sessionId) {
    return { enabled: true, eligible: false, reason: 'missing_session', cohort, config };
  }

  const eligible = cohort < config.rollout_percentage;
  return {
    enabled: true,
    eligible,
    reason: eligible ? 'rollout' : 'outside_rollout',
    cohort,
    config,
    pagePath,
  };
};
