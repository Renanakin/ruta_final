import { useMemo, useState } from 'react';

const MAP_WIDTH = 220;
const MAP_HEIGHT = 520;
const MAP_PADDING = 22;
const CHILE_BOUNDS = {
  minLat: -56.0,
  maxLat: -17.5,
  minLon: -76.5,
  maxLon: -66.0,
};

// Stylized Chile silhouette to anchor the points on a recognizable geography.
const CHILE_PATH = `
  M118 14
  C126 26,127 43,122 59
  C117 75,122 96,119 120
  C116 144,121 165,118 189
  C114 219,121 246,118 272
  C115 302,120 330,117 355
  C114 382,122 409,116 435
  C110 458,118 483,112 506
  L104 506
  C110 482,102 455,108 430
  C114 404,103 378,108 352
  C113 324,101 296,106 270
  C111 243,100 214,105 187
  C110 160,101 132,108 108
  C115 83,106 57,112 34
  C115 24,114 18,118 14
  Z
`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const projectPoint = (latitude, longitude) => {
  const lonRatio = (longitude - CHILE_BOUNDS.minLon) / (CHILE_BOUNDS.maxLon - CHILE_BOUNDS.minLon);
  const latRatio = (CHILE_BOUNDS.maxLat - latitude) / (CHILE_BOUNDS.maxLat - CHILE_BOUNDS.minLat);

  return {
    x: MAP_PADDING + clamp(lonRatio, 0, 1) * (MAP_WIDTH - MAP_PADDING * 2),
    y: MAP_PADDING + clamp(latRatio, 0, 1) * (MAP_HEIGHT - MAP_PADDING * 2),
  };
};

const formatCoordinate = (value) => Number(value || 0).toFixed(2);

const CRMGeoMap = ({ points }) => {
  const safePoints = useMemo(
    () => (points || [])
      .filter((point) => Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)))
      .map((point, index) => ({
        ...point,
        key: `${point.city || 'city'}-${point.region || 'region'}-${index}`,
      })),
    [points]
  );
  const maxIntensity = safePoints.reduce((max, point) => Math.max(max, Number(point.intensity || 0)), 1);
  const [selectedPointKey, setSelectedPointKey] = useState('');
  const [hoveredPointKey, setHoveredPointKey] = useState('');
  const selectedOrHoveredKey = hoveredPointKey || selectedPointKey;
  const activePoint = safePoints.find((point) => point.key === selectedOrHoveredKey) || safePoints[0];

  if (!safePoints.length) {
    return (
      <div className="rounded-2xl border border-beige-100 bg-stone-50 p-4">
        <p className="text-xs text-stone-400">Sin puntos geograficos suficientes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-beige-100 bg-stone-50 p-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[260px]" id="crm-analytics-geo-map">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-label="Mapa de Chile con intensidad de visitas por ciudad"
            className="h-auto w-full overflow-visible"
          >
            <defs>
              <linearGradient id="crmGeoSea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e7f4ef" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="crmGeoLand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dcebd8" />
                <stop offset="100%" stopColor="#c5dbbe" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} rx="28" fill="url(#crmGeoSea)" />

            {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
              <line
                key={`lat-${ratio}`}
                x1={18}
                x2={MAP_WIDTH - 18}
                y1={MAP_HEIGHT * ratio}
                y2={MAP_HEIGHT * ratio}
                stroke="#cbd5e1"
                strokeDasharray="4 6"
                strokeWidth="1"
              />
            ))}

            <path d={CHILE_PATH} fill="url(#crmGeoLand)" stroke="#58724f" strokeWidth="2" />

            {safePoints.map((point) => {
              const intensity = Number(point.intensity || 0);
              const ratio = Math.max(0.2, intensity / maxIntensity);
              const { x, y } = projectPoint(Number(point.latitude), Number(point.longitude));
              const radius = 4 + ratio * 11;
              const isActive = activePoint?.key === point.key;

              return (
                <g
                  key={point.key}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointKey(point.key)}
                  onMouseLeave={() => setHoveredPointKey('')}
                  onClick={() => setSelectedPointKey((current) => (current === point.key ? '' : point.key))}
                >
                  <circle cx={x} cy={y} r={radius + (isActive ? 12 : 6)} fill={isActive ? 'rgba(21, 128, 61, 0.16)' : 'rgba(180, 83, 9, 0.10)'} />
                  <circle
                    cx={x}
                    cy={y}
                    r={radius + (isActive ? 2 : 0)}
                    fill={isActive ? 'rgba(21, 128, 61, 0.88)' : 'rgba(180, 83, 9, 0.85)'}
                    stroke={isActive ? '#dcfce7' : '#fff7ed'}
                    strokeWidth={isActive ? '3' : '2'}
                  />
                  {isActive && (
                    <g>
                      <rect
                        x={Math.min(MAP_WIDTH - 90, x + 10)}
                        y={Math.max(16, y - 20)}
                        width="78"
                        height="26"
                        rx="8"
                        fill="#1f2937"
                        opacity="0.92"
                      />
                      <text x={Math.min(MAP_WIDTH - 82, x + 18)} y={Math.max(33, y - 3)} fill="#ffffff" fontSize="9" fontWeight="700">
                        {point.city || 'Sin ciudad'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-700">Mapa real de Chile</span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-stone-500">
              {safePoints.length} puntos proyectados
            </span>
            {!!selectedPointKey && (
              <button
                type="button"
                onClick={() => setSelectedPointKey('')}
                className="rounded-full border border-beige-200 bg-white px-2 py-1 text-[10px] font-black text-stone-500"
              >
                Limpiar foco
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-700/70" />
            <span>Intensidad proporcional al volumen de visitas por ciudad.</span>
          </div>

          <div className="rounded-xl border border-beige-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black text-stone-800">{activePoint.city || 'Sin ciudad'}</p>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-700">
                {activePoint.intensity} hits
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500">
              {activePoint.region || activePoint.country_code || 'Sin region'} · {formatCoordinate(activePoint.latitude)}, {formatCoordinate(activePoint.longitude)}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-stone-400">
              Haz click en un punto o una fila para fijar el foco.
            </p>
          </div>

          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {safePoints.slice(0, 8).map((point) => {
              const isActive = activePoint?.key === point.key;

              return (
                <button
                  type="button"
                  key={point.key}
                  onMouseEnter={() => setHoveredPointKey(point.key)}
                  onMouseLeave={() => setHoveredPointKey('')}
                  onClick={() => setSelectedPointKey((current) => (current === point.key ? '' : point.key))}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                    isActive ? 'border-brand-300 bg-brand-50' : 'border-beige-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-stone-800">{point.city || 'Sin ciudad'}</p>
                    <span className="rounded-full bg-yolk-100 px-2 py-0.5 text-[10px] font-black text-yolk-800">
                      {point.intensity} hits
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {point.region || point.country_code || 'Sin region'} · {formatCoordinate(point.latitude)}, {formatCoordinate(point.longitude)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMGeoMap;
