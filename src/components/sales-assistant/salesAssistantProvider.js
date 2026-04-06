export const createSalesAssistantProvider = ({
  apiBaseUrl,
  fetchImpl = fetch,
} = {}) => {
  if (!apiBaseUrl) {
    throw new Error('createSalesAssistantProvider requiere apiBaseUrl.');
  }

  return {
    async sendMessage({
      message,
      pagePath,
      locale = 'es-CL',
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

      return data.data;
    },
  };
};
