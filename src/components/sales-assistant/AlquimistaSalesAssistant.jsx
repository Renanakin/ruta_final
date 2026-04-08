import { startTransition, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, buildWhatsAppContextUrl, buildWhatsAppSalesHandoffUrl, createSessionId } from '../../lib/constants';
import SalesBubble from './SalesBubble';
import SalesAssistantPanel from './SalesAssistantPanel';
import {
  SALES_ASSISTANT_ACTIVATION,
  SALES_ASSISTANT_CONTEXT_COPY,
  SALES_ASSISTANT_DEFAULT_WELCOME,
  SALES_ASSISTANT_PILOT_PREVIEW_MODE_KEY,
  SALES_ASSISTANT_PILOT_PREVIEW_TOKEN_KEY,
  SALES_ASSISTANT_SESSION_STORAGE_KEY,
  SALES_ASSISTANT_STORAGE_KEY,
} from './salesAssistant.config';
import { createSalesAssistantProvider } from './salesAssistantProvider';

const createMessage = (role, text, extra = {}) => ({
  id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  ...extra,
});

const normalizeQuickReply = (reply) => {
  if (!reply) return null;

  if (typeof reply === 'string') {
    return {
      label: reply,
      intent: 'continue_topic',
      payload: { prompt: reply },
    };
  }

  return {
    label: String(reply.label || '').trim(),
    intent: String(reply.intent || 'continue_topic').trim() || 'continue_topic',
    payload: typeof reply.payload === 'object' && reply.payload ? reply.payload : {},
  };
};

const normalizeQuickReplies = (quickReplies = []) => quickReplies
  .map(normalizeQuickReply)
  .filter((reply) => reply?.label);

const normalizeStoredMessage = (message) => ({
  ...message,
  quickReplies: normalizeQuickReplies(message.quickReplies),
});

const buildDefaultMessages = () => [normalizeStoredMessage(SALES_ASSISTANT_DEFAULT_WELCOME)];

const buildConversationId = (analyticsSessionId) => {
  const scope = analyticsSessionId || 'sales_assistant';
  return `${scope}_sales_${createSessionId()}`;
};

const syncPilotPreviewState = () => {
  if (typeof window === 'undefined') {
    return { previewMode: null, previewToken: null };
  }

  const url = new URL(window.location.href);
  const mode = url.searchParams.get('salesAssistantPilot');
  const token = url.searchParams.get('salesAssistantPilotToken');

  if (mode === 'reset') {
    window.localStorage.removeItem(SALES_ASSISTANT_PILOT_PREVIEW_MODE_KEY);
    window.localStorage.removeItem(SALES_ASSISTANT_PILOT_PREVIEW_TOKEN_KEY);
  } else if (mode === 'force' || mode === 'off') {
    window.localStorage.setItem(SALES_ASSISTANT_PILOT_PREVIEW_MODE_KEY, mode);
  }

  if (token) {
    window.localStorage.setItem(SALES_ASSISTANT_PILOT_PREVIEW_TOKEN_KEY, token);
  }

  return {
    previewMode: window.localStorage.getItem(SALES_ASSISTANT_PILOT_PREVIEW_MODE_KEY),
    previewToken: window.localStorage.getItem(SALES_ASSISTANT_PILOT_PREVIEW_TOKEN_KEY),
  };
};

const loadPersistedSalesAssistantState = (analyticsSessionId) => {
  if (typeof window === 'undefined') {
    return {
      messages: buildDefaultMessages(),
      recommendedProducts: [],
      sessionContext: null,
      recentProductIds: [],
      conversationId: buildConversationId(analyticsSessionId),
    };
  }

  try {
    const rawValue = window.sessionStorage.getItem(SALES_ASSISTANT_SESSION_STORAGE_KEY);
    if (!rawValue) {
      return {
        messages: buildDefaultMessages(),
        recommendedProducts: [],
        sessionContext: null,
        recentProductIds: [],
        conversationId: buildConversationId(analyticsSessionId),
      };
    }

    const parsed = JSON.parse(rawValue);

    return {
      messages: Array.isArray(parsed.messages) && parsed.messages.length
        ? parsed.messages.map(normalizeStoredMessage)
        : buildDefaultMessages(),
      recommendedProducts: Array.isArray(parsed.recommendedProducts) ? parsed.recommendedProducts : [],
      sessionContext: parsed.sessionContext && typeof parsed.sessionContext === 'object'
        ? parsed.sessionContext
        : null,
      recentProductIds: Array.isArray(parsed.recentProductIds)
        ? [...new Set(parsed.recentProductIds.filter((id) => Number.isInteger(id) && id > 0))].slice(0, 6)
        : [],
      conversationId: typeof parsed.conversationId === 'string' && parsed.conversationId.length >= 8
        ? parsed.conversationId
        : buildConversationId(analyticsSessionId),
    };
  } catch {
    return {
      messages: buildDefaultMessages(),
      recommendedProducts: [],
      sessionContext: null,
      recentProductIds: [],
      conversationId: buildConversationId(analyticsSessionId),
    };
  }
};

const AlquimistaSalesAssistant = ({
  enabled = true,
  pathname = '/',
  products = [],
  currentProduct = null,
  analyticsSessionId = null,
  onTrackEvent,
  onDirectOrder,
}) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (import.meta.env.DEV) return false;
    return window.localStorage.getItem(SALES_ASSISTANT_STORAGE_KEY) === '1';
  });
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const initialSessionState = useMemo(() => loadPersistedSalesAssistantState(analyticsSessionId), [analyticsSessionId]);
  const [messages, setMessages] = useState(initialSessionState.messages);
  const [recommendedProducts, setRecommendedProducts] = useState(initialSessionState.recommendedProducts);
  const [sessionContext, setSessionContext] = useState(initialSessionState.sessionContext);
  const [recentProductIds, setRecentProductIds] = useState(initialSessionState.recentProductIds);
  const [conversationId] = useState(initialSessionState.conversationId);
  const [pilotEligibility, setPilotEligibility] = useState({ eligible: false, reason: 'loading', enabled: false });
  const [pilotLoading, setPilotLoading] = useState(enabled);

  const provider = useMemo(
    () => createSalesAssistantProvider({ apiBaseUrl: API_BASE_URL }),
    []
  );

  const teaser = currentProduct
    ? SALES_ASSISTANT_CONTEXT_COPY.productTeaser
    : SALES_ASSISTANT_CONTEXT_COPY.defaultTeaser;

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setPilotEligibility({ eligible: false, reason: 'hard_disabled', enabled: false });
      setPilotLoading(false);
      return undefined;
    }

    const run = async () => {
      try {
        setPilotLoading(true);
        const preview = syncPilotPreviewState();
        const eligibility = await provider.getPilotEligibility({
          sessionId: analyticsSessionId || 'anonymous_sales_session',
          pagePath: pathname,
          currentProductId: currentProduct?.id || null,
          previewMode: preview.previewMode || null,
          previewToken: preview.previewToken || null,
        });

        if (!active) return;
        setPilotEligibility(eligibility);
      } catch {
        if (!active) return;
        setPilotEligibility({ eligible: false, reason: 'eligibility_error', enabled: false });
      } finally {
        if (active) {
          setPilotLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [analyticsSessionId, currentProduct?.id, enabled, pathname, provider]);

  useEffect(() => {
    if (!enabled || !pilotEligibility.eligible || dismissed || open) return undefined;

    const timeoutId = window.setTimeout(() => {
      startTransition(() => setOpen(true));
      onTrackEvent?.('sales_assistant_opened', {
        conversation_id: conversationId,
        source: 'auto',
        page_path: pathname,
        current_product_id: currentProduct?.id || null,
        pilot_reason: pilotEligibility.reason || null,
        pilot_cohort: pilotEligibility.cohort ?? null,
      });
    }, SALES_ASSISTANT_ACTIVATION.bubbleDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [conversationId, currentProduct?.id, dismissed, enabled, onTrackEvent, open, pathname, pilotEligibility]);

  useEffect(() => {
    if (!currentProduct?.id) return;

    setRecentProductIds((current) => [
      currentProduct.id,
      ...current.filter((id) => id !== currentProduct.id),
    ].slice(0, 6));

    setSessionContext((current) => ({
      ...(current || {}),
      currentProductId: currentProduct.id,
      category: currentProduct.category || current?.category || null,
      topic: current?.topic === 'comparison' ? current.topic : (current?.topic || 'catalog'),
    }));
  }, [currentProduct?.category, currentProduct?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem(SALES_ASSISTANT_SESSION_STORAGE_KEY, JSON.stringify({
      messages,
      recommendedProducts,
      sessionContext,
      recentProductIds,
      conversationId,
    }));
  }, [conversationId, messages, recommendedProducts, recentProductIds, sessionContext]);

  const resolveRecommendedProducts = (items = []) =>
    items
      .map((item) => {
        const product = products.find((candidate) => candidate.name === item.name);
        if (!product) {
          return {
            id: item.name,
            name: item.name,
            reason: item.reason,
          };
        }

        return {
          id: product.id,
          name: product.name,
          image: product.image,
          badge: product.badge,
          reason: item.reason,
        };
      })
      .filter(Boolean);

  const handleAssistantResponse = (payload) => {
    setRecommendedProducts(resolveRecommendedProducts(payload.recommendedProducts));
    setSessionContext(payload.sessionContext || null);

    setMessages((current) => [
      ...current,
      createMessage('assistant', payload.message, {
        quickReplies: normalizeQuickReplies(payload.quickReplies),
        bundle: payload.suggestedBundle,
        handoffSummary: payload.nextStep === 'handoff' ? payload.handoffSummary : undefined,
        handoffDetails: payload.nextStep === 'handoff' ? payload.handoffDetails : undefined,
      }),
    ]);
  };

  const sendMessage = async (nextMessage, options = {}) => {
    const quickReply = normalizeQuickReply(options.quickReply);
    const normalized = String(nextMessage || draft).trim();
    if (!normalized || loading) return;
    const startedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const messageSource = quickReply ? 'quick_reply' : 'free_text';

    setMessages((current) => [...current, createMessage('user', normalized)]);
    setDraft('');
    setLoading(true);

    try {
      const payload = await provider.sendMessage({
        message: normalized,
        pagePath: pathname,
        conversationId,
        currentProductId: currentProduct?.id || null,
        recentProductIds,
        sessionContext,
        quickReply,
      });
      const roundtripMs = Math.round((typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - startedAt);

      handleAssistantResponse(payload);
      onTrackEvent?.('sales_assistant_engaged', {
        conversation_id: conversationId,
        page_path: pathname,
        current_product_id: currentProduct?.id || null,
        message_source: messageSource,
        message_length: normalized.length,
        next_step: payload.nextStep,
        quick_reply_intent: quickReply?.intent || null,
        detected_intent: payload.detectedIntent || payload.responseMeta?.salesAssistant?.detectedIntent || null,
        resolved_by: payload.responseMeta?.salesAssistant?.resolvedBy || null,
        handoff: payload.nextStep === 'handoff',
        should_highlight_human: Boolean(payload.shouldHighlightHuman),
        recommended_products_count: payload.recommendedProducts?.length || 0,
        roundtrip_ms: roundtripMs,
        latency_ms: payload.responseMeta?.salesAssistant?.latencyMs || roundtripMs,
        topic: payload.sessionContext?.topic || null,
        category: payload.sessionContext?.category || null,
        lead_temperature: payload.handoffDetails?.leadTemperature || payload.leadTemperature || null,
      });
    } catch (error) {
      const roundtripMs = Math.round((typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - startedAt);
      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          'No pude preparar una recomendacion ahora mismo, pero puedo pasarte directo con una persona para continuar la compra.',
          {
            quickReplies: normalizeQuickReplies([
              {
                label: 'Hablar con una persona',
                intent: 'human_handoff',
                payload: { topic: 'handoff', prompt: 'Hablar con una persona', highlightHuman: true },
              },
              {
                label: 'Ver productos destacados',
                intent: 'show_recommendations',
                payload: { topic: 'recommendation', prompt: 'Ver productos destacados' },
              },
            ]),
            handoffSummary: 'Quiero continuar mi compra con ayuda del equipo de Ruta del Nido.',
            handoffDetails: {
              customerNeed: 'cliente solicita apoyo humano',
              useContext: sessionContext?.category ? `compra enfocada en ${sessionContext.category}` : 'uso por confirmar',
              locationHint: null,
              proposedProducts: [],
              bundleTitle: null,
              leadTemperature: 'tibio',
              nextAction: 'continuar cierre por WhatsApp con una persona',
            },
          }
        ),
      ]);

      onTrackEvent?.('sales_assistant_fallback', {
        conversation_id: conversationId,
        page_path: pathname,
        current_product_id: currentProduct?.id || null,
        message_source: messageSource,
        message_length: normalized.length,
        quick_reply_intent: quickReply?.intent || null,
        fallback: true,
        handoff: true,
        error_message: error instanceof Error ? error.message : 'sales_assistant_request_failed',
        roundtrip_ms: roundtripMs,
        category: sessionContext?.category || currentProduct?.category || null,
        topic: sessionContext?.topic || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHumanHandoff = (message) => {
    onTrackEvent?.('sales_assistant_handoff', {
      conversation_id: conversationId,
      page_path: pathname,
      current_product_id: currentProduct?.id || null,
      lead_temperature: typeof message === 'object' ? message?.handoffDetails?.leadTemperature || null : null,
      handoff_reason: typeof message === 'object' ? message?.handoffDetails?.handoffReason || null : null,
    });

    const summary = typeof message === 'string' ? message : message?.handoffSummary;
    const details = typeof message === 'object' ? message?.handoffDetails : null;
    const url = details
      ? buildWhatsAppSalesHandoffUrl({ summary, details })
      : buildWhatsAppContextUrl(summary);
    window.open(url, '_blank');
  };

  if (!enabled || pilotLoading || !pilotEligibility.eligible || pathname.startsWith('/alquimista')) {
    return null;
  }

  return (
    <>
      <SalesAssistantPanel
        open={open}
        onClose={() => {
          setOpen(false);
          if (import.meta.env.DEV) {
            setDismissed(false);
            return;
          }

          setDismissed(true);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(SALES_ASSISTANT_STORAGE_KEY, '1');
          }
        }}
        messages={messages}
        loading={loading}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => sendMessage()}
        onQuickReply={(reply) => sendMessage(reply.payload?.prompt || reply.label, { quickReply: reply })}
        recommendedProducts={recommendedProducts}
        onOrderProduct={onDirectOrder}
        onHumanHandoff={handleHumanHandoff}
      />
      <SalesBubble
        open={open}
        teaser={teaser}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) {
            onTrackEvent?.('sales_assistant_opened', {
              conversation_id: conversationId,
              source: 'manual',
              page_path: pathname,
              current_product_id: currentProduct?.id || null,
              pilot_reason: pilotEligibility.reason || null,
              pilot_cohort: pilotEligibility.cohort ?? null,
            });
          }
        }}
      />
    </>
  );
};

export default AlquimistaSalesAssistant;
