export const CANCELLATION_REASON_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'stock', label: 'Stock' },
  { value: 'logistica', label: 'Logistica' },
  { value: 'pago', label: 'Pago' },
  { value: 'error_interno', label: 'Error interno' }
];

export const KPI_GLOSSARY = {
  sales_weekly: 'Total vendido en el periodo seleccionado. Sirve para medir ritmo comercial.',
  orders_total: 'Cantidad total de pedidos registrados en el periodo.',
  avg_ticket: 'Promedio de venta por pedido. Ayuda a entender valor por compra.',
  cancellation_rate: 'Porcentaje de pedidos cancelados respecto del total.',
  checkout_purchase: 'Porcentaje de personas que llegan a checkout y terminan comprando.',
  pending_contact: 'Pedidos nuevos aun sin contacto o confirmacion de operador.'
};



export const REPORT_MENU_ITEMS = (isAdminRole) => [
  { key: 'inicio', label: 'Inicio', hint: 'Resumen guiado' },
  { key: 'multi_local', label: 'Resumen locales', hint: 'Consolidado + detalle' },
  { key: 'benchmark_locales', label: 'Benchmark', hint: 'Comparativo locales' },
  { key: 'operacion_local', label: 'Operacion local', hint: 'Detalle por sede' },
  { key: 'ejecutivo', label: 'Ejecutivo', hint: 'Direccion semanal' },
  { key: 'operacion', label: 'Operacion diaria', hint: 'Prioridades turno' },
  { key: 'cancelaciones', label: 'Cancelaciones', hint: 'Causas y tendencia' },
  { key: 'alertas_locales', label: 'Alertas locales', hint: 'Umbrales y desvíos' },
  ...(isAdminRole ? [{ key: 'programacion', label: 'Programacion', hint: 'Envios y logs' }] : [])
];

export const REPORT_PRESETS_BY_ROLE = {
  admin: [
    { key: 'comite_semanal', label: 'Comite semanal', group_by: 'day', status: '', delivery_slot: '' },
    { key: 'turno_operativo', label: 'Turno operativo', group_by: 'delivery_slot', status: 'nuevo,confirmado', delivery_slot: '' },
    { key: 'cancelaciones', label: 'Solo cancelaciones', group_by: 'status', status: 'cancelado', delivery_slot: '' }
  ],
  operador: [
    { key: 'turno', label: 'Turno', group_by: 'delivery_slot', status: 'nuevo,confirmado', delivery_slot: '' },
    { key: 'franja_0900', label: 'Franja 09:00', group_by: 'status', status: 'nuevo,confirmado', delivery_slot: '09:00' },
    { key: 'franja_1400', label: 'Franja 14:00', group_by: 'status', status: 'nuevo,confirmado', delivery_slot: '14:00' }
  ]
};
