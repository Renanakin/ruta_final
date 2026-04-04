import { Sparkles, Clock } from 'lucide-react';
import { buildWhatsAppContextUrl } from '../lib/constants';

const SubscriptionSection = () => (
  <section
    id="suscripciones"
    className="relative mx-4 mb-20 overflow-hidden rounded-[2.5rem] border border-white/10 px-4 py-20 text-white shadow-2xl bg-brand-900"
    aria-label="Suscripciones"
  >
    <div className="absolute inset-0 -z-10">
      <img
        src="/images/MEMBRESIA.webp"
        alt="Suscripciones Ruta del Nido"
        className="h-full w-full object-cover"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-900/80 to-black/80"></div>
    </div>

    <div className="mx-auto max-w-4xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-yolk-300/40 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-yolk-300 backdrop-blur-sm">
        <Clock size={14} />
        Cupos limitados cada semana
      </span>

      <h2 className="mt-6 text-4xl font-serif font-black md:text-6xl">
        Asegura tu mesa cada mes.
      </h2>
      <p className="mt-3 text-xl font-serif italic text-yolk-400 drop-shadow-sm">
        Menos improvisacion, mas sabor real en casa.
      </p>

      <p className="mt-6 text-white/75 font-medium max-w-xl mx-auto leading-relaxed">
        Reserva tu suscripcion con cupos limitados y recibe una seleccion constante de productos frescos, honestos y listos para tu rutina.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-yolk-300">Continuidad</p>
          <p className="mt-1 text-sm font-semibold text-white/90">Tu mesa resuelta cada mes, con menos improvisacion.</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-yolk-300">Coordinacion</p>
          <p className="mt-1 text-sm font-semibold text-white/90">Atencion directa por WhatsApp para ajustar tu pedido.</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] font-black text-yolk-300">Despacho local</p>
          <p className="mt-1 text-sm font-semibold text-white/90">Cobertura en Santiago y coordinacion por disponibilidad semanal.</p>
        </div>
      </div>

      <div className="mt-10">
        <a
          href={buildWhatsAppContextUrl('suscripciones y pedidos')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yolk-500 text-brand-900 px-12 py-6 rounded-[2rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-premium hover:bg-yolk-400"
        >
          Quiero asegurar mi cupo
        </a>
      </div>

      <p className="mt-8 text-white/60 font-bold tracking-wide text-sm">
        <Sparkles className="inline-block mr-1.5 text-yolk-400" size={14} />
        Familias de Santiago repiten por la continuidad, el sabor y la atencion cercana.
      </p>
    </div>

    {/*
      Sistema de suscripciones original desactivado por estrategia comercial.
      Mantener esta seccion como teaser no interactivo hasta nueva activacion.
    */}
  </section>
);

export default SubscriptionSection;
