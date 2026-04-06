import { ArrowRight, MessageSquare, ScrollText, Sparkles } from 'lucide-react';
import { buildWhatsAppContextUrl } from '../../lib/constants';

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const AlchemistHeroSection = () => (
  <section className="relative isolate overflow-hidden bg-beige-100 px-4 pt-24 pb-18 sm:px-6 sm:pt-32 sm:pb-24">
    <div className="absolute inset-0">
      <img
        src="/images/ALQUIMISTA.png"
        alt="Avatar del Alquimista en fondo hero"
        className="h-full w-full scale-110 object-contain opacity-16"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(222,182,72,0.18),transparent_38%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-beige-100/20 via-transparent to-beige-100" />
      <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-[90px] animate-float-slow" />
      <div className="absolute -right-16 bottom-14 h-64 w-64 rounded-full bg-yolk-500/12 blur-[95px] animate-float" />
    </div>

    <div className="relative z-10 mx-auto max-w-7xl">
      <div className="inline-flex items-center gap-3 rounded-full border border-brand-200 bg-white/80 px-5 py-3 text-[11px] font-black uppercase tracking-[0.38em] text-brand-700 shadow-xl backdrop-blur-xl">
        <Sparkles size={15} className="text-yolk-500" />
        Ritual culinario guiado
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div>
          <h1 className="text-4xl font-serif font-black leading-[0.84] tracking-[-0.04em] text-stone-900 sm:text-6xl md:text-8xl">
            El Alquimista
            <br />
            <span className="italic text-brand-700">de Ruta del Nido</span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg font-serif italic leading-relaxed text-stone-600 sm:text-2xl md:text-3xl">
            Una experiencia culinaria para transformar lo que compraste y lo que tienes en casa en una receta con sabor, orden y presentacion.
          </p>

          <div className="mt-8 rounded-[2rem] border border-alchemy-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-alchemy-700">Historia viva</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              El Alquimista es el guardian del fogon de la Ruta. Su mision es unir origen, tecnica y despensa real para que cada receta tenga sentido, no solo estetica.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-alchemy-400/30 via-yolk-400/20 to-brand-500/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/70 p-3 shadow-premium-xl backdrop-blur-xl">
            <img
              src="/images/ALQUIMISTA.png"
              alt="Avatar oficial del Alquimista"
              className="h-[24rem] w-full rounded-[2.4rem] object-cover sm:h-[28rem] lg:h-[32rem]"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 text-left md:grid-cols-3">
        {[
          'Compras productos reales de Ruta del Nido.',
          'Ingresas tu codigo de acceso y describes tu despensa.',
          'Recibes una receta guiada y accionable para tu mesa.'
        ].map((point) => (
          <div key={point} className="rounded-[1.75rem] border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-md">
            <p className="text-sm font-semibold leading-relaxed text-stone-700">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
        <button
          onClick={() => scrollToId('alchemist-flow')}
          className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-black uppercase tracking-[0.26em] text-stone-800 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <ScrollText size={18} />
          Ver como funciona
        </button>
        <button
          onClick={() => scrollToId('alchemist-studio')}
          className="inline-flex items-center gap-3 rounded-full bg-brand-700 px-7 py-4 text-xs font-black uppercase tracking-[0.26em] text-white shadow-premium-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Activar mi receta
          <ArrowRight size={18} />
        </button>
        <a
          href={buildWhatsAppContextUrl('comprar productos para usar El Alquimista')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-7 py-4 text-xs font-black uppercase tracking-[0.26em] text-brand-950 shadow-premium-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquare size={18} />
          Pedir productos
        </a>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white/70" />
  </section>
);

export default AlchemistHeroSection;
