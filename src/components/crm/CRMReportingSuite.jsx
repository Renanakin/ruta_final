import React from 'react';
import clsx from 'clsx';
import { Download, FileText, AlertTriangle, ClipboardCheck, TrendingDown, FileSpreadsheet } from 'lucide-react';

const CRMReportingSuite = ({
  selectedLocalId,
  setSelectedLocalId,
  crmLocals,
  reportGroupBy,
  setReportGroupBy,
  reportGranularity,
  setReportGranularity,
  reportPrevPeriod,
  setReportPrevPeriod,
  reportStatusFilter,
  setReportStatusFilter,
  reportDeliverySlotFilter,
  setReportDeliverySlotFilter,
  isAdminRole,
  urgentMode,
  setUrgentMode,
  reportsLoading,
  fetchReportingSuite,
  reportPresets,
  applyReportPreset,
  reportMenuItems,
  activeReportMenu,
  setActiveReportMenu,
  executiveReport,
  dailyOpsReport,
  cancellationsReport,
  reportSemaphores,
  localsOverviewReport,
  localsBenchmarkReport,
  localOperationsReport,
  localsAlertsReport,
  consolidatedAlertsReport,
  fetchConsolidatedAlertsReport,
  alertUpdateDrafts,
  setAlertUpdateDrafts,
  updateConsolidatedAlert,
  thresholdDrafts,
  setThresholdDrafts,
  saveAlertThreshold,
  scheduleForm,
  setScheduleForm,
  createReportSchedule,
  reportSchedules,
  reportDeliveryLogs,
  runReportSchedule,
  toggleReportSchedule,
  crmUsers,
  crmLocalIds,
  kpiLabel,
  topCriticalLocals,
  startShift,
  exportExecutiveReportMarkdown,
  exportExecutiveReportPdf,
  exportLocalAlertsCsv,
  exportLocalAlertsPdf,
  fetchLocalsAlertsReport,
  alertThresholds,
  fetchAlertThresholds,
  alertsPdfExportLoading
}) => {
  return (
    <div className="mb-6 rounded-3xl border border-beige-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-black text-brand-700">Centro de reporteria guiada</p>
          <p className="text-xs text-stone-500">Navega por menu: cada vista explica que mirar primero y que accion tomar.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLocalId}
            onChange={(e) => setSelectedLocalId(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black"
          >
            <option value="">Todos mis locales</option>
            {crmLocals.map((local) => (
              <option key={local.id} value={String(local.id)}>{local.name}</option>
            ))}
          </select>
          <select value={reportGroupBy} onChange={(e) => setReportGroupBy(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black">
            <option value="day">Agrupar: día</option>
            <option value="status">Agrupar: estado</option>
            <option value="delivery_slot">Agrupar: franja</option>
            <option value="source">Agrupar: origen</option>
          </select>
          <select value={reportGranularity} onChange={(e) => setReportGranularity(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black">
            <option value="day">Granularidad: día</option>
            <option value="week">Granularidad: semana</option>
            <option value="month">Granularidad: mes</option>
          </select>
          <select value={reportPrevPeriod} onChange={(e) => setReportPrevPeriod(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black">
            <option value="1">Comparar: 1 periodo</option>
            <option value="2">Comparar: 2 periodos</option>
            <option value="3">Comparar: 3 periodos</option>
          </select>
          <select value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black">
            <option value="">Estado: todos</option>
            <option value="nuevo,confirmado">Estado: operativos</option>
            <option value="cancelado">Estado: cancelado</option>
            <option value="entregado">Estado: entregado</option>
          </select>
          <select value={reportDeliverySlotFilter} onChange={(e) => setReportDeliverySlotFilter(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs bg-white text-stone-700 font-black">
            <option value="">Franja: todas</option>
            <option value="09:00">Franja: 09:00</option>
            <option value="14:00">Franja: 14:00</option>
          </select>
          <span className={clsx('px-2 py-1 rounded-full text-[10px] font-black uppercase', isAdminRole ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-700')}>
            Rol {isAdminRole ? 'admin' : 'operador'}
          </span>
          <button onClick={() => setUrgentMode((prev) => !prev)} className={clsx('px-3 py-1.5 rounded-lg font-black text-xs', urgentMode ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
            {urgentMode ? 'Salir modo urgente' : 'Modo urgente'}
          </button>

          <button onClick={fetchReportingSuite} className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-black text-xs">
            {reportsLoading ? 'Actualizando...' : 'Actualizar reportes'}
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-black">
          Mostrando: {selectedLocalId ? `Local ${crmLocals.find((local) => String(local.id) === String(selectedLocalId))?.name || selectedLocalId}` : `${crmLocalIds.length} locales`}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-black">
          Scope: {selectedLocalId ? '1 local' : `${crmLocalIds.length} locales`}
        </span>
        {!!reportStatusFilter && <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-black">Estado: {reportStatusFilter}</span>}
        {!!reportDeliverySlotFilter && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black">Franja: {reportDeliverySlotFilter}</span>}
        <span className="px-2.5 py-1 rounded-full bg-beige-100 text-stone-700 text-[11px] font-black">Group by: {reportGroupBy}</span>
        <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-[11px] font-black">Granularidad: {reportGranularity}</span>
        <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-black">Prev: {reportPrevPeriod}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {reportPresets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => applyReportPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-black text-xs border border-brand-200"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {reportMenuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveReportMenu(item.key)}
            className={clsx(
              'px-3 py-2 rounded-xl text-xs font-black border transition-all',
              activeReportMenu === item.key ? 'bg-brand-700 text-white border-brand-700' : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            )}
          >
            {item.label}
            <span className={clsx('ml-2 text-[10px]', activeReportMenu === item.key ? 'text-brand-100' : 'text-stone-500')}>{item.hint}</span>
          </button>
        ))}
      </div>

      {urgentMode && (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-black text-red-700 uppercase">Modo urgente activo</p>
          <p className="text-[11px] text-stone-700 mt-1">Visual simplificada para tomar decisiones rapidas: riesgo, operacion y cancelaciones.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <div className="rounded-xl border border-red-200 bg-white px-2 py-2">
              <p className="text-[10px] uppercase font-black text-stone-500">Riesgo principal</p>
              <p className="text-xs font-black text-stone-900 mt-1">{executiveReport?.top_risks?.[0]?.title || 'Sin riesgo critico'}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-white px-2 py-2">
              <p className="text-[10px] uppercase font-black text-stone-500">Pedidos en riesgo</p>
              <p className="text-sm font-black text-stone-900">{Number(dailyOpsReport?.at_risk_orders?.length || 0)}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-white px-2 py-2">
              <p className="text-[10px] uppercase font-black text-stone-500">Tasa cancelacion</p>
              <p className="text-sm font-black text-red-700">{Number(cancellationsReport?.totals?.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={() => setActiveReportMenu('operacion')} className="px-3 py-1 rounded-lg bg-white border border-beige-200 text-xs font-black text-stone-700">Ir a Operacion</button>
            <button onClick={() => setActiveReportMenu('cancelaciones')} className="px-3 py-1 rounded-lg bg-white border border-beige-200 text-xs font-black text-stone-700">Ir a Cancelaciones</button>
            <button onClick={() => setActiveReportMenu('ejecutivo')} className="px-3 py-1 rounded-lg bg-white border border-beige-200 text-xs font-black text-stone-700">Ir a Ejecutivo</button>
          </div>
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'inicio') && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3">
            <p className="text-xs font-black text-stone-800">Que mirar ahora</p>
            <p className="text-[11px] text-stone-600 mt-1">1) Riesgos del ejecutivo, 2) pedidos en riesgo del turno, 3) principal causa de cancelacion.</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black text-red-700 uppercase">Top locales en rojo</p>
              <button onClick={() => setActiveReportMenu('alertas_locales')} className="px-2 py-1 rounded-lg bg-white border border-red-200 text-[11px] font-black text-red-700">Ver alertas locales</button>
            </div>
            {!topCriticalLocals?.length && <p className="text-[11px] text-green-700 font-semibold mt-1">Sin locales críticos activos.</p>}
            {!!topCriticalLocals?.length && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                {topCriticalLocals.map((local) => (
                  <div key={local.local_id} className="rounded-xl border border-red-200 bg-white px-2 py-2">
                    <p className="text-xs font-black text-stone-900">{local.local_name}</p>
                    <p className="text-[11px] text-red-700 font-semibold">Rojas: {local.red_count} · Ámbar: {local.amber_count}</p>
                    {!!local.first_alert && <p className="text-[11px] text-stone-600 mt-1">{local.first_alert}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-beige-200 bg-stone-50 p-3">
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Resumen ejecutivo</p>
              <p className="text-xs text-stone-600">Ventas: <span className="font-black text-stone-900">${Number(executiveReport?.kpis?.sales_weekly?.current || 0).toLocaleString('es-CL')}</span></p>
              <p className="text-xs text-stone-600">Pedidos: <span className="font-black text-stone-900">{Number(executiveReport?.kpis?.orders_total?.current || 0).toLocaleString('es-CL')}</span></p>
              <p className="text-xs text-stone-600">Checkout {'->'} compra: <span className="font-black text-stone-900">{Number(executiveReport?.funnel?.conversion?.checkout_to_purchase_pct || 0).toLocaleString('es-CL')}%</span></p>
            </div>
            <div className="rounded-2xl border border-beige-200 bg-stone-50 p-3">
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Resumen operacion diaria</p>
              <p className="text-xs text-stone-600">Pendientes 09:00: <span className="font-black text-stone-900">{Number(dailyOpsReport?.pending_by_slot?.find((slot) => slot.slot === '09:00')?.total || 0)}</span></p>
              <p className="text-xs text-stone-600">Pendientes 14:00: <span className="font-black text-stone-900">{Number(dailyOpsReport?.pending_by_slot?.find((slot) => slot.slot === '14:00')?.total || 0)}</span></p>
              <p className="text-xs text-stone-600">Pedidos en riesgo: <span className="font-black text-stone-900">{Number(dailyOpsReport?.at_risk_orders?.length || 0)}</span></p>
            </div>
            <div className="rounded-2xl border border-beige-200 bg-stone-50 p-3">
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Resumen cancelaciones</p>
              <p className="text-xs text-stone-600">Tasa: <span className="font-black text-red-700">{Number(cancellationsReport?.totals?.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</span></p>
              <p className="text-xs text-stone-600">Clasificadas: <span className="font-black text-stone-900">{Number(cancellationsReport?.totals?.classified_rate_pct || 0).toLocaleString('es-CL')}%</span></p>
              <p className="text-xs text-stone-600">Causa principal: <span className="font-black text-stone-900">{cancellationsReport?.by_reason?.[0]?.reason || 'sin datos'}</span></p>
            </div>
          </div>
          {!!reportSemaphores.length && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {reportSemaphores.slice(0, 4).map((item) => (
                <div key={item.code} className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">{item.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm font-black text-stone-900">{Number(item.value || 0).toLocaleString('es-CL')}{item.code.includes('pct') ? '%' : ''}</p>
                    <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-black uppercase', item.status === 'green' ? 'bg-green-100 text-green-700' : item.status === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'multi_local') && (
        <div className="space-y-3">
          {!localsOverviewReport && <p className="text-xs text-stone-500">Sin datos de resumen multi-local.</p>}
          {!!localsOverviewReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">Pedidos</p>
                  <p className="text-lg font-black text-stone-900">{Number(localsOverviewReport.summary?.total_orders || 0).toLocaleString('es-CL')}</p>
                </div>
                <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">Ingresos</p>
                  <p className="text-lg font-black text-stone-900">${Number(localsOverviewReport.summary?.revenue_total || 0).toLocaleString('es-CL')}</p>
                </div>
                <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">Pendientes</p>
                  <p className="text-lg font-black text-yolk-700">{Number(localsOverviewReport.summary?.pending_orders || 0).toLocaleString('es-CL')}</p>
                </div>
                <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">Cancelacion</p>
                  <p className="text-lg font-black text-red-700">{Number(localsOverviewReport.summary?.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Detalle por local</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {(localsOverviewReport.locals || []).map((local) => (
                    <div key={local.id} className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                      <p className="text-sm font-black text-stone-900">{local.name}</p>
                      <p className="text-xs text-stone-600">{local.code}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-semibold text-stone-700">
                        <p>Pedidos: <span className="font-black">{Number(local.total_orders || 0).toLocaleString('es-CL')}</span></p>
                        <p>Ingresos: <span className="font-black">${Number(local.revenue_total || 0).toLocaleString('es-CL')}</span></p>
                        <p>Pendientes: <span className="font-black">{Number(local.pending_orders || 0).toLocaleString('es-CL')}</span></p>
                        <p>Cancelacion: <span className="font-black text-red-700">{Number(local.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'benchmark_locales') && (
        <div className="space-y-3">
          {!localsBenchmarkReport && <p className="text-xs text-stone-500">Sin datos de benchmark.</p>}
          {!!localsBenchmarkReport && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Benchmark entre locales</p>
              <div className="space-y-2">
                {(localsBenchmarkReport.benchmark || []).map((row) => (
                  <div key={row.local_id} className="rounded-xl border border-beige-200 bg-white px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-stone-900">#{row.rank} {row.local_name}</p>
                      <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-black">Score {Number(row.benchmark_score || 0).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs font-semibold text-stone-700">
                      <p>Pedidos: <span className="font-black">{Number(row.total_orders || 0).toLocaleString('es-CL')}</span></p>
                      <p>Ingresos: <span className="font-black">${Number(row.revenue_total || 0).toLocaleString('es-CL')}</span></p>
                      <p>Delta ingresos: <span className={clsx('font-black', Number(row.revenue_delta_pct || 0) >= 0 ? 'text-green-700' : 'text-red-700')}>{Number(row.revenue_delta_pct || 0).toLocaleString('es-CL')}%</span></p>
                      <p>Cancelacion: <span className="font-black text-red-700">{Number(row.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'operacion_local') && (
        <div className="space-y-3">
          {!localOperationsReport && <p className="text-xs text-stone-500">Sin datos de operación por local.</p>}
          {!!localOperationsReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Operacion {localOperationsReport.local?.name || 'local'}</p>
                <p className="text-xs text-stone-600 mb-2">Fecha: {localOperationsReport.filters?.date}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(localOperationsReport.operations?.pending_by_slot || []).map((slot) => (
                    <div key={slot.slot} className="rounded-xl border border-beige-200 bg-white px-2 py-2">
                      <p className="text-[10px] uppercase font-black text-stone-500">{slot.slot}</p>
                      <p className="text-sm font-black text-stone-900">{Number(slot.total || 0).toLocaleString('es-CL')}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Pedidos en riesgo local</p>
                <div className="max-h-44 overflow-auto space-y-1">
                  {(localOperationsReport.operations?.at_risk_orders || []).slice(0, 12).map((order) => (
                    <div key={order.id} className="rounded-lg bg-white border border-beige-200 px-2 py-1.5 text-[11px] font-semibold text-stone-700">
                      #{order.id} {order.customer_name} · {order.delivery_schedule} · {order.risk_flags?.join(', ')}
                    </div>
                  ))}
                  {!localOperationsReport.operations?.at_risk_orders?.length && <p className="text-xs text-green-700 font-semibold">Sin pedidos en riesgo en este local.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'ejecutivo') && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={exportExecutiveReportMarkdown} className="px-3 py-1.5 rounded-lg bg-beige-100 text-stone-700 font-black text-xs inline-flex items-center gap-1"><Download size={12} /> Exportar .md</button>
            <button onClick={exportExecutiveReportPdf} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-black text-xs inline-flex items-center gap-1"><FileText size={12} /> Exportar .pdf</button>
          </div>
          {!executiveReport && <p className="text-xs text-stone-500">Sin datos de reporte ejecutivo.</p>}
          {!!executiveReport && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 lg:col-span-2">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">KPIs clave ({executiveReport.filters?.from_date} {'->'} {executiveReport.filters?.to_date})</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">{kpiLabel('Ventas', 'sales_weekly')}</p><p className="text-sm font-black text-stone-900">${Number(executiveReport.kpis?.sales_weekly?.current || 0).toLocaleString('es-CL')}</p></div>
                  <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">{kpiLabel('Pedidos', 'orders_total')}</p><p className="text-sm font-black text-stone-900">{Number(executiveReport.kpis?.orders_total?.current || 0).toLocaleString('es-CL')}</p></div>
                  <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">{kpiLabel('Ticket promedio', 'avg_ticket')}</p><p className="text-sm font-black text-stone-900">${Number(executiveReport.kpis?.avg_ticket?.current || 0).toLocaleString('es-CL')}</p></div>
                  <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">{kpiLabel('Cancelacion', 'cancellation_rate')}</p><p className="text-sm font-black text-red-700">{Number(executiveReport.kpis?.cancellations_rate?.current_pct || 0).toLocaleString('es-CL')}%</p></div>
                </div>
                <div className="rounded-xl bg-white border border-beige-200 px-2 py-2 text-xs text-stone-700 font-semibold mt-2">{kpiLabel("Checkout -> compra", 'checkout_purchase')}: {Number(executiveReport.funnel?.conversion?.checkout_to_purchase_pct || 0).toLocaleString('es-CL')}%</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Riesgos con accion</p>
                <div className="space-y-1">
                  {(executiveReport.top_risks || []).slice(0, 5).map((risk) => (
                    <div key={risk.code} className="rounded-lg bg-white border border-beige-200 px-2 py-2">
                      <p className="text-xs font-black text-stone-800 inline-flex items-center gap-1"><AlertTriangle size={12} /> {risk.title}</p>
                      <p className="text-[11px] text-stone-600 mt-1">{risk.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'operacion') && (
        <div className="space-y-3">
          <button onClick={startShift} className="px-3 py-1.5 rounded-lg bg-brand-700 text-white font-black text-xs inline-flex items-center gap-1"><ClipboardCheck size={12} /> Iniciar turno</button>
          {!dailyOpsReport && <p className="text-xs text-stone-500">Sin datos operativos del dia.</p>}
          {!!dailyOpsReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Pendientes por franja</p>
                <div className="grid grid-cols-2 gap-2">
                  {(dailyOpsReport.pending_by_slot || []).map((slot) => (
                    <div key={slot.slot} className="rounded-xl bg-white border border-beige-200 px-2 py-2">
                      <p className="text-[10px] uppercase font-black text-stone-500">{slot.slot}</p>
                      <p className="text-sm font-black text-stone-900">{slot.total}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white border border-beige-200 px-2 py-2 text-xs font-semibold text-stone-700 mt-2">{kpiLabel('Pendientes de contacto', 'pending_contact')}: {dailyOpsReport.pending_contact_confirmation || 0}</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Pedidos en riesgo (prioriza estos)</p>
                <div className="max-h-40 overflow-auto space-y-1">
                  {(dailyOpsReport.at_risk_orders || []).slice(0, 10).map((order) => (
                    <div key={order.id} className="rounded-lg bg-white border border-beige-200 px-2 py-1.5 text-[11px] font-semibold text-stone-700">#{order.id} {order.customer_name} · {order.delivery_schedule} · {order.risk_flags?.join(', ')}</div>
                  ))}
                  {!dailyOpsReport.at_risk_orders?.length && <p className="text-xs text-green-700 font-semibold">Sin pedidos en riesgo.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'cancelaciones') && (
        <div className="space-y-3">
          {!cancellationsReport && <p className="text-xs text-stone-500">Sin datos de cancelaciones.</p>}
          {!!cancellationsReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Salud de cancelaciones</p>
                <div className="rounded-xl bg-white border border-beige-200 px-2 py-2">
                  <p className="text-[10px] uppercase font-black text-stone-500">Tasa de cancelacion</p>
                  <p className="text-sm font-black text-red-700 inline-flex items-center gap-1"><TrendingDown size={12} /> {Number(cancellationsReport.totals?.cancellation_rate_pct || 0).toLocaleString('es-CL')}%</p>
                  <p className="text-[11px] text-stone-500">Clasificadas: {Number(cancellationsReport.totals?.classified_rate_pct || 0).toLocaleString('es-CL')}%</p>
                </div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Causas principales</p>
                <div className="space-y-1">
                  {(cancellationsReport.by_reason || []).slice(0, 8).map((item) => (
                    <div key={item.reason}>
                      <div className="flex justify-between text-[11px] font-semibold text-stone-700"><span>{item.reason}</span><span>{item.total}</span></div>
                      <div className="h-2 rounded-full bg-white border border-beige-200 overflow-hidden"><div className="h-full bg-red-400" style={{ width: `${Math.max(5, Math.min(100, (Number(item.total || 0) / Math.max(1, Number(cancellationsReport.totals?.total_cancelled || 0))) * 100))}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'alertas_locales') && (
        <div className="space-y-3">
          {!localsAlertsReport && <p className="text-xs text-stone-500">Sin datos de alertas por local.</p>}
          {!!localsAlertsReport && (
            <div className="space-y-3">
              {!!consolidatedAlertsReport && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase font-black text-brand-700">Consolidado activo multi-local</p>
                    <button onClick={fetchConsolidatedAlertsReport} className="px-2 py-1 rounded-lg bg-beige-100 text-stone-700 text-xs font-black">Refrescar consolidado</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2">
                    <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">Total</p><p className="text-sm font-black text-stone-900">{Number(consolidatedAlertsReport.summary?.total || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-red-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-red-700">Rojas activas</p><p className="text-sm font-black text-red-700">{Number(consolidatedAlertsReport.summary?.red_active || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-amber-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-amber-700">Ámbar activas</p><p className="text-sm font-black text-amber-700">{Number(consolidatedAlertsReport.summary?.amber_active || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-blue-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-blue-700">Reconocidas</p><p className="text-sm font-black text-blue-700">{Number(consolidatedAlertsReport.summary?.acknowledged || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-green-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-green-700">Resueltas</p><p className="text-sm font-black text-green-700">{Number(consolidatedAlertsReport.summary?.resolved || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-brand-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-brand-700">Asignadas</p><p className="text-sm font-black text-brand-700">{Number(consolidatedAlertsReport.summary?.assigned || 0).toLocaleString('es-CL')}</p></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2">
                    <div className="rounded-xl bg-white border border-blue-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-blue-700">MTTA (min)</p><p className="text-sm font-black text-blue-700">{Number(consolidatedAlertsReport.summary?.mtta_minutes || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-green-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-green-700">MTTR (min)</p><p className="text-sm font-black text-green-700">{Number(consolidatedAlertsReport.summary?.mttr_minutes || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-brand-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-brand-700">% resueltas</p><p className="text-sm font-black text-brand-700">{Number(consolidatedAlertsReport.summary?.resolved_rate_pct || 0).toLocaleString('es-CL')}%</p></div>
                    <div className="rounded-xl bg-white border border-red-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-red-700">Brechas SLA</p><p className="text-sm font-black text-red-700">{Number(consolidatedAlertsReport.summary?.sla_breaches || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">Aging {'<'} 60m</p><p className="text-sm font-black text-stone-900">{Number(consolidatedAlertsReport.aging?.lt_60m || 0).toLocaleString('es-CL')}</p></div>
                    <div className="rounded-xl bg-white border border-beige-200 px-2 py-2"><p className="text-[10px] uppercase font-black text-stone-500">Aging {'>'} 180m</p><p className="text-sm font-black text-stone-900">{Number(consolidatedAlertsReport.aging?.gt_180m || 0).toLocaleString('es-CL')}</p></div>
                  </div>
                  <div className="rounded-xl border border-beige-200 bg-white p-2 mb-2">
                    <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Resumen por local</p>
                    <div className="max-h-28 overflow-auto space-y-1">
                      {(consolidatedAlertsReport.by_local || []).slice(0, 12).map((row) => (
                        <div key={row.local_id} className="text-[11px] text-stone-700 font-semibold flex items-center justify-between gap-2 border-b border-beige-100 pb-1 last:border-b-0">
                          <span>{row.local_name}</span>
                          <span>Act: {row.active} · Ack: {row.acknowledged} · Res: {row.resolved} · SLA: {Number(row.avg_open_minutes || 0).toLocaleString('es-CL')} min</span>
                        </div>
                      ))}
                      {!consolidatedAlertsReport.by_local?.length && <p className="text-xs text-stone-500">Sin desglose por local.</p>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-beige-200 bg-white overflow-hidden">
                    <div className="max-h-64 overflow-auto divide-y divide-beige-200">
                      {!consolidatedAlertsReport.alerts?.length && <p className="p-3 text-xs text-stone-500">Sin alertas activas/reconocidas en el consolidado.</p>}
                      {(consolidatedAlertsReport.alerts || []).map((alert) => {
                        const draft = alertUpdateDrafts[alert.id] || { status: alert.status || 'active', owner_user_id: alert.owner_user_id ? String(alert.owner_user_id) : '' };
                        return (
                          <div key={alert.id} className="p-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                            <div className="md:col-span-3">
                              <p className="text-xs font-black text-stone-900">{alert.local_name} · {alert.code}</p>
                              <p className="text-[11px] text-stone-600">{alert.message}</p>
                              <p className="text-[10px] text-stone-500 mt-1">#{alert.id} · {alert.metric_date} · severidad {alert.severity}</p>
                            </div>
                            <select value={draft.status} onChange={(e) => setAlertUpdateDrafts((prev) => ({ ...prev, [alert.id]: { ...draft, status: e.target.value } }))} className="px-2 py-1 rounded border border-beige-200 text-xs" disabled={!isAdminRole}>
                              <option value="active">active</option>
                              <option value="acknowledged">acknowledged</option>
                              <option value="resolved">resolved</option>
                            </select>
                            <select value={draft.owner_user_id} onChange={(e) => setAlertUpdateDrafts((prev) => ({ ...prev, [alert.id]: { ...draft, owner_user_id: e.target.value } }))} className="px-2 py-1 rounded border border-beige-200 text-xs" disabled={!isAdminRole}>
                              <option value="">Sin owner</option>
                              {crmUsers.map((user) => (
                                <option key={user.id} value={String(user.id)}>{user.email}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-2">
                              {isAdminRole ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateConsolidatedAlert(alert.id);
                                    } catch {
                                      // error handling should be done in parent via prop if needed
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-brand-700 text-white text-xs font-black"
                                >
                                  Guardar
                                </button>
                              ) : (
                                <p className="text-[11px] text-stone-500">Solo admin edita</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase font-black text-brand-700">Alertas por local ({localsAlertsReport.date})</p>
                  <div className="flex items-center gap-1">
                    <button onClick={exportLocalAlertsCsv} className="px-2 py-1 rounded-lg bg-yolk-100 text-yolk-700 text-xs font-black inline-flex items-center gap-1"><FileSpreadsheet size={12} /> CSV</button>
                    <button onClick={exportLocalAlertsPdf} disabled={alertsPdfExportLoading} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-black inline-flex items-center gap-1 disabled:opacity-60"><FileText size={12} /> PDF</button>
                    <button onClick={fetchLocalsAlertsReport} className="px-2 py-1 rounded-lg bg-beige-100 text-stone-700 text-xs font-black">Refrescar</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {(localsAlertsReport.alerts || []).map((row) => (
                    <div key={row.local_id} className="rounded-xl border border-beige-200 bg-white p-2">
                      <p className="text-sm font-black text-stone-900">{row.local_name}</p>
                      <p className="text-[11px] text-stone-600">Cumplimiento {Number(row.kpis?.fulfillment_pct || 0).toLocaleString('es-CL')}% · Cancelación {Number(row.kpis?.cancellation_pct || 0).toLocaleString('es-CL')}% · Pendientes {Number(row.kpis?.pending_pct || 0).toLocaleString('es-CL')}%</p>
                      {!row.alerts?.length && <p className="text-[11px] text-green-700 font-semibold mt-1">Sin alertas activas para este local.</p>}
                      {!!row.alerts?.length && (
                        <div className="space-y-1 mt-1">
                          {row.alerts.map((alert) => (
                            <p key={`${row.local_id}-${alert.code}`} className={clsx('text-[11px] font-semibold px-2 py-1 rounded', alert.severity === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                              [{alert.severity.toUpperCase()}] {alert.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase font-black text-brand-700">Umbrales configurables</p>
                  <button onClick={fetchAlertThresholds} className="px-2 py-1 rounded-lg bg-beige-100 text-stone-700 text-xs font-black">Refrescar</button>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {!alertThresholds.length && <p className="text-xs text-stone-500">Sin umbrales configurados.</p>}
                  {alertThresholds.map((row) => {
                    const draft = thresholdDrafts[row.local_id] || {
                      min_fulfillment_pct: String(row.min_fulfillment_pct ?? 90),
                      max_cancellation_pct: String(row.max_cancellation_pct ?? 8),
                      max_pending_pct: String(row.max_pending_pct ?? 15)
                    };
                    return (
                      <div key={row.local_id} className="rounded-xl border border-beige-200 bg-white p-2">
                        <p className="text-sm font-black text-stone-900">{row.local_name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <input value={draft.min_fulfillment_pct} onChange={(e) => setThresholdDrafts((prev) => ({ ...prev, [row.local_id]: { ...draft, min_fulfillment_pct: e.target.value } }))} className="px-2 py-1 rounded border border-beige-200 text-xs" placeholder="Min cumplimiento %" disabled={!isAdminRole} />
                          <input value={draft.max_cancellation_pct} onChange={(e) => setThresholdDrafts((prev) => ({ ...prev, [row.local_id]: { ...draft, max_cancellation_pct: e.target.value } }))} className="px-2 py-1 rounded border border-beige-200 text-xs" placeholder="Max cancelación %" disabled={!isAdminRole} />
                          <input value={draft.max_pending_pct} onChange={(e) => setThresholdDrafts((prev) => ({ ...prev, [row.local_id]: { ...draft, max_pending_pct: e.target.value } }))} className="px-2 py-1 rounded border border-beige-200 text-xs" placeholder="Max pendientes %" disabled={!isAdminRole} />
                        </div>
                        {isAdminRole ? (
                          <button
                            onClick={async () => {
                              try {
                                await saveAlertThreshold(row.local_id);
                              } catch {
                                // handled in parent
                              }
                            }}
                            className="mt-2 px-3 py-1 rounded-lg bg-brand-700 text-white text-xs font-black"
                          >
                            Guardar
                          </button>
                        ) : (
                          <p className="text-[11px] text-stone-500 mt-2">Solo admin puede editar umbrales.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {(!urgentMode && activeReportMenu === 'programacion' && isAdminRole) && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-2">
          <p className="text-[11px] uppercase font-black text-brand-700">Programacion y distribucion de reportes</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select value={scheduleForm.report_type} onChange={(e) => setScheduleForm((prev) => ({ ...prev, report_type: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs">
              <option value="executive_weekly">Ejecutivo semanal</option>
              <option value="daily_operations">Operacion diaria</option>
              <option value="cancellations">Cancelaciones</option>
            </select>
            <select value={scheduleForm.frequency} onChange={(e) => setScheduleForm((prev) => ({ ...prev, frequency: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
            </select>
            <select value={scheduleForm.channel} onChange={(e) => setScheduleForm((prev) => ({ ...prev, channel: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs">
              <option value="log">Log interno</option>
              <option value="email">Email</option>
              <option value="drive">Drive</option>
              <option value="slack">Slack webhook</option>
            </select>
            <button onClick={createReportSchedule} className="px-3 py-1.5 rounded-lg bg-brand-700 text-white font-black text-xs">Crear programacion</button>
          </div>
          <input value={scheduleForm.destination} onChange={(e) => setScheduleForm((prev) => ({ ...prev, destination: e.target.value }))} placeholder="Destino (email, carpeta o webhook)" className="w-full px-3 py-2 rounded-lg border border-beige-200 text-xs" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="rounded-xl border border-beige-200 bg-white p-2 max-h-40 overflow-auto">
              <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Programaciones</p>
              {!reportSchedules.length && <p className="text-xs text-stone-500">Sin programaciones.</p>}
              {reportSchedules.map((schedule) => (
                <div key={schedule.id} className="border-t border-beige-200 py-1.5 text-[11px] text-stone-700 first:border-t-0">
                  <p className="font-black">#{schedule.id} · {schedule.report_type} · {schedule.frequency}</p>
                  <p>{schedule.channel} · proxima: {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString('es-CL') : '-'}</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => runReportSchedule(schedule.id)} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-black">Ejecutar</button>
                    <button onClick={() => toggleReportSchedule(schedule.id, Boolean(schedule.is_active))} className={clsx('px-2 py-0.5 rounded font-black', schedule.is_active ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>{schedule.is_active ? 'Pausar' : 'Activar'}</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-beige-200 bg-white p-2 max-h-40 overflow-auto">
              <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Logs distribucion</p>
              {!reportDeliveryLogs.length && <p className="text-xs text-stone-500">Sin logs.</p>}
              {reportDeliveryLogs.map((log) => (
                <div key={log.id} className="border-t border-beige-200 py-1.5 text-[11px] text-stone-700 first:border-t-0">
                  <p className="font-black">#{log.id} · {log.report_type} · {log.channel}</p>
                  <p>{new Date(log.created_at).toLocaleString('es-CL')} · <span className={clsx(log.status === 'failed' ? 'text-red-700' : log.status === 'sent' ? 'text-green-700' : 'text-amber-700')}>{log.status}</span></p>
                  <p className="text-stone-500">trace: {log.trace_id || 'n/a'} · scope: {(log.scope_local_ids || []).join(', ') || 'n/a'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMReportingSuite;
