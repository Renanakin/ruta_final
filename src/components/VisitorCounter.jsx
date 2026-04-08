import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn, API_BASE_URL } from '../lib/constants';

const PING_KEY = 'rdn_visit_pinged';
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const fmt = (value) => (
  typeof value === 'number'
    ? value.toLocaleString('es-CL')
    : '-'
);

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!target) {
      setValue(0);
      return undefined;
    }

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

export default function VisitorCounter({ isAlchemist = false }) {
  const [data, setData] = useState({ monthly: null, total: null, period: null });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const alreadyPinged = sessionStorage.getItem(PING_KEY);

        if (!alreadyPinged) {
          sessionStorage.setItem(PING_KEY, '1');
          await fetch(`${API_BASE_URL}/api/analytics/visits/ping`, { method: 'POST' })
            .catch(() => {});
        }

        const res = await fetch(`${API_BASE_URL}/api/analytics/visits`);
        if (!res.ok) throw new Error('fetch failed');

        const json = await res.json();

        if (!cancelled) {
          setData({ monthly: json.monthly, total: json.total, period: json.period });
          setStatus('ok');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const animatedMonthly = useCountUp(data.monthly ?? 0);
  const animatedTotal = useCountUp(data.total ?? 0, 1600);

  const monthLabel = data.period
    ? `${MONTHS_ES[(data.period.month ?? 1) - 1]} ${data.period.year}`
    : '...';

  return (
    <div
      className={cn(
        'rounded-3xl border p-6 transition-all duration-500',
        isAlchemist
          ? 'bg-white/4 border-white/8 backdrop-blur-sm'
          : 'bg-brand-50/60 border-brand-200/50',
      )}
      aria-label="Contador publico de visitas a la tienda"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md',
            isAlchemist
              ? 'bg-brand-800/60 shadow-brand-900/40'
              : 'bg-brand-600 shadow-brand-600/30',
          )}
          aria-hidden="true"
        >
          🐔
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'font-serif font-bold leading-none tracking-tight',
              status === 'loading' ? 'opacity-40 animate-pulse' : '',
              isAlchemist ? 'text-white text-3xl' : 'text-brand-700 text-3xl',
            )}
            aria-live="polite"
          >
            {status === 'error' ? '-' : fmt(animatedMonthly)}
          </div>
          <div
            className={cn(
              'mt-1 text-xs font-medium',
              isAlchemist ? 'text-white/70' : 'text-stone-600',
            )}
          >
            Visitas registradas este mes · {monthLabel}
          </div>
        </div>

        <div
          className={cn(
            'hidden sm:block h-10 w-px shrink-0',
            isAlchemist ? 'bg-white/10' : 'bg-brand-200',
          )}
          aria-hidden="true"
        />

        <div className="text-right shrink-0">
          <div
            className={cn(
              'font-serif font-bold leading-none tracking-tight',
              status === 'loading' ? 'opacity-40 animate-pulse' : '',
              isAlchemist ? 'text-white text-xl' : 'text-stone-800 text-xl',
            )}
          >
            {status === 'error' ? '-' : fmt(animatedTotal)}
          </div>
          <div
            className={cn(
              'mt-1 text-[11px] font-medium',
              isAlchemist ? 'text-white/65' : 'text-stone-500',
            )}
          >
            Visitas historicas
          </div>
        </div>
      </div>

      <div
          className={cn(
            'mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed',
            isAlchemist
              ? 'border-white/8 text-white/70'
              : 'border-brand-200/50 text-stone-500',
          )}
      >
        <ShieldCheck
          size={14}
          className={cn('mt-px shrink-0', isAlchemist ? 'text-brand-400' : 'text-brand-500')}
          aria-hidden="true"
        />
        <span>
          El contador registra sesiones unicas de visita, sin recopilar datos personales.
          <strong className={isAlchemist ? ' text-white/85' : ' text-stone-700'}>
            {' '}Solo contamos, no identificamos.
          </strong>
        </span>
      </div>
    </div>
  );
}
