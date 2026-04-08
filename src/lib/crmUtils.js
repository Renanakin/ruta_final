export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('es-CL');
};

export const downloadFile = (content, filename, mimeType) => {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'nuevo': return 'bg-yolk-100 text-yolk-700';
    case 'confirmado': return 'bg-blue-100 text-blue-700';
    case 'entregado': return 'bg-green-100 text-green-700';
    case 'cancelado': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export const getScheduleBadge = (schedule) => {
  if (schedule === '09:00') return 'bg-yolk-100 text-yolk-700';
  if (schedule === '14:00') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-700';
};
