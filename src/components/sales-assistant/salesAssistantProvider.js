export const createSalesAssistantProvider = ({
  apiBaseUrl,
  fetchImpl = fetch,
} = {}) => {
  if (!apiBaseUrl) {
    throw new Error('createSalesAssistantProvider requiere apiBaseUrl.');
  }

  return {
    async getPilotEligibility({
      sessionId,
      pagePath,
      currentProductId = null,
      previewMode = null,
      previewToken = null,
    }) {
      const response = await fetchImpl(`${apiBaseUrl}/api/ai/sales/pilot/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          pagePath,
          currentProductId,
          previewMode,
          previewToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data) {
        throw new Error(data?.error || 'No se pudo evaluar la elegibilidad del piloto.');
      }

      return data.data;
    },
    async sendMessage({
      message,
      pagePath,
      locale = 'es-CL',
      conversationId = null,
      currentProductId = null,
      recentProductIds = [],
      sessionContext = null,
      quickReply = null,
    }) {
      const response = await fetchImpl(`${apiBaseUrl}/api/ai/sales/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          pagePath,
          locale,
          conversationId,
          currentProductId,
          recentProductIds,
          sessionContext,
          quickReply,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data) {
        throw new Error(data?.error || 'No se pudo obtener respuesta del asistente de ventas.');
      }

      return {
        ...data.data,
        responseMeta: data.meta || null,
      };
    },
  };
};
