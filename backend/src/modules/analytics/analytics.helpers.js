import crypto from 'crypto';
import net from 'net';

const MOCK_LOCATIONS = [
  { country_code: 'CL', country_name: 'Chile', region: 'Region Metropolitana', city: 'Santiago', latitude: -33.4489, longitude: -70.6693 },
  { country_code: 'CL', country_name: 'Chile', region: 'Valparaiso', city: 'Vina del Mar', latitude: -33.0245, longitude: -71.5518 },
  { country_code: 'CL', country_name: 'Chile', region: 'Biobio', city: 'Concepcion', latitude: -36.8201, longitude: -73.0444 },
  { country_code: 'CL', country_name: 'Chile', region: 'Araucania', city: 'Temuco', latitude: -38.7359, longitude: -72.5904 },
  { country_code: 'CL', country_name: 'Chile', region: 'Los Lagos', city: 'Puerto Montt', latitude: -41.4693, longitude: -72.9424 },
];

const BOT_PATTERNS = [/bot/i, /spider/i, /crawl/i, /headless/i];

export const ALLOWED_ANALYTICS_EVENTS = new Set([
  'page_view',
  'view_product',
  'create_account',
  'login',
  'newsletter_subscribe',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'ai_unlock',
  'ai_interaction',
  'subscription_interest',
  'subscription_start',
]);

const pickHeader = (req, headerName) => {
  const value = req.headers[headerName];
  return typeof value === 'string' ? value.trim() : '';
};

const shorten = (value, maxLength = 255) => String(value || '').slice(0, maxLength);

const deterministicIndex = (seed, size) => {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return hash[0] % size;
};

export const detectClientIp = (req) => {
  const forwardedFor = pickHeader(req, 'x-forwarded-for');
  const candidates = [
    ...forwardedFor.split(',').map((entry) => entry.trim()).filter(Boolean),
    pickHeader(req, 'x-real-ip'),
    req.ip,
  ].filter(Boolean);

  return candidates.find((candidate) => net.isIP(candidate)) || null;
};

export const isInternalIp = (ip) => {
  if (!ip) return false;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
};

export const maskIp = (ip) => {
  if (!ip) return null;

  if (net.isIP(ip) === 4) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  if (net.isIP(ip) === 6) {
    const parts = ip.split(':').filter(Boolean);
    return `${parts.slice(0, 4).join(':')}::`;
  }

  return null;
};

export const hashIp = (ip) => {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_IP_HASH_SALT || process.env.JWT_SECRET || 'ruta-fresca-analytics';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
};

export const normalizePayload = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const payload = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (['password', 'token', 'authorization', 'cookie', 'jwt'].includes(key.toLowerCase())) continue;
    payload[key] = value;
  }
  return payload;
};

export const buildAnonymousId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const parseDateRange = (query) => {
  const clauses = [];
  const params = [];

  if (query.from_date) {
    clauses.push('created_at >= ?');
    params.push(query.from_date);
  }

  if (query.to_date) {
    clauses.push('created_at <= ?');
    params.push(`${query.to_date} 23:59:59`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
};

export const mapEventSource = (req, bodySource) => {
  if (bodySource) return shorten(bodySource, 100);
  const referrer = pickHeader(req, 'referer');
  if (!referrer) return 'direct';
  try {
    return shorten(new URL(referrer).hostname, 100);
  } catch {
    return shorten(referrer, 100);
  }
};

export const createEventRecord = ({ req, body, geo, payload }) => ({
  event_name: body.eventName,
  event_id: body.eventId,
  user_id: body.userId || null,
  session_id: body.sessionId || null,
  anonymous_id: body.anonymousId || null,
  page_path: body.pagePath || '/',
  source: mapEventSource(req, body.source),
  referrer: shorten(pickHeader(req, 'referer') || body.referrer || '', 255) || null,
  device_type: shorten(body.deviceType || pickHeader(req, 'user-agent') || 'unknown', 255),
  os_name: shorten(body.osName || 'unknown', 120),
  ip_hash: geo?.ip_hash || null,
  ip_masked: geo?.ip_masked || null,
  country_code: geo?.country_code || null,
  country_name: geo?.country_name || null,
  region: geo?.region || null,
  city: geo?.city || null,
  latitude: geo?.latitude ?? null,
  longitude: geo?.longitude ?? null,
  meta_data: JSON.stringify(payload),
  payload: JSON.stringify(payload),
});

export const buildMockGeo = (ip) => {
  const location = MOCK_LOCATIONS[deterministicIndex(ip || 'local-dev', MOCK_LOCATIONS.length)];
  return {
    ...location,
    provider: 'mock',
  };
};

export const resolveGeoWithProvider = async (ip) => {
  const provider = process.env.ANALYTICS_GEO_PROVIDER || 'ip-api';
  const timeoutMs = Number(process.env.ANALYTICS_GEO_TIMEOUT_MS || 3000);

  if (provider !== 'ip-api' || !ip) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,lat,lon`, {
      signal: controller.signal,
    });
    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      return null;
    }

    return {
      country_code: data.countryCode || null,
      country_name: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
      latitude: data.lat ?? null,
      longitude: data.lon ?? null,
      provider,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const shouldUseMockGeo = () => {
  const mode = process.env.ANALYTICS_GEO_MODE;
  if (mode === 'mock') return true;
  if (mode === 'live') return false;
  return process.env.NODE_ENV !== 'production';
};

export const shouldSkipTracking = (req) => {
  if (process.env.NODE_ENV === 'test') {
    return { skip: false, reason: null };
  }

  const ip = detectClientIp(req);
  const userAgent = pickHeader(req, 'user-agent');
  const allowInternal = String(process.env.ANALYTICS_TRACK_INTERNAL || 'false').toLowerCase() === 'true';

  if (!allowInternal && isInternalIp(ip)) {
    return { skip: true, reason: 'internal_ip' };
  }

  if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return { skip: true, reason: 'bot_user_agent' };
  }

  return { skip: false, reason: null };
};
