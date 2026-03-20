import { useCallback, useState, useEffect, useMemo } from 'react';
import { Package, CheckCircle, XCircle, Clock, Search, ShieldCheck, LogOut, Users, UserPlus, KeyRound, FileSpreadsheet, FileText, Download, ClipboardCheck, AlertTriangle, TrendingDown, Info } from 'lucide-react';
import { 
  CANCELLATION_REASON_OPTIONS, 
  KPI_GLOSSARY, 
  REPORT_MENU_ITEMS, 
  REPORT_PRESETS_BY_ROLE 
} from './lib/crmConstants';
import { getStatusColor, getScheduleBadge } from './lib/crmUtils';
import CRMStats from './components/crm/CRMStats';
import CRMOrderManager from './components/crm/CRMOrderManager';
import CRMAdminPanel from './components/crm/CRMAdminPanel';
import CRMReportingSuite from './components/crm/CRMReportingSuite';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ANALYTICS_PRESETS_STORAGE_KEY = 'rdn_crm_analytics_presets';

const CRM = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [crmToken, setCrmToken] = useState('');
  const [crmUser, setCrmUser] = useState('');
  const [crmRole, setCrmRole] = useState('');
  const [crmLocalIds, setCrmLocalIds] = useState([]);
  const [crmLocals, setCrmLocals] = useState([]);
  const [selectedLocalId, setSelectedLocalId] = useState('');
  const [crmEmail, setCrmEmail] = useState('');
  const [crmPassword, setCrmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverToken, setRecoverToken] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [crmUsers, setCrmUsers] = useState([]);
  const [newCrmUserEmail, setNewCrmUserEmail] = useState('');
  const [newCrmUserPassword, setNewCrmUserPassword] = useState('');
  const [newCrmUserRole, setNewCrmUserRole] = useState('operador');
  const [resetPasswords, setResetPasswords] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState('');
  const [auditLocalFilter, setAuditLocalFilter] = useState('');
  const [auditFromDate, setAuditFromDate] = useState('');
  const [auditToDate, setAuditToDate] = useState('');
  const [auditStats, setAuditStats] = useState({ total_events: 0, by_action: [], by_role: [], by_entity: [], by_local: [] });
  const [crmAlerts, setCrmAlerts] = useState([]);
  const [localsAlertsReport, setLocalsAlertsReport] = useState(null);
  const [consolidatedAlertsReport, setConsolidatedAlertsReport] = useState(null);
  const [alertThresholds, setAlertThresholds] = useState([]);
  const [thresholdDrafts, setThresholdDrafts] = useState({});
  const [alertUpdateDrafts, setAlertUpdateDrafts] = useState({});
  const [funnelStats, setFunnelStats] = useState({
    stages: {
      view_product: 0,
      add_to_cart: 0,
      begin_checkout: 0,
      purchase: 0,
      subscription_start: 0
    },
    conversion: {
      view_to_cart_pct: 0,
      cart_to_checkout_pct: 0,
      checkout_to_purchase_pct: 0,
      purchase_to_subscription_pct: 0
    },
    by_source: []
  });
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsGeo, setAnalyticsGeo] = useState({ countries: [], cities: [] });
  const [analyticsPages, setAnalyticsPages] = useState([]);
  const [analyticsProducts, setAnalyticsProducts] = useState([]);
  const [analyticsHeatmap, setAnalyticsHeatmap] = useState({ geographic: [], pages: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDraftFilters, setAnalyticsDraftFilters] = useState({
    event_name: '',
    product_id: '',
    source: '',
    page_path: '',
  });
  const [analyticsAppliedFilters, setAnalyticsAppliedFilters] = useState({
    event_name: '',
    product_id: '',
    source: '',
    page_path: '',
  });
  const [analyticsPresetName, setAnalyticsPresetName] = useState('');
  const [analyticsPresets, setAnalyticsPresets] = useState([]);
  const [executiveReport, setExecutiveReport] = useState(null);
  const [dailyOpsReport, setDailyOpsReport] = useState(null);
  const [cancellationsReport, setCancellationsReport] = useState(null);
  const [localsOverviewReport, setLocalsOverviewReport] = useState(null);
  const [localsBenchmarkReport, setLocalsBenchmarkReport] = useState(null);
  const [localOperationsReport, setLocalOperationsReport] = useState(null);

  const [reportSemaphores, setReportSemaphores] = useState([]);
  const [reportGroupBy, setReportGroupBy] = useState('day');
  const [reportGranularity, setReportGranularity] = useState('day');
  const [reportPrevPeriod, setReportPrevPeriod] = useState('1');
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [reportDeliverySlotFilter, setReportDeliverySlotFilter] = useState('');
  const [reportSchedules, setReportSchedules] = useState([]);
  const [reportDeliveryLogs, setReportDeliveryLogs] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    report_type: 'executive_weekly',
    frequency: 'weekly',
    channel: 'log',
    destination: ''
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [pdfExportLoading, setPdfExportLoading] = useState(false);
  const [alertsPdfExportLoading, setAlertsPdfExportLoading] = useState(false);
  const [activeReportMenu, setActiveReportMenu] = useState('inicio');
  const [urgentMode, setUrgentMode] = useState(false);
  const isAdminRole = crmRole === 'admin';
  const reportMenuItems = useMemo(() => REPORT_MENU_ITEMS(isAdminRole), [isAdminRole]);
  const reportPresets = useMemo(() => REPORT_PRESETS_BY_ROLE[crmRole || 'operador'] || [], [crmRole]);
  const analyticsFilterOptions = useMemo(() => ([
    { value: '', label: 'Todos los eventos' },
    { value: 'page_view', label: 'Page View' },
    { value: 'view_product', label: 'View Product' },
    { value: 'create_account', label: 'Create Account' },
    { value: 'login', label: 'Login' },
    { value: 'newsletter_subscribe', label: 'Newsletter' },
    { value: 'add_to_cart', label: 'Add to Cart' },
    { value: 'begin_checkout', label: 'Begin Checkout' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'ai_interaction', label: 'AI Interaction' },
    { value: 'subscription_interest', label: 'Subscription Interest' },
    { value: 'subscription_start', label: 'Subscription Start' },
  ]), []);
  const analyticsActiveFiltersCount = useMemo(
    () => Object.values(analyticsAppliedFilters).filter(Boolean).length,
    [analyticsAppliedFilters]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(ANALYTICS_PRESETS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setAnalyticsPresets(parsed.filter((preset) => preset?.id && preset?.name && preset?.filters));
      }
    } catch {
      // Ignore invalid local presets.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ANALYTICS_PRESETS_STORAGE_KEY, JSON.stringify(analyticsPresets));
  }, [analyticsPresets]);

  const applyReportPreset = (preset) => {
    setReportGroupBy(preset.group_by || 'day');
    setReportStatusFilter(preset.status || '');
    setReportDeliverySlotFilter(preset.delivery_slot || '');
    setNotice(`Preset aplicado: ${preset.label}`);
  };



  const kpiLabel = (label, glossaryKey) => (
    <span className="inline-flex items-center gap-1">
      {label}
      <span className="relative group inline-flex items-center">
        <Info size={12} className="text-stone-400" />
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-52 -translate-x-1/2 rounded-lg bg-stone-800 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          {KPI_GLOSSARY[glossaryKey] || 'Indicador clave de operacion.'}
        </span>
      </span>
    </span>
  );

  useEffect(() => {
    if (!isAdminRole && activeReportMenu === 'programacion') {
      setActiveReportMenu('inicio');
    }
  }, [isAdminRole, activeReportMenu]);



  useEffect(() => {
    fetch(`${API_BASE_URL}/api/crm/me`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setCrmToken('');
          setCrmUser('');
          setCrmRole('');
          setOrders([]);
          return;
        }
        setCrmToken((prev) => prev || 'cookie');
        setCrmUser(data.user?.email || '');
        setCrmRole(data.user?.role || 'admin');
        setCrmLocalIds(Array.isArray(data.user?.local_ids) ? data.user.local_ids : []);
      })
      .catch(() => {});
  }, [crmToken]);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
  };

  const handleCrmLogin = async () => {
    setAuthLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: crmEmail, password: crmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar sesión CRM');
      }

      setCrmToken(data.token || 'cookie');
      setCrmUser(data.user?.email || crmEmail);
      setCrmRole(data.user?.role || 'admin');
      setNotice('Sesión CRM iniciada correctamente.');
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión CRM');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCrmLogout = () => {
    fetch(`${API_BASE_URL}/api/crm/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
    setCrmToken('');
    setCrmUser('');
    setCrmRole('');
    setOrders([]);
    setError('');
    setNotice('Sesión cerrada.');
  };

  const handleCrmPasswordRequest = async () => {
    setAuthLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: recoverEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo solicitar recuperación');
      setNotice(
        data.reset_token
          ? `Recuperación generada (entorno no productivo). Token temporal: ${data.reset_token}`
          : 'Recuperación generada. Revisa el canal seguro configurado para obtener el token.'
      );
    } catch (recoverError) {
      setError(recoverError.message || 'No se pudo solicitar recuperación');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCrmPasswordReset = async () => {
    setAuthLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: recoverToken, new_password: recoverNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo resetear contraseña');
      setNotice('Contraseña actualizada. Ahora puedes iniciar sesión.');
      setShowRecover(false);
      setRecoverToken('');
      setRecoverNewPassword('');
    } catch (resetError) {
      setError(resetError.message || 'No se pudo resetear contraseña');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCrmUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/users`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar usuarios CRM');
      setCrmUsers(data.users || []);
    } catch (usersError) {
      setError(usersError.message || 'No se pudo cargar usuarios CRM');
    }
  };

  const fetchCrmLocals = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/locals`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar locales CRM');

      const locals = data.locals || [];
      setCrmLocals(locals);
      const allowed = Array.isArray(data.local_ids) ? data.local_ids : [];
      setCrmLocalIds(allowed);

      if (locals.length) {
        setSelectedLocalId((prev) => {
          const prevNum = Number(prev);
          if (Number.isFinite(prevNum) && allowed.includes(prevNum)) return String(prevNum);
          if ((data.role || crmRole) === 'admin' && allowed.length > 1) return '';
          return String(locals[0].id);
        });
      } else {
        setSelectedLocalId('');
      }
    } catch (localsError) {
      setError(localsError.message || 'No se pudo cargar locales CRM');
    }
  }, [crmRole, crmToken]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const query = new URLSearchParams({ limit: '25' });
      if (auditActionFilter) query.set('action', auditActionFilter);
      if (auditEntityFilter) query.set('entity_type', auditEntityFilter);
      if (auditLocalFilter) query.set('local_id', auditLocalFilter);
      if (auditFromDate) query.set('from_date', auditFromDate);
      if (auditToDate) query.set('to_date', auditToDate);

      const res = await fetch(`${API_BASE_URL}/api/crm/audit-logs?${query.toString()}`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar auditoría CRM');
      setAuditLogs(data.logs || []);
    } catch (auditError) {
      setError(auditError.message || 'No se pudo cargar auditoría CRM');
    }
  }, [auditActionFilter, auditEntityFilter, auditLocalFilter, auditFromDate, auditToDate, crmToken]);

  const fetchAuditStats = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (auditLocalFilter) query.set('local_id', auditLocalFilter);
      if (auditFromDate) query.set('from_date', auditFromDate);
      if (auditToDate) query.set('to_date', auditToDate);

      const res = await fetch(`${API_BASE_URL}/api/crm/audit-stats?${query.toString()}`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar estadísticas de auditoría');
      setAuditStats(data.stats || { total_events: 0, by_action: [], by_role: [], by_entity: [], by_local: [] });
    } catch (statsError) {
      setError(statsError.message || 'No se pudo cargar estadísticas de auditoría');
    }
  }, [auditLocalFilter, auditFromDate, auditToDate, crmToken]);

  const fetchCrmAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/alerts`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar alertas CRM');
      setCrmAlerts(data.alerts || []);
    } catch (alertsError) {
      setError(alertsError.message || 'No se pudo cargar alertas CRM');
    }
  }, [crmToken]);

  const fetchFunnelStats = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (auditFromDate) query.set('from_date', auditFromDate);
      if (auditToDate) query.set('to_date', auditToDate);

      const res = await fetch(`${API_BASE_URL}/api/crm/funnel?${query.toString()}`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar funnel comercial');
      setFunnelStats(data.funnel || {
        stages: {
          view_product: 0,
          add_to_cart: 0,
          begin_checkout: 0,
          purchase: 0,
          subscription_start: 0
        },
        conversion: {
          view_to_cart_pct: 0,
          cart_to_checkout_pct: 0,
          checkout_to_purchase_pct: 0,
          purchase_to_subscription_pct: 0
        },
        by_source: []
      });
    } catch (funnelError) {
      setError(funnelError.message || 'No se pudo cargar funnel comercial');
    }
  }, [auditFromDate, auditToDate, crmToken]);

  const fetchAnalyticsDashboard = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const query = new URLSearchParams();
      if (auditFromDate) query.set('from_date', auditFromDate);
      if (auditToDate) query.set('to_date', auditToDate);
      if (analyticsAppliedFilters.event_name) query.set('event_name', analyticsAppliedFilters.event_name);
      if (analyticsAppliedFilters.product_id) query.set('product_id', analyticsAppliedFilters.product_id);
      if (analyticsAppliedFilters.source) query.set('source', analyticsAppliedFilters.source);
      if (analyticsAppliedFilters.page_path) query.set('page_path', analyticsAppliedFilters.page_path);

      const headers = {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      };

      const [summaryRes, geoRes, pagesRes, productsRes, heatmapRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/summary?${query.toString()}`, { credentials: 'include', headers }),
        fetch(`${API_BASE_URL}/api/analytics/geo?${query.toString()}`, { credentials: 'include', headers }),
        fetch(`${API_BASE_URL}/api/analytics/pages?${query.toString()}`, { credentials: 'include', headers }),
        fetch(`${API_BASE_URL}/api/analytics/products?${query.toString()}`, { credentials: 'include', headers }),
        fetch(`${API_BASE_URL}/api/analytics/heatmap?${query.toString()}`, { credentials: 'include', headers }),
      ]);

      const [summaryData, geoData, pagesData, productsData, heatmapData] = await Promise.all([
        summaryRes.json(),
        geoRes.json(),
        pagesRes.json(),
        productsRes.json(),
        heatmapRes.json(),
      ]);

      if (!summaryRes.ok) throw new Error(summaryData.error || 'No se pudo cargar resumen analitico');
      if (!geoRes.ok) throw new Error(geoData.error || 'No se pudo cargar geografia analitica');
      if (!pagesRes.ok) throw new Error(pagesData.error || 'No se pudo cargar paginas analiticas');
      if (!productsRes.ok) throw new Error(productsData.error || 'No se pudo cargar productos analiticos');
      if (!heatmapRes.ok) throw new Error(heatmapData.error || 'No se pudo cargar heatmap analitico');

      setAnalyticsSummary(summaryData.summary || null);
      setAnalyticsGeo(geoData.geo || { countries: [], cities: [] });
      setAnalyticsPages(pagesData.pages || []);
      setAnalyticsProducts(productsData.products || []);
      setAnalyticsHeatmap(heatmapData.heatmap || { geographic: [], pages: [] });
    } catch (analyticsError) {
      setError(analyticsError.message || 'No se pudo cargar analytics dashboard');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsAppliedFilters, auditFromDate, auditToDate, crmToken]);

  const applyAnalyticsFilters = useCallback(() => {
    setAnalyticsAppliedFilters({
      event_name: analyticsDraftFilters.event_name.trim(),
      product_id: analyticsDraftFilters.product_id.trim(),
      source: analyticsDraftFilters.source.trim(),
      page_path: analyticsDraftFilters.page_path.trim(),
    });
    setNotice('Filtros analiticos aplicados.');
  }, [analyticsDraftFilters]);

  const resetAnalyticsFilters = useCallback(() => {
    const cleared = {
      event_name: '',
      product_id: '',
      source: '',
      page_path: '',
    };
    setAnalyticsDraftFilters(cleared);
    setAnalyticsAppliedFilters(cleared);
    setNotice('Filtros analiticos limpiados.');
  }, []);

  const saveAnalyticsPreset = useCallback(() => {
    const trimmedName = analyticsPresetName.trim();
    if (!trimmedName) {
      setNotice('Ingresa un nombre para el preset analitico.');
      return;
    }

    const nextPreset = {
      id: `analytics_preset_${Date.now()}`,
      name: trimmedName,
      filters: {
        event_name: analyticsDraftFilters.event_name.trim(),
        product_id: analyticsDraftFilters.product_id.trim(),
        source: analyticsDraftFilters.source.trim(),
        page_path: analyticsDraftFilters.page_path.trim(),
      },
    };

    setAnalyticsPresets((prev) => [nextPreset, ...prev.filter((preset) => preset.name !== trimmedName)].slice(0, 8));
    setAnalyticsPresetName('');
    setNotice(`Preset analitico guardado: ${trimmedName}`);
  }, [analyticsDraftFilters, analyticsPresetName]);

  const applyAnalyticsPreset = useCallback((preset) => {
    const filters = {
      event_name: preset.filters?.event_name || '',
      product_id: preset.filters?.product_id || '',
      source: preset.filters?.source || '',
      page_path: preset.filters?.page_path || '',
    };
    setAnalyticsDraftFilters(filters);
    setAnalyticsAppliedFilters(filters);
    setNotice(`Preset analitico aplicado: ${preset.name}`);
  }, []);

  const deleteAnalyticsPreset = useCallback((presetId) => {
    setAnalyticsPresets((prev) => prev.filter((preset) => preset.id !== presetId));
    setNotice('Preset analitico eliminado.');
  }, []);

  const buildReportQuery = useCallback((base = {}) => {
    const query = new URLSearchParams(base);
    if (auditFromDate) query.set('from_date', auditFromDate);
    if (auditToDate) query.set('to_date', auditToDate);
    if (selectedLocalId) query.set('local_id', selectedLocalId);
    if (reportGroupBy) query.set('group_by', reportGroupBy);
    if (reportGranularity) query.set('granularity', reportGranularity);
    if (reportPrevPeriod) query.set('prev_period', reportPrevPeriod);
    if (reportStatusFilter) query.set('status', reportStatusFilter);
    if (reportDeliverySlotFilter) query.set('delivery_slot', reportDeliverySlotFilter);
    return query;
  }, [auditFromDate, auditToDate, selectedLocalId, reportGroupBy, reportGranularity, reportPrevPeriod, reportStatusFilter, reportDeliverySlotFilter]);

  const fetchExecutiveReport = useCallback(async () => {
    const query = buildReportQuery();
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/executive-weekly?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar reporte ejecutivo');
    setExecutiveReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchDailyOpsReport = useCallback(async () => {
    const query = buildReportQuery({ date: new Date().toISOString().slice(0, 10) });
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/daily-operations?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar reporte diario');
    setDailyOpsReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchCancellationsReport = useCallback(async () => {
    const query = buildReportQuery();
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/cancellations?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar reporte de cancelaciones');
    setCancellationsReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchMetricsDictionary = useCallback(async () => {
    const query = buildReportQuery();
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/metrics-dictionary?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar diccionario de metricas');
    setReportSemaphores(data.semaphores || []);
  }, [buildReportQuery, crmToken]);





  const fetchLocalsOverviewReport = useCallback(async () => {
    const query = buildReportQuery();
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/overview?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar resumen multi-local');
    setLocalsOverviewReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchLocalsBenchmarkReport = useCallback(async () => {
    const query = buildReportQuery();
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/benchmark?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar benchmark de locales');
    setLocalsBenchmarkReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchLocalOperationsReport = useCallback(async () => {
    const fallbackLocalId = selectedLocalId || (crmLocalIds.length ? String(crmLocalIds[0]) : '');
    if (!fallbackLocalId) {
      setLocalOperationsReport(null);
      return;
    }
    const query = buildReportQuery({ date: new Date().toISOString().slice(0, 10) });
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/${fallbackLocalId}/operations?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar operación por local');
    setLocalOperationsReport(data.report || null);
  }, [buildReportQuery, crmLocalIds, crmToken, selectedLocalId]);

  const fetchLocalsAlertsReport = useCallback(async () => {
    const query = buildReportQuery({ date: new Date().toISOString().slice(0, 10) });
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/alerts?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar alertas por local');
    setLocalsAlertsReport(data.report || null);
  }, [buildReportQuery, crmToken]);

  const fetchConsolidatedAlertsReport = useCallback(async () => {
    const query = buildReportQuery({ date: new Date().toISOString().slice(0, 10), status: 'active,acknowledged' });
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/alerts/consolidated?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar consolidado de alertas');
    const report = data.report || null;
    setConsolidatedAlertsReport(report);
    setAlertUpdateDrafts((prev) => {
      const next = { ...prev };
      (report?.alerts || []).forEach((alert) => {
        if (!next[alert.id]) {
          next[alert.id] = {
            status: alert.status || 'active',
            owner_user_id: alert.owner_user_id ? String(alert.owner_user_id) : ''
          };
        }
      });
      return next;
    });

    if (crmRole === 'admin' && !crmUsers.length) {
      const usersRes = await fetch(`${API_BASE_URL}/api/crm/users`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      const usersData = await usersRes.json().catch(() => ({}));
      if (usersRes.ok) {
        setCrmUsers(usersData.users || []);
      }
    }
  }, [buildReportQuery, crmRole, crmToken, crmUsers.length]);

  const fetchAlertThresholds = useCallback(async () => {
    const query = new URLSearchParams();
    if (selectedLocalId) query.set('local_id', selectedLocalId);
    const res = await fetch(`${API_BASE_URL}/api/crm/alerts/thresholds?${query.toString()}`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar umbrales de alertas');
    const rows = data.thresholds || [];
    setAlertThresholds(rows);
    setThresholdDrafts((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        if (!next[row.local_id]) {
          next[row.local_id] = {
            min_fulfillment_pct: String(row.min_fulfillment_pct ?? 90),
            max_cancellation_pct: String(row.max_cancellation_pct ?? 8),
            max_pending_pct: String(row.max_pending_pct ?? 15)
          };
        }
      });
      return next;
    });
  }, [crmToken, selectedLocalId]);

  const saveAlertThreshold = async (localId) => {
    if (!isAdminRole) return;
    const draft = thresholdDrafts[localId];
    if (!draft) return;

    const res = await fetch(`${API_BASE_URL}/api/crm/alerts/thresholds/${localId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: authHeaders,
      body: JSON.stringify({
        min_fulfillment_pct: Number(draft.min_fulfillment_pct),
        max_cancellation_pct: Number(draft.max_cancellation_pct),
        max_pending_pct: Number(draft.max_pending_pct)
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo guardar umbral de alerta');
    }
    setNotice('Umbral actualizado correctamente.');
    await Promise.all([fetchAlertThresholds(), fetchLocalsAlertsReport(), fetchAuditLogs(), fetchAuditStats()]);
  };

  const updateConsolidatedAlert = async (alertId) => {
    const draft = alertUpdateDrafts[alertId];
    if (!draft) return;
    const payload = {
      status: draft.status,
      owner_user_id: draft.owner_user_id ? Number(draft.owner_user_id) : null
    };
    const res = await fetch(`${API_BASE_URL}/api/crm/reports/locals/alerts/${alertId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo actualizar alerta consolidada');
    }
    setNotice('Alerta consolidada actualizada.');
    await Promise.all([fetchConsolidatedAlertsReport(), fetchAuditLogs(), fetchAuditStats()]);
  };

  const fetchReportSchedules = useCallback(async () => {
    if (crmRole !== 'admin') return;
    const res = await fetch(`${API_BASE_URL}/api/crm/reporting/schedules`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar programaciones de reportes');
    setReportSchedules(data.schedules || []);
  }, [crmRole, crmToken]);

  const fetchReportDeliveryLogs = useCallback(async () => {
    if (crmRole !== 'admin') return;
    const res = await fetch(`${API_BASE_URL}/api/crm/reporting/delivery-logs?limit=25`, {
      credentials: 'include',
      headers: {
        ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo cargar logs de entrega');
    setReportDeliveryLogs(data.logs || []);
  }, [crmRole, crmToken]);

  const fetchReportingSuite = useCallback(async () => {
    setReportsLoading(true);
    try {
      const jobs = [
        fetchLocalsOverviewReport(),
        fetchLocalsBenchmarkReport(),
        fetchLocalOperationsReport(),
        fetchLocalsAlertsReport(),
        fetchConsolidatedAlertsReport(),
        fetchExecutiveReport(),
        fetchDailyOpsReport(),
        fetchCancellationsReport(),
        fetchMetricsDictionary()
      ];
      jobs.push(fetchAlertThresholds());
      if (crmRole === 'admin') {
        jobs.push(fetchReportSchedules());
        jobs.push(fetchReportDeliveryLogs());
      }
      await Promise.all(jobs);
    } catch (reportError) {
      setError(reportError.message || 'No se pudo cargar reporteria');
    } finally {
      setReportsLoading(false);
    }
  }, [fetchLocalsOverviewReport, fetchLocalsBenchmarkReport, fetchLocalOperationsReport, fetchLocalsAlertsReport, fetchConsolidatedAlertsReport, fetchExecutiveReport, fetchDailyOpsReport, fetchCancellationsReport, fetchMetricsDictionary, fetchAlertThresholds, fetchReportSchedules, fetchReportDeliveryLogs, crmRole]);



  const exportExecutiveReportMarkdown = () => {
    if (!executiveReport) {
      setNotice('Primero carga el reporte ejecutivo.');
      return;
    }

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const lines = [
      '# Reporte Ejecutivo Semanal',
      '',
      `- Generado: ${new Date(executiveReport.generated_at).toLocaleString('es-CL')}`,
      `- Filtros: ${executiveReport.filters?.from_date || '-'} a ${executiveReport.filters?.to_date || '-'}${executiveReport.filters?.source ? ` | fuente: ${executiveReport.filters.source}` : ''}`,
      '',
      '## KPIs',
      `- Ventas semanales: $${Number(executiveReport.kpis?.sales_weekly?.current || 0).toLocaleString('es-CL')} (${Number(executiveReport.kpis?.sales_weekly?.delta_pct || 0).toLocaleString('es-CL')}% vs periodo anterior)`,
      `- Pedidos totales: ${Number(executiveReport.kpis?.orders_total?.current || 0).toLocaleString('es-CL')} (${Number(executiveReport.kpis?.orders_total?.delta_pct || 0).toLocaleString('es-CL')}%)`,
      `- Ticket promedio: $${Number(executiveReport.kpis?.avg_ticket?.current || 0).toLocaleString('es-CL')} (${Number(executiveReport.kpis?.avg_ticket?.delta_pct || 0).toLocaleString('es-CL')}%)`,
      `- Cancelaciones: ${Number(executiveReport.kpis?.cancellations_rate?.current_pct || 0).toLocaleString('es-CL')}%`,
      '',
      '## Riesgos y acciones',
      ...(executiveReport.top_risks || []).map((risk, idx) => `${idx + 1}. [${String(risk.level || 'low').toUpperCase()}] ${risk.title} (${risk.metric}) -> ${risk.recommended_action}`),
      '',
      '## Top productos',
      ...(executiveReport.top_products || []).map((row, idx) => `${idx + 1}. ${row.product_name}: ${row.orders} pedidos, $${Number(row.revenue || 0).toLocaleString('es-CL')}`),
      '',
      '## Top fuentes',
      ...(executiveReport.top_sources || []).map((row, idx) => `${idx + 1}. ${row.source}: ${row.total_orders} pedidos, $${Number(row.revenue || 0).toLocaleString('es-CL')}`)
    ];

    downloadFile(lines.join('\n'), `reporte-ejecutivo-semanal-${stamp}.md`, 'text/markdown;charset=utf-8;');
    setNotice('Reporte ejecutivo exportado en Markdown.');
  };

  const exportExecutiveReportPdf = async () => {
    if (!executiveReport) {
      setNotice('Primero carga el reporte ejecutivo.');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const left = 40;
      let y = 46;

      doc.setFillColor(26, 58, 26);
      doc.rect(0, 0, 595, 72, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Reporte Ejecutivo Semanal', left, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ruta del Nido · ${new Date(executiveReport.generated_at).toLocaleString('es-CL')}`, left, 58);

      doc.setTextColor(35, 35, 35);
      y = 94;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('KPIs clave', left, y);
      doc.setFont('helvetica', 'normal');
      y += 18;
      const lines = [
        `Ventas semanales: $${Number(executiveReport.kpis?.sales_weekly?.current || 0).toLocaleString('es-CL')}`,
        `Pedidos totales: ${Number(executiveReport.kpis?.orders_total?.current || 0).toLocaleString('es-CL')}`,
        `Ticket promedio: $${Number(executiveReport.kpis?.avg_ticket?.current || 0).toLocaleString('es-CL')}`,
        `Cancelaciones: ${Number(executiveReport.kpis?.cancellations_rate?.current_pct || 0).toLocaleString('es-CL')}%`,
        `Conversion checkout -> compra: ${Number(executiveReport.funnel?.conversion?.checkout_to_purchase_pct || 0).toLocaleString('es-CL')}%`
      ];
      lines.forEach((line) => {
        doc.text(`- ${line}`, left, y);
        y += 16;
      });

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Top riesgos y acciones', left, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      (executiveReport.top_risks || []).slice(0, 5).forEach((risk, index) => {
        const text = `${index + 1}. [${String(risk.level || 'low').toUpperCase()}] ${risk.title} - ${risk.recommended_action}`;
        const wrapped = doc.splitTextToSize(text, 510);
        doc.text(wrapped, left, y);
        y += (wrapped.length * 14) + 4;
      });

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      doc.save(`reporte-ejecutivo-semanal-${stamp}.pdf`);
      setNotice('Reporte ejecutivo exportado en PDF.');
    } catch {
      setError('No se pudo generar el PDF ejecutivo.');
    }
  };

  const createReportSchedule = async () => {
    if (crmRole !== 'admin') return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/reporting/schedules`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          report_type: scheduleForm.report_type,
          frequency: scheduleForm.frequency,
          channel: scheduleForm.channel,
          destination: scheduleForm.destination || null,
          filters: {
            ...(auditFromDate ? { from_date: auditFromDate } : {}),
            ...(auditToDate ? { to_date: auditToDate } : {}),
            ...(selectedLocalId ? { local_id: Number(selectedLocalId) } : {}),
            ...(!selectedLocalId && crmLocalIds.length ? { local_ids: crmLocalIds } : {})
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear programacion');
      setNotice('Programacion de reporte creada.');
      fetchReportSchedules();
      fetchReportDeliveryLogs();
    } catch (scheduleError) {
      setError(scheduleError.message || 'No se pudo crear programacion');
    }
  };

  const runReportSchedule = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/reporting/schedules/${id}/run`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo ejecutar programacion');
      setNotice('Programacion ejecutada manualmente.');
      fetchReportDeliveryLogs();
      fetchReportingSuite();
    } catch (runError) {
      setError(runError.message || 'No se pudo ejecutar programacion');
    }
  };

  const toggleReportSchedule = async (id, isActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/reporting/schedules/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ is_active: !isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar programacion');
      setNotice('Programacion actualizada.');
      fetchReportSchedules();
    } catch (toggleError) {
      setError(toggleError.message || 'No se pudo actualizar programacion');
    }
  };

  const startShift = () => {
    setFilter('nuevo');
    setSearch('');
    setNotice('Turno iniciado: mostrando pedidos nuevos y prioridades del dia.');
    fetchDailyOpsReport();
  };

  const downloadFile = (content, filename, mimeType) => {
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

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const exportAuditCsv = () => {
    if (!auditLogs.length) {
      setNotice('No hay datos de auditoría para exportar.');
      return;
    }

    const headers = [
      'id',
      'fecha',
      'actor_email',
      'actor_role',
      'accion',
      'entidad',
      'entidad_id',
      'cambios',
      'metadata'
    ];

    const rows = auditLogs.map((log) => [
      escapeCsv(log.id),
      escapeCsv(new Date(log.created_at).toLocaleString('es-CL')),
      escapeCsv(log.actor_email || 'sistema'),
      escapeCsv(log.actor_role || ''),
      escapeCsv(log.action || ''),
      escapeCsv(log.entity_type || ''),
      escapeCsv(log.entity_id || ''),
      escapeCsv(log.changes ? JSON.stringify(log.changes) : ''),
      escapeCsv(log.metadata ? JSON.stringify(log.metadata) : '')
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(csv, `auditoria-crm-${stamp}.csv`, 'text/csv;charset=utf-8;');
    setNotice('Exportación CSV generada correctamente.');
  };

  const exportAuditVisualHtml = () => {
    if (!auditLogs.length) {
      setNotice('No hay datos de auditoría para exportar.');
      return;
    }

    const stamp = new Date().toLocaleString('es-CL');
    const actionFilterText = auditActionFilter || 'Todas';
    const entityFilterText = auditEntityFilter || 'Todas';
    const fromText = auditFromDate || 'Sin límite';
    const toText = auditToDate || 'Sin límite';

    const rowsHtml = auditLogs
      .map((log) => {
        const changes = log.changes ? JSON.stringify(log.changes, null, 2) : '-';
        const metadata = log.metadata ? JSON.stringify(log.metadata, null, 2) : '-';
        return `
          <tr>
            <td>${log.id}</td>
            <td>${new Date(log.created_at).toLocaleString('es-CL')}</td>
            <td>${log.actor_email || 'sistema'}</td>
            <td><span class="role ${log.actor_role || 'none'}">${log.actor_role || 'n/a'}</span></td>
            <td><span class="chip">${log.action || '-'}</span></td>
            <td>${log.entity_type || '-'}</td>
            <td>${log.entity_id || '-'}</td>
            <td><pre>${changes}</pre></td>
            <td><pre>${metadata}</pre></td>
          </tr>
        `;
      })
      .join('');

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte Auditoría CRM - Ruta del Nido</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5ede0; margin: 0; color: #1f2937; }
    .container { max-width: 1280px; margin: 24px auto; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a3a1a, #245124); color: #fff; padding: 24px 28px; }
    .title { margin: 0; font-size: 28px; font-weight: 800; }
    .subtitle { margin-top: 8px; opacity: 0.9; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; padding: 16px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .meta div { font-size: 13px; }
    .meta strong { display: block; color: #1a3a1a; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #eef2f7; padding: 10px; font-size: 12px; vertical-align: top; text-align: left; }
    th { position: sticky; top: 0; background: #f8fafc; z-index: 1; font-weight: 700; }
    .table-wrap { overflow: auto; max-height: 72vh; }
    .chip { display: inline-block; background: #ecfdf5; color: #166534; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
    .role { display: inline-block; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 11px; }
    .role.admin { background: #fef3c7; color: #92400e; }
    .role.operador { background: #dbeafe; color: #1e3a8a; }
    .role.none { background: #e5e7eb; color: #374151; }
    pre { margin: 0; white-space: pre-wrap; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; max-width: 320px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 class="title">Reporte de Auditoría CRM</h2>
      <p class="subtitle">Ruta del Nido - Alimentos Naturales</p>
    </div>
    <div class="meta">
      <div><strong>Generado</strong>${stamp}</div>
      <div><strong>Acción</strong>${actionFilterText}</div>
      <div><strong>Entidad</strong>${entityFilterText}</div>
      <div><strong>Desde</strong>${fromText}</div>
      <div><strong>Hasta</strong>${toText}</div>
      <div><strong>Total eventos</strong>${auditLogs.length}</div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Actor</th>
            <th>Rol</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>ID Entidad</th>
            <th>Cambios</th>
            <th>Metadata</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    const filenameStamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(html, `auditoria-crm-visual-${filenameStamp}.html`, 'text/html;charset=utf-8;');
    setNotice('Reporte visual HTML generado correctamente.');
  };

  const exportAuditPdf = async () => {
    if (!auditLogs.length) {
      setNotice('No hay datos de auditoría para exportar.');
      return;
    }

    setPdfExportLoading(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const generatedAt = new Date().toLocaleString('es-CL');

      doc.setFillColor(26, 58, 26);
      doc.rect(0, 0, 842, 80, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Reporte de Auditoría CRM', 40, 45);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ruta del Nido · Generado: ${generatedAt}`, 40, 64);

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(`Filtro acción: ${auditActionFilter || 'Todas'} | Entidad: ${auditEntityFilter || 'Todas'} | Desde: ${auditFromDate || 'Sin límite'} | Hasta: ${auditToDate || 'Sin límite'}`, 40, 98);

      const bodyRows = auditLogs.map((log) => [
        String(log.id),
        new Date(log.created_at).toLocaleString('es-CL'),
        log.actor_email || 'sistema',
        log.actor_role || 'n/a',
        log.action || '-',
        log.entity_type || '-',
        log.entity_id || '-',
        log.changes ? JSON.stringify(log.changes) : '-',
        log.metadata ? JSON.stringify(log.metadata) : '-'
      ]);

      autoTable(doc, {
        startY: 110,
        head: [['ID', 'Fecha', 'Actor', 'Rol', 'Acción', 'Entidad', 'ID Entidad', 'Cambios', 'Metadata']],
        body: bodyRows,
        styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [201, 134, 42], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 88 },
          2: { cellWidth: 110 },
          3: { cellWidth: 44 },
          4: { cellWidth: 96 },
          5: { cellWidth: 66 },
          6: { cellWidth: 52 },
          7: { cellWidth: 160 },
          8: { cellWidth: 160 }
        }
      });

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      doc.save(`auditoria-crm-${stamp}.pdf`);
      setNotice('Reporte PDF generado correctamente.');
    } catch {
      setError('No se pudo generar el PDF en este momento.');
    } finally {
      // PDF export loading was deleted
    }
  };

  const exportAnalyticsCsv = () => {
    const hasData = analyticsSummary || analyticsGeo.countries?.length || analyticsGeo.cities?.length || analyticsPages.length || analyticsProducts.length || analyticsHeatmap.geographic?.length || analyticsHeatmap.pages?.length;
    if (!hasData) {
      setNotice('No hay datos analiticos para exportar.');
      return;
    }

    const sections = [];
    const summaryRows = [
      ['metric', 'value'],
      ['total_events', analyticsSummary?.total_events || 0],
      ['unique_sessions', analyticsSummary?.unique_sessions || 0],
      ['known_users', analyticsSummary?.known_users || 0],
      ['accounts_created', analyticsSummary?.accounts_created || 0],
      ['ai_interactions', analyticsSummary?.ai_interactions || 0],
    ];
    sections.push(['[summary]', ...summaryRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const countryRows = [
      ['country_code', 'country_name', 'total'],
      ...(analyticsGeo?.countries || []).map((row) => [row.country_code || '', row.country_name || '', row.total || 0]),
    ];
    sections.push(['[countries]', ...countryRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const cityRows = [
      ['country_code', 'country_name', 'region', 'city', 'latitude', 'longitude', 'total'],
      ...(analyticsGeo?.cities || []).map((row) => [row.country_code || '', row.country_name || '', row.region || '', row.city || '', row.latitude ?? '', row.longitude ?? '', row.total || 0]),
    ];
    sections.push(['[cities]', ...cityRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const pagesRows = [
      ['page_path', 'total'],
      ...(analyticsPages || []).map((row) => [row.page_path || '/', row.total || 0]),
    ];
    sections.push(['[pages]', ...pagesRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const productsRows = [
      ['product_id', 'product_name', 'total'],
      ...(analyticsProducts || []).map((row) => [row.product_id ?? '', row.product_name || '', row.total || 0]),
    ];
    sections.push(['[products]', ...productsRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const geoHeatRows = [
      ['city', 'region', 'country_code', 'latitude', 'longitude', 'intensity'],
      ...(analyticsHeatmap?.geographic || []).map((row) => [row.city || '', row.region || '', row.country_code || '', row.latitude ?? '', row.longitude ?? '', row.intensity || 0]),
    ];
    sections.push(['[heatmap_geographic]', ...geoHeatRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const pageHeatRows = [
      ['page_path', 'intensity'],
      ...(analyticsHeatmap?.pages || []).map((row) => [row.page_path || '/', row.intensity || 0]),
    ];
    sections.push(['[heatmap_pages]', ...pageHeatRows.map((row) => row.map(escapeCsv).join(','))].join('\n'));

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(sections.join('\n\n'), `analytics-crm-${stamp}.csv`, 'text/csv;charset=utf-8;');
    setNotice('Exportacion analitica CSV generada.');
  };

  const exportAnalyticsPdf = async () => {
    const hasData = analyticsSummary || analyticsGeo.countries?.length || analyticsGeo.cities?.length || analyticsPages.length || analyticsProducts.length;
    if (!hasData) {
      setNotice('No hay datos analiticos para exportar.');
      return;
    }

    setPdfExportLoading(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const mapSvgElement = typeof document !== 'undefined'
        ? document.querySelector('#crm-analytics-geo-map svg')
        : null;
      let mapImageData = null;

      if (mapSvgElement) {
        const svgMarkup = new XMLSerializer().serializeToString(mapSvgElement);
        mapImageData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const generatedAt = new Date().toLocaleString('es-CL');
      const filtersText = [
        auditFromDate ? `desde ${auditFromDate}` : null,
        auditToDate ? `hasta ${auditToDate}` : null,
        analyticsAppliedFilters.event_name ? `evento ${analyticsAppliedFilters.event_name}` : null,
        analyticsAppliedFilters.product_id ? `producto ${analyticsAppliedFilters.product_id}` : null,
        analyticsAppliedFilters.source ? `canal ${analyticsAppliedFilters.source}` : null,
        analyticsAppliedFilters.page_path ? `pagina ${analyticsAppliedFilters.page_path}` : null,
      ].filter(Boolean).join(' | ') || 'sin filtros';

      doc.setFillColor(26, 58, 26);
      doc.rect(0, 0, 595, 86, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(19);
      doc.text('Reporte Analitico CRM', 36, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Ruta del Nido · Generado: ${generatedAt}`, 36, 62);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.text(`Filtros: ${filtersText}`, 36, 104, { maxWidth: 520 });

      autoTable(doc, {
        startY: 122,
        head: [['Metrica', 'Valor']],
        body: [
          ['Eventos', String(analyticsSummary?.total_events || 0)],
          ['Sesiones', String(analyticsSummary?.unique_sessions || 0)],
          ['Usuarios conocidos', String(analyticsSummary?.known_users || 0)],
          ['Cuentas creadas', String(analyticsSummary?.accounts_created || 0)],
          ['Interacciones IA', String(analyticsSummary?.ai_interactions || 0)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [26, 58, 26] },
        styles: { fontSize: 9 },
        margin: { left: 36, right: 36 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Pais', 'Total']],
        body: (analyticsGeo?.countries || []).slice(0, 8).map((row) => [row.country_name || row.country_code || 'Sin pais', String(row.total || 0)]),
        theme: 'striped',
        headStyles: { fillColor: [181, 140, 35] },
        styles: { fontSize: 8 },
        margin: { left: 36, right: 36 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Ciudad', 'Region', 'Total']],
        body: (analyticsGeo?.cities || []).slice(0, 8).map((row) => [row.city || 'Sin ciudad', row.region || row.country_name || '-', String(row.total || 0)]),
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 8 },
        margin: { left: 36, right: 36 },
      });

      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Navegacion y Productos', 36, 42);

      autoTable(doc, {
        startY: 58,
        head: [['Pagina', 'Visitas']],
        body: (analyticsPages || []).slice(0, 12).map((row) => [row.page_path || '/', String(row.total || 0)]),
        theme: 'grid',
        headStyles: { fillColor: [26, 58, 26] },
        styles: { fontSize: 8 },
        margin: { left: 36, right: 36 },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Producto', 'ID', 'Vistas']],
        body: (analyticsProducts || []).slice(0, 12).map((row) => [row.product_name || 'Producto sin nombre', String(row.product_id ?? '-'), String(row.total || 0)]),
        theme: 'grid',
        headStyles: { fillColor: [181, 140, 35] },
        styles: { fontSize: 8 },
        margin: { left: 36, right: 36 },
      });

      if (mapImageData) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Mapa Geografico de Visitas', 36, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Visualizacion exportada desde el panel CRM con intensidad por ciudad.', 36, 58);
        doc.addImage(mapImageData, 'SVG', 48, 84, 200, 470);

        autoTable(doc, {
          startY: 96,
          margin: { left: 280, right: 36 },
          head: [['Ciudad', 'Region', 'Hits']],
          body: (analyticsHeatmap?.geographic || []).slice(0, 10).map((row) => [
            row.city || 'Sin ciudad',
            row.region || row.country_code || '-',
            String(row.intensity || 0),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [26, 58, 26] },
          styles: { fontSize: 8 },
        });
      }

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      doc.save(`analytics-crm-${stamp}.pdf`);
      setNotice('Exportacion analitica PDF generada.');
    } catch {
      setError('No se pudo generar el PDF analitico.');
    } finally {
      setPdfExportLoading(false);
    }
  };

  const exportLocalAlertsCsv = () => {
    const rows = localsAlertsReport?.alerts || [];
    if (!rows.length) {
      setNotice('No hay alertas por local para exportar.');
      return;
    }

    const headers = [
      'local_id',
      'local_name',
      'fecha',
      'total_orders',
      'fulfillment_pct',
      'cancellation_pct',
      'pending_pct',
      'alerts_count',
      'alerts'
    ];

    const csvRows = rows.map((row) => [
      escapeCsv(row.local_id),
      escapeCsv(row.local_name),
      escapeCsv(localsAlertsReport?.date || ''),
      escapeCsv(row.kpis?.total_orders || 0),
      escapeCsv(row.kpis?.fulfillment_pct || 0),
      escapeCsv(row.kpis?.cancellation_pct || 0),
      escapeCsv(row.kpis?.pending_pct || 0),
      escapeCsv((row.alerts || []).length),
      escapeCsv((row.alerts || []).map((alert) => `[${alert.severity}] ${alert.message}`).join(' | '))
    ]);

    const csv = [headers.join(','), ...csvRows.map((line) => line.join(','))].join('\n');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(csv, `alertas-locales-${stamp}.csv`, 'text/csv;charset=utf-8;');
    setNotice('Exportación de alertas locales en CSV generada.');
  };

  const exportLocalAlertsPdf = async () => {
    const rows = localsAlertsReport?.alerts || [];
    if (!rows.length) {
      setNotice('No hay alertas por local para exportar.');
      return;
    }

    setAlertsPdfExportLoading(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      doc.setFillColor(26, 58, 26);
      doc.rect(0, 0, 842, 78, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Alertas por Local', 40, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${localsAlertsReport?.date || '-'} · Generado: ${new Date().toLocaleString('es-CL')}`, 40, 60);

      const bodyRows = rows.map((row) => [
        String(row.local_id || '-'),
        row.local_name || '-',
        String(row.kpis?.total_orders || 0),
        `${Number(row.kpis?.fulfillment_pct || 0).toLocaleString('es-CL')}%`,
        `${Number(row.kpis?.cancellation_pct || 0).toLocaleString('es-CL')}%`,
        `${Number(row.kpis?.pending_pct || 0).toLocaleString('es-CL')}%`,
        (row.alerts || []).map((alert) => `[${String(alert.severity || '').toUpperCase()}] ${alert.message}`).join('\n') || 'Sin alertas'
      ]);

      autoTable(doc, {
        startY: 96,
        head: [['Local ID', 'Local', 'Pedidos', 'Cumplimiento', 'Cancelación', 'Pendientes', 'Alertas']],
        body: bodyRows,
        styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [201, 134, 42], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 52 },
          1: { cellWidth: 130 },
          2: { cellWidth: 70 },
          3: { cellWidth: 90 },
          4: { cellWidth: 90 },
          5: { cellWidth: 90 },
          6: { cellWidth: 330 }
        }
      });

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      doc.save(`alertas-locales-${stamp}.pdf`);
      setNotice('Exportación de alertas locales en PDF generada.');
    } catch {
      setError('No se pudo exportar alertas locales a PDF.');
    } finally {
      // Alerts PDF export loading was deleted
    }
  };

  useEffect(() => {
    if (showUsersPanel && crmRole === 'admin') {
      fetchAuditLogs();
    }
  }, [showUsersPanel, crmRole, fetchAuditLogs]);

  useEffect(() => {
    if (showUsersPanel && crmRole === 'admin') {
      fetchAuditStats();
      fetchCrmAlerts();
      fetchFunnelStats();
      fetchAnalyticsDashboard();
    }
  }, [showUsersPanel, crmRole, fetchAnalyticsDashboard, fetchAuditStats, fetchCrmAlerts, fetchFunnelStats]);

  useEffect(() => {
    if (!crmToken) return;
    fetchReportingSuite();
  }, [crmToken, auditFromDate, auditToDate, fetchReportingSuite]);

  const createCrmUser = async () => {
    setAuthLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/users`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          email: newCrmUserEmail,
          password: newCrmUserPassword,
          role: newCrmUserRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear usuario CRM');
      setNewCrmUserEmail('');
      setNewCrmUserPassword('');
      setNewCrmUserRole('operador');
      setNotice('Usuario CRM creado correctamente.');
      fetchCrmUsers();
      fetchAuditLogs();
      fetchAuditStats();
      fetchCrmAlerts();
    } catch (createError) {
      setError(createError.message || 'No se pudo crear usuario CRM');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateCrmUser = async (id, patch) => {
    setAuthLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/crm/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar usuario CRM');
      setNotice('Usuario CRM actualizado.');
      fetchCrmUsers();
      fetchAuditLogs();
      fetchAuditStats();
      fetchCrmAlerts();
    } catch (updateError) {
      setError(updateError.message || 'No se pudo actualizar usuario CRM');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setError('');
      const query = new URLSearchParams();
      if (selectedLocalId) query.set('local_id', selectedLocalId);
      const res = await fetch(`${API_BASE_URL}/api/orders?${query.toString()}`, {
        credentials: 'include',
        headers: {
          ...(crmToken && crmToken !== 'cookie' ? { Authorization: `Bearer ${crmToken}` } : {})
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setCrmToken('');
          setCrmUser('');
          setCrmRole('');
          setOrders([]);
          throw new Error('Tu sesión CRM expiró. Vuelve a iniciar sesión.');
        }
        throw new Error('No se pudo cargar el listado de pedidos');
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message || 'Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  }, [crmToken, selectedLocalId]);

  useEffect(() => {
    if (!crmToken) return;
    fetchCrmLocals();
  }, [crmToken, fetchCrmLocals]);

  useEffect(() => {
    if (!crmToken) return;
    fetchOrders();
  }, [crmToken, fetchOrders]);

  const updateStatus = async (id, status) => {
    setNotice('');
    let cancellationReason = '';

    if (status === 'cancelado') {
      const suggested = CANCELLATION_REASON_OPTIONS.map((option) => option.value).join(', ');
      const promptValue = window.prompt(`Indica motivo de cancelacion (${suggested})`, 'cliente');
      if (promptValue === null) return;
      cancellationReason = String(promptValue || '').trim().toLowerCase();
      if (!CANCELLATION_REASON_OPTIONS.some((option) => option.value === cancellationReason)) {
        setNotice('Motivo invalido. Usa: cliente, stock, logistica, pago o error_interno.');
        return;
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: authHeaders,
      body: JSON.stringify({
        status,
        ...(cancellationReason ? { cancellation_reason: cancellationReason } : {})
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setNotice(payload.error || 'No se pudo actualizar el estado del pedido');
      return;
    }

    setNotice('Estado actualizado correctamente');
    fetchOrders();
    fetchReportingSuite();
    if (showUsersPanel && crmRole === 'admin') {
      fetchAuditLogs();
      fetchAuditStats();
      fetchCrmAlerts();
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                         o.customer_phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    nuevo: orders.filter(o => o.status === 'nuevo').length,
    confirmado: orders.filter(o => o.status === 'confirmado').length,
    entregado: orders.filter(o => o.status === 'entregado').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length,
    ticketPromedio: orders.length ? Math.round(orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length) : 0
  };



  const cancellationRate = stats.total ? Math.round((stats.cancelado / stats.total) * 100) : 0;
  const topCriticalLocals = ((localsAlertsReport?.alerts || [])
    .map((row) => {
      const redCount = (row.alerts || []).filter((alert) => alert.severity === 'red').length;
      const amberCount = (row.alerts || []).filter((alert) => alert.severity === 'amber').length;
      return {
        local_id: row.local_id,
        local_name: row.local_name,
        red_count: redCount,
        amber_count: amberCount,
        total_alerts: (row.alerts || []).length,
        first_alert: row.alerts?.[0]?.message || ''
      };
    })
    .filter((row) => row.total_alerts > 0)
    .sort((a, b) => b.red_count - a.red_count || b.amber_count - a.amber_count || b.total_alerts - a.total_alerts)
    .slice(0, 3));

  if (!crmToken) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-beige-200 shadow-premium p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-brand-100 mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="text-brand-700" />
            </div>
            <h2 className="text-2xl font-serif font-black text-stone-900">Acceso CRM</h2>
            <p className="text-stone-500 text-sm mt-2">Ingresa tus credenciales para gestionar pedidos.</p>
          </div>

          {error ? <div className="mb-3 rounded-xl bg-red-50 text-red-700 border border-red-100 p-3 text-sm font-semibold">{error}</div> : null}
          {notice ? <div className="mb-3 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 p-3 text-sm font-semibold">{notice}</div> : null}

          <form onSubmit={(e) => { e.preventDefault(); handleCrmLogin(); }} className="space-y-3">
            <input
              type="email"
              value={crmEmail}
              onChange={(e) => setCrmEmail(e.target.value)}
              placeholder="Email CRM"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="password"
              value={crmPassword}
              onChange={(e) => setCrmPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-60"
            >
              {authLoading ? 'Validando...' : 'Entrar al CRM'}
            </button>
            <button
              type="button"
              onClick={() => setShowRecover((prev) => !prev)}
              className="w-full py-2 rounded-xl bg-beige-100 text-stone-700 font-black text-sm"
            >
              {showRecover ? 'Ocultar recuperación' : 'Recuperar contraseña'}
            </button>

            {showRecover && (
              <div className="mt-3 space-y-2 rounded-xl border border-beige-200 bg-beige-100/70 p-3">
                <input
                  type="email"
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  placeholder="Email para recuperación"
                  className="w-full px-3 py-2 rounded-lg border border-beige-200"
                />
                <button
                  onClick={handleCrmPasswordRequest}
                  disabled={authLoading}
                  className="w-full py-2 rounded-lg bg-brand-700 text-white font-black text-sm disabled:opacity-60"
                >
                  Solicitar token
                </button>

                <input
                  value={recoverToken}
                  onChange={(e) => setRecoverToken(e.target.value)}
                  placeholder="Token recibido"
                  className="w-full px-3 py-2 rounded-lg border border-beige-200"
                />
                <input
                  type="password"
                  value={recoverNewPassword}
                  onChange={(e) => setRecoverNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full px-3 py-2 rounded-lg border border-beige-200"
                />
                <button
                  onClick={handleCrmPasswordReset}
                  disabled={authLoading}
                  className="w-full py-2 rounded-lg bg-yolk-500 text-brand-900 font-black text-sm disabled:opacity-60"
                >
                  Restablecer contraseña
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Cargando pedidos...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <img src="/images/RUTA_DEL_NIDO_LOGO.svg" alt="Ruta del Nido - Alimentos Naturales" className="h-14 w-auto mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-3xl font-serif font-black text-stone-900">CRM Pedidos Ruta del Nido</h2>
              <p className="text-stone-500">Gestión de pedidos, entregas y evolución de clientes</p>
              <p className="text-xs text-stone-400 mt-1">Sesión activa: {crmUser} · Rol: {crmRole || 'admin'} · Local: {selectedLocalId ? (crmLocals.find((local) => String(local.id) === String(selectedLocalId))?.name || selectedLocalId) : `todos (${crmLocalIds.length})`}</p>
            </div>
            <div className="flex items-center gap-2">
              {crmRole === 'admin' && (
                <button
                  onClick={() => {
                    setShowUsersPanel((prev) => !prev);
                    if (!showUsersPanel) {
                      fetchCrmUsers();
                      fetchAuditLogs();
                      fetchAuditStats();
                      fetchCrmAlerts();
                      fetchFunnelStats();
                      fetchAnalyticsDashboard();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-black text-sm inline-flex items-center gap-1"
                >
                  <Users size={14} /> Usuarios CRM
                </button>
              )}
              <button onClick={handleCrmLogout} className="px-4 py-2 rounded-xl bg-red-50 text-red-700 font-black text-sm inline-flex items-center gap-1">
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>



        {showUsersPanel && crmRole === 'admin' && (
          <CRMAdminPanel
            crmUsers={crmUsers}
            newCrmUserEmail={newCrmUserEmail}
            setNewCrmUserEmail={setNewCrmUserEmail}
            newCrmUserPassword={newCrmUserPassword}
            setNewCrmUserPassword={setNewCrmUserPassword}
            newCrmUserRole={newCrmUserRole}
            setNewCrmUserRole={setNewCrmUserRole}
            createCrmUser={createCrmUser}
            authLoading={authLoading}
            updateCrmUser={updateCrmUser}
            resetPasswords={resetPasswords}
            setResetPasswords={setResetPasswords}
            auditLogs={auditLogs}
            auditStats={auditStats}
            crmAlerts={crmAlerts}
            funnelStats={funnelStats}
            exportAuditCsv={exportAuditCsv}
            exportAuditPdf={exportAuditPdf}
            exportAuditVisualHtml={exportAuditVisualHtml}
            fetchAuditLogs={fetchAuditLogs}
            fetchAuditStats={fetchAuditStats}
            fetchCrmAlerts={fetchCrmAlerts}
            fetchFunnelStats={fetchFunnelStats}
            fetchAnalyticsDashboard={fetchAnalyticsDashboard}
            exportAnalyticsCsv={exportAnalyticsCsv}
            exportAnalyticsPdf={exportAnalyticsPdf}
            pdfExportLoading={pdfExportLoading}
            auditActionFilter={auditActionFilter}
            setAuditActionFilter={setAuditActionFilter}
            auditEntityFilter={auditEntityFilter}
            setAuditEntityFilter={setAuditEntityFilter}
            auditLocalFilter={auditLocalFilter}
            setAuditLocalFilter={setAuditLocalFilter}
            auditFromDate={auditFromDate}
            setAuditFromDate={setAuditFromDate}
            auditToDate={auditToDate}
            setAuditToDate={setAuditToDate}
            crmLocals={crmLocals}
            analyticsSummary={analyticsSummary}
            analyticsGeo={analyticsGeo}
            analyticsPages={analyticsPages}
            analyticsProducts={analyticsProducts}
            analyticsHeatmap={analyticsHeatmap}
            analyticsLoading={analyticsLoading}
            analyticsDraftFilters={analyticsDraftFilters}
            setAnalyticsDraftFilters={setAnalyticsDraftFilters}
            analyticsAppliedFilters={analyticsAppliedFilters}
            analyticsFilterOptions={analyticsFilterOptions}
            analyticsActiveFiltersCount={analyticsActiveFiltersCount}
            analyticsPresetName={analyticsPresetName}
            setAnalyticsPresetName={setAnalyticsPresetName}
            analyticsPresets={analyticsPresets}
            applyAnalyticsFilters={applyAnalyticsFilters}
            resetAnalyticsFilters={resetAnalyticsFilters}
            saveAnalyticsPreset={saveAnalyticsPreset}
            applyAnalyticsPreset={applyAnalyticsPreset}
            deleteAnalyticsPreset={deleteAnalyticsPreset}
          />
        )}

        <CRMStats stats={stats} cancellationRate={cancellationRate} />
        <CRMReportingSuite
          selectedLocalId={selectedLocalId}
          setSelectedLocalId={setSelectedLocalId}
          crmLocals={crmLocals}
          reportGroupBy={reportGroupBy}
          setReportGroupBy={setReportGroupBy}
          reportGranularity={reportGranularity}
          setReportGranularity={setReportGranularity}
          reportPrevPeriod={reportPrevPeriod}
          setReportPrevPeriod={setReportPrevPeriod}
          reportStatusFilter={reportStatusFilter}
          setReportStatusFilter={setReportStatusFilter}
          reportDeliverySlotFilter={reportDeliverySlotFilter}
          setReportDeliverySlotFilter={setReportDeliverySlotFilter}
          isAdminRole={isAdminRole}
          urgentMode={urgentMode}
          setUrgentMode={setUrgentMode}
          reportsLoading={reportsLoading}
          fetchReportingSuite={fetchReportingSuite}
          reportPresets={reportPresets}
          applyReportPreset={applyReportPreset}
          reportMenuItems={reportMenuItems}
          activeReportMenu={activeReportMenu}
          setActiveReportMenu={setActiveReportMenu}
          executiveReport={executiveReport}
          dailyOpsReport={dailyOpsReport}
          cancellationsReport={cancellationsReport}
          reportSemaphores={reportSemaphores}
          localsOverviewReport={localsOverviewReport}
          localsBenchmarkReport={localsBenchmarkReport}
          localOperationsReport={localOperationsReport}
          localsAlertsReport={localsAlertsReport}
          consolidatedAlertsReport={consolidatedAlertsReport}
          fetchConsolidatedAlertsReport={fetchConsolidatedAlertsReport}
          alertUpdateDrafts={alertUpdateDrafts}
          setAlertUpdateDrafts={setAlertUpdateDrafts}
          updateConsolidatedAlert={updateConsolidatedAlert}
          thresholdDrafts={thresholdDrafts}
          setThresholdDrafts={setThresholdDrafts}
          saveAlertThreshold={saveAlertThreshold}
          scheduleForm={scheduleForm}
          setScheduleForm={setScheduleForm}
          createReportSchedule={createReportSchedule}
          reportSchedules={reportSchedules}
          reportDeliveryLogs={reportDeliveryLogs}
          runReportSchedule={runReportSchedule}
          toggleReportSchedule={toggleReportSchedule}
          crmUsers={crmUsers}
          crmLocalIds={crmLocalIds}
          kpiLabel={kpiLabel}
          topCriticalLocals={topCriticalLocals}
          startShift={startShift}
          exportExecutiveReportMarkdown={exportExecutiveReportMarkdown}
          exportExecutiveReportPdf={exportExecutiveReportPdf}
          exportLocalAlertsCsv={exportLocalAlertsCsv}
          exportLocalAlertsPdf={exportLocalAlertsPdf}
          fetchLocalsAlertsReport={fetchLocalsAlertsReport}
          alertThresholds={alertThresholds}
          fetchAlertThresholds={fetchAlertThresholds}
          alertsPdfExportLoading={alertsPdfExportLoading}
          createCrmUser={createCrmUser}
          fetchCrmUsers={fetchCrmUsers}
          fetchAuditLogs={fetchAuditLogs}
          fetchAuditStats={fetchAuditStats}
          fetchCrmAlerts={fetchCrmAlerts}
          fetchFunnelStats={fetchFunnelStats}
        />

        {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-100 p-3 text-sm font-semibold">{error}</div>}
        {notice && <div className="mb-4 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 p-3 text-sm font-semibold">{notice}</div>}

        <CRMOrderManager
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filteredOrders={filteredOrders}
          updateStatus={updateStatus}
          getScheduleBadge={getScheduleBadge}
          getStatusColor={getStatusColor}
          crmRole={crmRole}
        />
      </div>
    </div>
  );
};

export default CRM;
