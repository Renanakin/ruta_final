import React from 'react';
import { KeyRound, UserPlus, Users } from 'lucide-react';
import clsx from 'clsx';
import CRMGeoMap from './CRMGeoMap';

const CRMAdminPanel = ({
  crmUsers,
  newCrmUserEmail,
  setNewCrmUserEmail,
  newCrmUserPassword,
  setNewCrmUserPassword,
  newCrmUserRole,
  setNewCrmUserRole,
  createCrmUser,
  authLoading,
  updateCrmUser,
  resetPasswords,
  setResetPasswords,
  auditLogs,
  auditStats,
  crmAlerts,
  funnelStats,
  exportAuditCsv,
  exportAuditPdf,
  fetchAuditLogs,
  fetchAuditStats,
  fetchCrmAlerts,
  salesAssistantPilotConfig,
  setSalesAssistantPilotConfig,
  saveSalesAssistantPilotConfig,
  salesAssistantPilotSaving,
  fetchFunnelStats,
  fetchAnalyticsDashboard,
  exportAnalyticsCsv,
  exportAnalyticsPdf,
  pdfExportLoading,
  auditActionFilter,
  setAuditActionFilter,
  auditEntityFilter,
  setAuditEntityFilter,
  auditLocalFilter,
  setAuditLocalFilter,
  auditFromDate,
  setAuditFromDate,
  auditToDate,
  setAuditToDate,
  crmLocals,
  analyticsSummary,
  analyticsGeo,
  analyticsPages,
  analyticsProducts,
  analyticsHeatmap,
  analyticsLoading,
  salesAssistantSummary,
  salesAssistantTraces,
  analyticsDraftFilters,
  setAnalyticsDraftFilters,
  analyticsAppliedFilters,
  analyticsFilterOptions,
  analyticsActiveFiltersCount,
  analyticsPresetName,
  setAnalyticsPresetName,
  analyticsPresets,
  applyAnalyticsFilters,
  resetAnalyticsFilters,
  saveAnalyticsPreset,
  applyAnalyticsPreset,
  deleteAnalyticsPreset,
}) => {
  const geoPoints = analyticsHeatmap?.geographic || [];
  const pageHeat = analyticsHeatmap?.pages || [];
  const pilotWarnings = [];
  const pilotReadiness = [];

  if (salesAssistantPilotConfig?.enabled && !salesAssistantPilotConfig?.allowlist_enabled && Number(salesAssistantPilotConfig?.rollout_percentage || 0) === 0) {
    pilotWarnings.push('El piloto esta activo pero con rollout 0% y sin allowlist; nadie entrara salvo QA force.');
  }

  if (salesAssistantPilotConfig?.enabled && salesAssistantPilotConfig?.page_scope === 'all' && Number(salesAssistantPilotConfig?.rollout_percentage || 0) > 25) {
    pilotWarnings.push('Scope completo con rollout alto: conviene subir por etapas antes de abrir todo el sitio.');
  }

  if ((salesAssistantSummary?.fallback_rate_pct || 0) > 15) {
    pilotWarnings.push('La tasa de fallback esta sobre 15%; no es una señal ideal para ampliar rollout.');
  }

  if ((salesAssistantSummary?.avg_latency_ms || 0) > 1500) {
    pilotWarnings.push('La latencia promedio supera 1500 ms; monitorea antes de abrir mas trafico.');
  }

  if ((salesAssistantSummary?.fallback_rate_pct || 0) <= 10) {
    pilotReadiness.push('Fallback controlado');
  }

  if ((salesAssistantSummary?.handoff_rate_pct || 0) <= 45) {
    pilotReadiness.push('Handoff dentro de rango inicial');
  }

  if ((salesAssistantSummary?.avg_latency_ms || 0) > 0 && (salesAssistantSummary?.avg_latency_ms || 0) <= 1200) {
    pilotReadiness.push('Latencia saludable');
  }

  const applyPilotPreset = (preset) => {
    setSalesAssistantPilotConfig?.((current) => ({
      ...(current || {}),
      ...preset,
    }));
  };

  return (
    <div className="mb-6 rounded-3xl border border-brand-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-brand-700 font-black">
        <Users size={16} /> Gestion de usuarios CRM
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input value={newCrmUserEmail} onChange={(e) => setNewCrmUserEmail(e.target.value)} placeholder="Email nuevo usuario" className="px-3 py-2 rounded-xl border border-beige-200" />
        <input type="password" value={newCrmUserPassword} onChange={(e) => setNewCrmUserPassword(e.target.value)} placeholder="Contrasena inicial" className="px-3 py-2 rounded-xl border border-beige-200" />
        <select value={newCrmUserRole} onChange={(e) => setNewCrmUserRole(e.target.value)} className="px-3 py-2 rounded-xl border border-beige-200">
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={createCrmUser} disabled={authLoading} className="py-2 rounded-xl bg-brand-700 text-white font-black text-sm inline-flex items-center justify-center gap-1 disabled:opacity-60">
          <UserPlus size={14} /> Crear usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500">
              <th className="py-2">Email</th>
              <th className="py-2">Rol</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Nueva contrasena</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(crmUsers || []).map((user) => (
              <tr key={user.id} className="border-t border-beige-200">
                <td className="py-2 font-semibold text-stone-700">{user.email}</td>
                <td className="py-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateCrmUser(user.id, { role: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-beige-200"
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-2">
                  <button
                    onClick={() => updateCrmUser(user.id, { is_active: !user.is_active })}
                    className={clsx('px-2 py-1 rounded-lg text-xs font-black', user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="py-2">
                  <input
                    type="password"
                    value={resetPasswords[user.id] || ''}
                    onChange={(e) => setResetPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))}
                    placeholder="Nueva contrasena"
                    className="px-2 py-1 rounded-lg border border-beige-200"
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => {
                      const pass = resetPasswords[user.id];
                      if (!pass) return;
                      updateCrmUser(user.id, { password: pass });
                      setResetPasswords((prev) => ({ ...prev, [user.id]: '' }));
                    }}
                    className="px-2 py-1 rounded-lg bg-yolk-100 text-yolk-700 font-black text-xs inline-flex items-center gap-1"
                  >
                    <KeyRound size={12} /> Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-brand-700">Sales Assistant: Piloto Controlado</p>
          <button
            onClick={saveSalesAssistantPilotConfig}
            disabled={!salesAssistantPilotConfig || salesAssistantPilotSaving}
            className="px-3 py-1.5 rounded-lg bg-brand-700 text-white font-black text-xs disabled:opacity-60"
          >
            {salesAssistantPilotSaving ? 'Guardando...' : 'Guardar piloto'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-beige-200 bg-white p-3 space-y-3">
            <div>
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPilotPreset({
                    enabled: false,
                    rollout_percentage: 0,
                    allowlist_enabled: false,
                    allowlist_tokens: [],
                    qa_force_enabled: true,
                    page_scope: 'product_only',
                    notes: 'Kill switch activado',
                  })}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-black text-[11px]"
                >
                  Off
                </button>
                <button
                  onClick={() => applyPilotPreset({
                    enabled: true,
                    rollout_percentage: 0,
                    allowlist_enabled: false,
                    allowlist_tokens: [],
                    qa_force_enabled: true,
                    page_scope: 'product_only',
                    notes: 'Solo QA force',
                  })}
                  className="px-3 py-1.5 rounded-lg bg-yolk-100 text-yolk-800 font-black text-[11px]"
                >
                  QA only
                </button>
                <button
                  onClick={() => applyPilotPreset({
                    enabled: true,
                    rollout_percentage: 10,
                    allowlist_enabled: false,
                    allowlist_tokens: [],
                    qa_force_enabled: true,
                    page_scope: 'product_only',
                    notes: 'Piloto 10% en fichas de producto',
                  })}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-black text-[11px]"
                >
                  10% producto
                </button>
                <button
                  onClick={() => applyPilotPreset({
                    enabled: true,
                    rollout_percentage: 25,
                    allowlist_enabled: false,
                    allowlist_tokens: [],
                    qa_force_enabled: true,
                    page_scope: 'product_only',
                    notes: 'Piloto 25% en fichas de producto',
                  })}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-black text-[11px]"
                >
                  25% producto
                </button>
                <button
                  onClick={() => applyPilotPreset({
                    enabled: true,
                    rollout_percentage: 100,
                    allowlist_enabled: false,
                    allowlist_tokens: [],
                    qa_force_enabled: false,
                    page_scope: 'all',
                    notes: 'Apertura completa',
                  })}
                  className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800 font-black text-[11px]"
                >
                  100% full
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                Piloto activo
                <select
                  value={salesAssistantPilotConfig?.enabled ? 'on' : 'off'}
                  onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                    ...(current || {}),
                    enabled: e.target.value === 'on',
                  }))}
                  className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-1 text-xs font-semibold"
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </label>

              <label className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                Rollout %
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={salesAssistantPilotConfig?.rollout_percentage ?? 0}
                  onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                    ...(current || {}),
                    rollout_percentage: Number(e.target.value || 0),
                  }))}
                  className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-1 text-xs font-semibold"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                Scope
                <select
                  value={salesAssistantPilotConfig?.page_scope || 'product_only'}
                  onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                    ...(current || {}),
                    page_scope: e.target.value,
                  }))}
                  className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-1 text-xs font-semibold"
                >
                  <option value="product_only">Solo producto</option>
                  <option value="all">Todo el sitio</option>
                </select>
              </label>

              <label className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                QA force
                <select
                  value={salesAssistantPilotConfig?.qa_force_enabled ? 'on' : 'off'}
                  onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                    ...(current || {}),
                    qa_force_enabled: e.target.value === 'on',
                  }))}
                  className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-1 text-xs font-semibold"
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                Allowlist
                <select
                  value={salesAssistantPilotConfig?.allowlist_enabled ? 'on' : 'off'}
                  onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                    ...(current || {}),
                    allowlist_enabled: e.target.value === 'on',
                  }))}
                  className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-1 text-xs font-semibold"
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </label>

              <div className="rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
                Ultima actualizacion
                <p className="mt-2 text-xs font-semibold text-stone-600">
                  {salesAssistantPilotConfig?.updated_at ? new Date(salesAssistantPilotConfig.updated_at).toLocaleString('es-CL') : 'Sin cambios'}
                </p>
                <p className="text-[10px] text-stone-500">{salesAssistantPilotConfig?.updated_by || 'system'}</p>
              </div>
            </div>

            <label className="block rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
              Tokens allowlist
              <textarea
                value={(salesAssistantPilotConfig?.allowlist_tokens || []).join(', ')}
                onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                  ...(current || {}),
                  allowlist_tokens: e.target.value
                    .split(',')
                    .map((token) => token.trim())
                    .filter(Boolean),
                }))}
                rows={3}
                placeholder="qa-equipo, piloto-comercial, token-demo"
                className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-2 text-xs font-semibold"
              />
            </label>

            <label className="block rounded-xl border border-beige-200 bg-stone-50 px-3 py-2 text-xs font-black text-stone-700">
              Notas operativas
              <textarea
                value={salesAssistantPilotConfig?.notes || ''}
                onChange={(e) => setSalesAssistantPilotConfig?.((current) => ({
                  ...(current || {}),
                  notes: e.target.value,
                }))}
                rows={3}
                placeholder="Ej: piloto 10% en fichas de producto desde el martes"
                className="mt-1 w-full rounded-lg border border-beige-200 bg-white px-2 py-2 text-xs font-semibold"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-beige-200 bg-white p-3 space-y-2">
            <p className="text-[11px] uppercase font-black text-brand-700">Reglas de activacion</p>
            <p className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
              `enabled=off` corta el piloto completo sin redeploy.
            </p>
            <p className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
              `rollout %` usa cohorte deterministica por sesion.
            </p>
            <p className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
              `page_scope=product_only` limita el piloto a fichas de producto.
            </p>
            <p className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
              `qa force` habilita preview con `?salesAssistantPilot=force`.
            </p>
            <p className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
              `allowlist` habilita acceso con `?salesAssistantPilotToken=...`.
            </p>

            <div className="pt-2 border-t border-beige-100">
              <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Lectura de readiness</p>
              {!!pilotReadiness.length && (
                <div className="space-y-1 mb-2">
                  {pilotReadiness.map((item) => (
                    <p key={item} className="rounded-lg bg-green-50 px-2 py-1.5 text-xs font-semibold text-green-800">
                      {item}
                    </p>
                  ))}
                </div>
              )}
              {!!pilotWarnings.length && (
                <div className="space-y-1">
                  {pilotWarnings.map((item) => (
                    <p key={item} className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700">
                      {item}
                    </p>
                  ))}
                </div>
              )}
              {!pilotWarnings.length && !pilotReadiness.length && (
                <p className="text-xs text-stone-400">Todavia no hay suficientes senales para una lectura operativa.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-brand-700">Auditoria CRM</p>
          <div className="flex items-center gap-2">
            <button onClick={exportAuditCsv} className="px-3 py-1.5 rounded-lg bg-yolk-100 text-yolk-700 font-black text-xs">CSV</button>
            <button onClick={exportAuditPdf} disabled={pdfExportLoading} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-black text-xs disabled:opacity-60">PDF</button>
            <button
              onClick={() => {
                fetchAuditLogs();
                fetchAuditStats();
                fetchCrmAlerts();
              }}
              className="px-3 py-1.5 rounded-lg bg-beige-100 text-stone-700 font-black text-xs"
            >
              Refrescar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs font-black">
            <option value="">Accion: todas</option>
            {(auditStats.by_action || []).map((action) => (
              <option key={action.action} value={action.action}>{action.action} ({action.total})</option>
            ))}
          </select>
          <select value={auditEntityFilter} onChange={(e) => setAuditEntityFilter(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs font-black">
            <option value="">Entidad: todas</option>
            {(auditStats.by_entity || []).map((entity) => (
              <option key={entity.entity_type} value={entity.entity_type}>{entity.entity_type} ({entity.count})</option>
            ))}
          </select>
          <select value={auditLocalFilter} onChange={(e) => setAuditLocalFilter(e.target.value)} className="px-2 py-1.5 rounded-lg border border-beige-200 text-xs font-black">
            <option value="">Local: todos</option>
            {crmLocals.map((local) => <option key={local.id} value={String(local.id)}>{local.name}</option>)}
          </select>
          <div className="flex gap-1">
            <input type="date" value={auditFromDate} onChange={(e) => setAuditFromDate(e.target.value)} className="w-1/2 px-1 py-1 rounded border border-beige-200 text-[10px]" />
            <input type="date" value={auditToDate} onChange={(e) => setAuditToDate(e.target.value)} className="w-1/2 px-1 py-1 rounded border border-beige-200 text-[10px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Eventos Totales</p>
            <p className="text-xl font-black text-brand-800">{auditStats.total_events || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2 md:col-span-3">
            <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Alertas automaticas</p>
            {!(crmAlerts || []).length && <p className="text-sm text-green-700 font-semibold">Sin alertas criticas activas.</p>}
            {!!(crmAlerts || []).length && (
              <div className="space-y-1">
                {crmAlerts.map((alert, index) => (
                  <p key={`${alert.code || alert.id || index}`} className={clsx('text-xs font-semibold px-2 py-1 rounded-lg', alert.level === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                    [{(alert.level || alert.severity || 'info').toUpperCase()}] {alert.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-beige-200 bg-white overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-beige-200">
              <tr>
                <th className="px-3 py-2 font-black text-stone-600">Fecha</th>
                <th className="px-3 py-2 font-black text-stone-600">Evento</th>
                <th className="px-3 py-2 font-black text-stone-600">Sesion</th>
                <th className="px-3 py-2 font-black text-stone-600">Canal</th>
                <th className="px-3 py-2 font-black text-stone-600">Dispositivo</th>
                <th className="px-3 py-2 font-black text-stone-600">Geo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {(auditLogs || []).map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="px-3 py-1.5 whitespace-nowrap">{new Date(log.created_at).toLocaleString('es-CL')}</td>
                  <td className="px-3 py-1.5 font-bold uppercase text-[10px]">{log.event_name || log.action || '-'}</td>
                  <td className="px-3 py-1.5 font-mono text-[10px]">{log.session_id || '-'}</td>
                  <td className="px-3 py-1.5">{log.source || log.entity_type || '-'}</td>
                  <td className="px-3 py-1.5">{log.device_type || '-'}</td>
                  <td className="px-3 py-1.5">{log.city || log.country_code || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-2 border-t border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-brand-700">Sales Assistant: Observabilidad Conversacional</p>
          <button onClick={fetchAnalyticsDashboard} className="px-3 py-1.5 rounded-lg bg-beige-100 text-stone-700 font-black text-xs">
            {analyticsLoading ? 'Actualizando...' : 'Refrescar trazas'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Turnos</p>
            <p className="text-lg font-black text-stone-900">{salesAssistantSummary?.total_turns || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Conversaciones</p>
            <p className="text-lg font-black text-stone-900">{salesAssistantSummary?.unique_conversations || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Fallback</p>
            <p className="text-lg font-black text-red-700">{salesAssistantSummary?.fallback_rate_pct || 0}%</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Handoff</p>
            <p className="text-lg font-black text-brand-700">{salesAssistantSummary?.handoff_rate_pct || 0}%</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Clicks handoff</p>
            <p className="text-lg font-black text-yolk-700">{salesAssistantSummary?.handoff_clicks || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Latencia promedio</p>
            <p className="text-lg font-black text-stone-900">{salesAssistantSummary?.avg_latency_ms || 0} ms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mb-3">
          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Resolucion</p>
            <div className="space-y-1">
              {(salesAssistantSummary?.resolved_by || []).map((row) => (
                <div key={row.resolved_by} className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                  <span>{row.resolved_by}</span>
                  <span className="font-black">{row.total}</span>
                </div>
              ))}
              {!(salesAssistantSummary?.resolved_by || []).length && <p className="text-xs text-stone-400">Sin eventos todavia.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Top intents</p>
            <div className="space-y-1">
              {(salesAssistantSummary?.top_intents || []).map((row) => (
                <div key={row.intent} className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                  <span>{row.intent}</span>
                  <span className="font-black">{row.total}</span>
                </div>
              ))}
              {!(salesAssistantSummary?.top_intents || []).length && <p className="text-xs text-stone-400">Sin intents registrados.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Origen del turno</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                <span>Quick reply</span>
                <span className="font-black">{salesAssistantSummary?.quick_reply_turns || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                <span>Texto libre</span>
                <span className="font-black">{salesAssistantSummary?.free_text_turns || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-beige-200 bg-white overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-beige-200">
              <tr>
                <th className="px-3 py-2 font-black text-stone-600">Fecha</th>
                <th className="px-3 py-2 font-black text-stone-600">Evento</th>
                <th className="px-3 py-2 font-black text-stone-600">Conversacion</th>
                <th className="px-3 py-2 font-black text-stone-600">Intent</th>
                <th className="px-3 py-2 font-black text-stone-600">Resolucion</th>
                <th className="px-3 py-2 font-black text-stone-600">Fuente</th>
                <th className="px-3 py-2 font-black text-stone-600">Paso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {(salesAssistantTraces || []).slice(0, 10).map((trace) => (
                <tr key={`${trace.id}_${trace.event_name}`} className="hover:bg-stone-50">
                  <td className="px-3 py-1.5 whitespace-nowrap">{new Date(trace.created_at).toLocaleString('es-CL')}</td>
                  <td className="px-3 py-1.5 font-bold uppercase text-[10px]">{trace.event_name}</td>
                  <td className="px-3 py-1.5 font-mono text-[10px]">{trace.conversation_id || trace.session_id || '-'}</td>
                  <td className="px-3 py-1.5">{trace.detected_intent || trace.quick_reply_intent || '-'}</td>
                  <td className="px-3 py-1.5">{trace.resolved_by || (trace.fallback ? 'fallback' : '-')}</td>
                  <td className="px-3 py-1.5">{trace.message_source || '-'}</td>
                  <td className="px-3 py-1.5">{trace.next_step || (trace.handoff ? 'handoff' : '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(salesAssistantTraces || []).length && (
            <div className="px-3 py-4 text-xs text-stone-400">Sin trazas conversacionales todavia.</div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-brand-700">Funnel de Conversion</p>
          <button onClick={fetchFunnelStats} className="px-3 py-1.5 rounded-lg bg-beige-100 text-stone-700 font-black text-xs">Refrescar funnel</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Vistas Producto</p>
            <p className="text-lg font-black text-stone-900">{funnelStats.stages?.view_product || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Add to Cart</p>
            <p className="text-lg font-black text-stone-900">{funnelStats.stages?.add_to_cart || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Begin Checkout</p>
            <p className="text-lg font-black text-stone-900">{funnelStats.stages?.begin_checkout || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Compras</p>
            <p className="text-lg font-black text-brand-700">{funnelStats.stages?.purchase || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Conversion Rates</p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-black text-stone-700 mb-1"><span>View {'->'} Cart</span><span>{funnelStats.conversion?.view_to_cart_pct || 0}%</span></div>
                <div className="h-2 rounded-full bg-white border border-beige-200 overflow-hidden"><div className="h-full bg-brand-400" style={{ width: `${funnelStats.conversion?.view_to_cart_pct || 0}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black text-stone-700 mb-1"><span>Cart {'->'} Checkout</span><span>{funnelStats.conversion?.cart_to_checkout_pct || 0}%</span></div>
                <div className="h-2 rounded-full bg-white border border-beige-200 overflow-hidden"><div className="h-full bg-yolk-400" style={{ width: `${funnelStats.conversion?.cart_to_checkout_pct || 0}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black text-stone-700 mb-1"><span>Checkout {'->'} Purchase</span><span>{funnelStats.conversion?.checkout_to_purchase_pct || 0}%</span></div>
                <div className="h-2 rounded-full bg-white border border-beige-200 overflow-hidden"><div className="h-full bg-green-400" style={{ width: `${funnelStats.conversion?.checkout_to_purchase_pct || 0}%` }}></div></div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-beige-200 bg-stone-50 p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Ventas por origen (%)</p>
            <div className="space-y-2">
              {(funnelStats.by_source || []).map((source) => (
                <div key={source.source}>
                  <div className="flex justify-between text-[11px] font-black text-stone-700"><span>{source.source}</span><span>{source.count} orders ({source.pct}%)</span></div>
                  <div className="h-1.5 rounded-full bg-white border border-beige-100 overflow-hidden"><div className="h-full bg-stone-400" style={{ width: `${source.pct}%` }}></div></div>
                </div>
              ))}
              {!(funnelStats.by_source || []).length && <p className="text-xs text-stone-400">Sin desglose por origen todavia.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-brand-700">Analitica Geografica y Navegacion</p>
          <div className="flex items-center gap-2">
            {!!analyticsActiveFiltersCount && (
              <span className="px-2 py-1 rounded-full bg-yolk-100 text-yolk-800 text-[10px] font-black">
                {analyticsActiveFiltersCount} filtros activos
              </span>
            )}
            <button onClick={exportAnalyticsCsv} className="px-3 py-1.5 rounded-lg bg-yolk-100 text-yolk-700 font-black text-xs">
              CSV
            </button>
            <button onClick={exportAnalyticsPdf} disabled={pdfExportLoading} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-black text-xs disabled:opacity-60">
              PDF
            </button>
            <button onClick={fetchAnalyticsDashboard} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-black text-xs">
              {analyticsLoading ? 'Actualizando...' : 'Refrescar analytics'}
            </button>
          </div>
        </div>

        <div className="mb-3 rounded-2xl border border-beige-200 bg-stone-50 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            <select
              value={analyticsDraftFilters.event_name}
              onChange={(e) => setAnalyticsDraftFilters((prev) => ({ ...prev, event_name: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-beige-200 bg-white text-xs font-black text-stone-700"
            >
              {analyticsFilterOptions.map((option) => (
                <option key={option.value || 'all-events'} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input
              value={analyticsDraftFilters.product_id}
              onChange={(e) => setAnalyticsDraftFilters((prev) => ({ ...prev, product_id: e.target.value }))}
              placeholder="Producto ID"
              inputMode="numeric"
              className="px-3 py-2 rounded-xl border border-beige-200 bg-white text-xs font-black text-stone-700"
            />
            <input
              value={analyticsDraftFilters.source}
              onChange={(e) => setAnalyticsDraftFilters((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="Canal / source"
              className="px-3 py-2 rounded-xl border border-beige-200 bg-white text-xs font-black text-stone-700"
            />
            <input
              value={analyticsDraftFilters.page_path}
              onChange={(e) => setAnalyticsDraftFilters((prev) => ({ ...prev, page_path: e.target.value }))}
              placeholder="Page path exacto"
              className="px-3 py-2 rounded-xl border border-beige-200 bg-white text-xs font-black text-stone-700"
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={applyAnalyticsFilters}
              className="px-3 py-1.5 rounded-lg bg-brand-700 text-white font-black text-xs"
            >
              Aplicar filtros
            </button>
            <button
              onClick={resetAnalyticsFilters}
              className="px-3 py-1.5 rounded-lg bg-white border border-beige-200 text-stone-700 font-black text-xs"
            >
              Limpiar
            </button>
            <input
              value={analyticsPresetName}
              onChange={(e) => setAnalyticsPresetName(e.target.value)}
              placeholder="Nombre del preset"
              className="px-3 py-1.5 rounded-lg border border-beige-200 bg-white text-xs font-black text-stone-700"
            />
            <button
              onClick={saveAnalyticsPreset}
              className="px-3 py-1.5 rounded-lg bg-yolk-100 text-yolk-800 font-black text-xs"
            >
              Guardar preset
            </button>
            {(analyticsAppliedFilters.event_name || analyticsAppliedFilters.product_id || analyticsAppliedFilters.source || analyticsAppliedFilters.page_path) && (
              <p className="text-[11px] font-semibold text-stone-500">
                Activos:
                {analyticsAppliedFilters.event_name ? ` evento=${analyticsAppliedFilters.event_name}` : ''}
                {analyticsAppliedFilters.product_id ? ` producto=${analyticsAppliedFilters.product_id}` : ''}
                {analyticsAppliedFilters.source ? ` canal=${analyticsAppliedFilters.source}` : ''}
                {analyticsAppliedFilters.page_path ? ` pagina=${analyticsAppliedFilters.page_path}` : ''}
              </p>
            )}
          </div>
          {!!analyticsPresets.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {analyticsPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1 rounded-full border border-beige-200 bg-white pl-3 pr-1 py-1">
                  <button
                    onClick={() => applyAnalyticsPreset(preset)}
                    className="text-[10px] font-black text-stone-700"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deleteAnalyticsPreset(preset.id)}
                    className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-700"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Eventos</p>
            <p className="text-lg font-black text-stone-900">{analyticsSummary?.total_events || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Sesiones</p>
            <p className="text-lg font-black text-stone-900">{analyticsSummary?.unique_sessions || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Usuarios</p>
            <p className="text-lg font-black text-stone-900">{analyticsSummary?.known_users || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Cuentas creadas</p>
            <p className="text-lg font-black text-brand-700">{analyticsSummary?.accounts_created || 0}</p>
          </div>
          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <p className="text-[10px] uppercase font-black text-stone-500">Interacciones IA</p>
            <p className="text-lg font-black text-yolk-700">{analyticsSummary?.ai_interactions || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Top paises y ciudades</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Paises</p>
                <div className="space-y-1">
                  {(analyticsGeo?.countries || []).slice(0, 5).map((country) => (
                    <div key={`${country.country_code}-${country.country_name}`} className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                      <span>{country.country_name || country.country_code || 'Sin pais'}</span>
                      <span className="font-black">{country.total}</span>
                    </div>
                  ))}
                  {!(analyticsGeo?.countries || []).length && <p className="text-xs text-stone-400">Sin datos geograficos.</p>}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-stone-500 mb-1">Ciudades</p>
                <div className="space-y-1">
                  {(analyticsGeo?.cities || []).slice(0, 5).map((city) => (
                    <div key={`${city.city}-${city.latitude}-${city.longitude}`} className="rounded-lg bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-700">
                      <div className="flex items-center justify-between gap-2">
                        <span>{city.city || 'Sin ciudad'}</span>
                        <span className="font-black">{city.total}</span>
                      </div>
                      <p className="text-[10px] text-stone-500">{city.region || city.country_name || 'Sin region'}</p>
                    </div>
                  ))}
                  {!(analyticsGeo?.cities || []).length && <p className="text-xs text-stone-400">Sin ciudades registradas.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Heatmap geografico</p>
            <CRMGeoMap points={geoPoints} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Top paginas</p>
            <div className="space-y-2">
              {(analyticsPages || []).slice(0, 8).map((page) => (
                <div key={page.page_path} className="rounded-xl bg-stone-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-700">
                    <span className="truncate">{page.page_path || '/'}</span>
                    <span className="font-black">{page.total}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white border border-beige-200 overflow-hidden">
                    <div className="h-full bg-brand-400" style={{ width: `${Math.min(100, page.total * 10)}%` }}></div>
                  </div>
                </div>
              ))}
              {!(analyticsPages || []).length && <p className="text-xs text-stone-400">Sin datos de navegacion.</p>}
            </div>
            {!!pageHeat.length && (
              <div className="mt-3 rounded-xl border border-beige-100 bg-stone-50 p-3">
                <p className="text-[10px] uppercase font-black text-stone-500 mb-2">Heatmap de navegacion</p>
                <div className="flex flex-wrap gap-2">
                  {pageHeat.slice(0, 10).map((page) => (
                    <span
                      key={`heat-${page.page_path}`}
                      className="rounded-full bg-brand-100 text-brand-800 font-black"
                      style={{
                        padding: `${6 + Math.min(8, page.intensity || 0)}px ${10 + Math.min(18, page.intensity || 0)}px`,
                        fontSize: `${10 + Math.min(4, page.intensity || 0)}px`
                      }}
                    >
                      {page.page_path || '/'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-beige-200 bg-white p-3">
            <p className="text-[11px] uppercase font-black text-brand-700 mb-2">Productos mas vistos</p>
            <div className="space-y-2">
              {(analyticsProducts || []).slice(0, 8).map((product) => (
                <div key={`${product.product_id}-${product.product_name}`} className="rounded-xl bg-stone-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-700">
                    <span className="truncate">{product.product_name || 'Producto sin nombre'}</span>
                    <span className="font-black">{product.total}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white border border-beige-200 overflow-hidden">
                    <div className="h-full bg-yolk-400" style={{ width: `${Math.min(100, product.total * 10)}%` }}></div>
                  </div>
                </div>
              ))}
              {!(analyticsProducts || []).length && <p className="text-xs text-stone-400">Sin vistas de producto registradas.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMAdminPanel;
