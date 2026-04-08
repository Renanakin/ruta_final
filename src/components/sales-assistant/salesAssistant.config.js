export const SALES_ASSISTANT_STORAGE_KEY = 'rdn_sales_assistant_closed';
export const SALES_ASSISTANT_SESSION_STORAGE_KEY = 'rdn_sales_assistant_session';

export const SALES_ASSISTANT_DEFAULT_WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: 'Soy el Alquimista del Nido en modo ventas. Puedo ayudarte a entender productos, combinar mejor tu compra y dejar listo el pedido antes de pasarte con una persona.',
  quickReplies: [
    {
      label: 'Ayudame a elegir',
      intent: 'show_recommendations',
      payload: { topic: 'recommendation', prompt: 'Ayudame a elegir' },
    },
    {
      label: 'Arma un pack para mi',
      intent: 'build_bundle',
      payload: { topic: 'recommendation', prompt: 'Arma un pack para mi' },
    },
    {
      label: 'Que combina con esto',
      intent: 'continue_topic',
      payload: { topic: 'catalog', prompt: 'Que combina con esto' },
    },
  ],
};

export const SALES_ASSISTANT_CONTEXT_COPY = {
  defaultTeaser: 'Si quieres, te ayudo a armar una compra mas completa.',
  productTeaser: 'Puedo explicarte este producto y sugerirte un combo util.',
};

export const SALES_ASSISTANT_ACTIVATION = {
  bubbleDelayMs: 7000,
};
