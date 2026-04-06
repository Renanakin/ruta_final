import { startTransition, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, buildWhatsAppContextUrl } from '../../lib/constants';
import SalesBubble from './SalesBubble';
import SalesAssistantPanel from './SalesAssistantPanel';
import {
  SALES_ASSISTANT_ACTIVATION,
  SALES_ASSISTANT_CONTEXT_COPY,
  SALES_ASSISTANT_DEFAULT_WELCOME,
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

const loadPersistedSalesAssistantState = () => {
  if (typeof window === 'undefined') {
    return {
      messages: buildDefaultMessages(),
      recommendedProducts: [],
      sessionContext: null,
      recentProductIds: [],
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
    };
  } catch {
    return {
      messages: buildDefaultMessages(),
      recommendedProducts: [],
      sessionContext: null,
      recentProductIds: [],
    };
  }
};

const AlquimistaSalesAssistant = ({
  enabled = true,
  pathname = '/',
  products = [],
  currentProduct = null,
  onTrackEvent,
  onDirectOrder,
}) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SALES_ASSISTANT_STORAGE_KEY) === '1';
  });
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const initialSessionState = useMemo(() => loadPersistedSalesAssistantState(), []);
  const [messages, setMessages] = useState(initialSessionState.messages);
  const [recommendedProducts, setRecommendedProducts] = useState(initialSessionState.recommendedProducts);
  const [sessionContext, setSessionContext] = useState(initialSessionState.sessionContext);
  const [recentProductIds, setRecentProductIds] = useState(initialSessionState.recentProductIds);

  const provider = useMemo(
    () => createSalesAssistantProvider({ apiBaseUrl: API_BASE_URL }),
    []
  );

  const teaser = currentProduct
    ? SALES_ASSISTANT_CONTEXT_COPY.productTeaser
    : SALES_ASSISTANT_CONTEXT_COPY.defaultTeaser;

  useEffect(() => {
    if (!enabled || dismissed || open) return undefined;

    const timeoutId = window.setTimeout(() => {
      startTransition(() => setOpen(true));
      onTrackEvent?.('sales_assistant_opened', {
        source: 'auto',
        page_path: pathname,
        current_product_id: currentProduct?.id || null,
      });
    }, SALES_ASSISTANT_ACTIVATION.bubbleDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [currentProduct?.id, dismissed, enabled, onTrackEvent, open, pathname]);

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
    }));
  }, [messages, recommendedProducts, recentProductIds, sessionContext]);

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
      }),
    ]);
  };

  const sendMessage = async (nextMessage, options = {}) => {
    const quickReply = normalizeQuickReply(options.quickReply);
    const normalized = String(nextMessage || draft).trim();
    if (!normalized || loading) return;

    setMessages((current) => [...current, createMessage('user', normalized)]);
    setDraft('');
    setLoading(true);

    try {
      const payload = await provider.sendMessage({
        message: normalized,
        pagePath: pathname,
        currentProductId: currentProduct?.id || null,
        recentProductIds,
        sessionContext,
        quickReply,
      });

      handleAssistantResponse(payload);
      onTrackEvent?.('sales_assistant_engaged', {
        page_path: pathname,
        current_product_id: currentProduct?.id || null,
        next_step: payload.nextStep,
        quick_reply_intent: quickReply?.intent || null,
      });
    } catch {
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
          }
        ),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanHandoff = (summary) => {
    onTrackEvent?.('sales_assistant_handoff', {
      page_path: pathname,
      current_product_id: currentProduct?.id || null,
    });

    const url = buildWhatsAppContextUrl(summary);
    window.open(url, '_blank');
  };

  if (!enabled || pathname.startsWith('/alquimista')) {
    return null;
  }

  return (
    <>
      <SalesAssistantPanel
        open={open}
        onClose={() => {
          setOpen(false);
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
              source: 'manual',
              page_path: pathname,
              current_product_id: currentProduct?.id || null,
            });
          }
        }}
      />
    </>
  );
};

export default AlquimistaSalesAssistant;
