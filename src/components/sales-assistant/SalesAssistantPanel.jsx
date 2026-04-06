import { Loader2, MessageSquareText, Sparkles, X } from 'lucide-react';
import SalesAssistantProductCards from './SalesAssistantProductCards';

const SalesAssistantPanel = ({
  open,
  onClose,
  messages,
  loading,
  draft,
  onDraftChange,
  onSend,
  onQuickReply,
  recommendedProducts,
  onOrderProduct,
  onHumanHandoff,
}) => {
  if (!open) return null;

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');

  return (
    <div className="fixed bottom-24 right-4 z-[95] w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-stone-950 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-brand-900 via-stone-950 to-alchemy-900 px-5 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,170,70,0.24),transparent_45%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <img
              src="/images/AVATAR_CHAT.png"
              alt="Avatar del asistente de ventas"
              className="mt-0.5 h-12 w-12 shrink-0 rounded-full border border-yolk-400/40 object-cover"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yolk-300">Asistente de ventas</p>
              <h3 className="mt-2 text-2xl font-serif font-black">El Alquimista del Nido</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-200">
                Te ayudo a elegir mejor y dejar la compra lista antes del contacto humano.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 transition-colors hover:bg-white/12"
              aria-label="Cerrar asistente de ventas"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[29rem] overflow-y-auto bg-beige-50 px-4 py-4 text-stone-900">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === 'assistant'
                ? 'rounded-[1.4rem] rounded-tl-sm bg-white p-4 shadow-sm'
                : 'ml-6 rounded-[1.4rem] rounded-tr-sm bg-brand-700 p-4 text-white shadow-sm'
              }
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              {message.bundle && (
                <div className="mt-3 rounded-2xl border border-alchemy-200 bg-alchemy-50 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-alchemy-700">{message.bundle.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-700">{message.bundle.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.bundle.items.map((item) => (
                      <span key={item} className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-bold text-stone-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {message.handoffSummary && (
                <button
                  onClick={() => onHumanHandoff?.(message.handoffSummary)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-brand-950"
                >
                  <MessageSquareText size={16} />
                  Continuar con una persona
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="rounded-[1.4rem] rounded-tl-sm bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                <Loader2 size={16} className="animate-spin" />
                El Alquimista esta preparando una propuesta...
              </div>
            </div>
          )}
        </div>

        {recommendedProducts?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Productos sugeridos</p>
            <SalesAssistantProductCards products={recommendedProducts} onOrder={onOrderProduct} />
          </div>
        )}
      </div>

      <div className="border-t border-stone-200 bg-white px-4 py-4">
        {lastAssistantMessage?.quickReplies?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {lastAssistantMessage.quickReplies.map((reply) => (
              <button
                key={`${reply.intent}_${reply.label}`}
                onClick={() => onQuickReply(reply)}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-stone-700 transition-colors hover:bg-stone-100"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
          className="flex gap-2"
        >
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Escribe tu consulta..."
            className="min-w-0 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !draft.trim()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            aria-label="Enviar mensaje al asistente de ventas"
          >
            <Sparkles size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalesAssistantPanel;
