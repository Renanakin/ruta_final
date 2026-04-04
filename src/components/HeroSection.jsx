import {
  Sparkles,
  Egg,
  Truck,
  CheckSquare,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const HeroSection = ({ scrollTo, handleOrder }) => (
  <section className="relative overflow-hidden pt-24 pb-28 px-4 min-h-[85vh] flex items-center">
    <div className="absolute inset-0 z-0">
      <img src="/images/HERO_NEW.png" alt="Ruta del Nido - Origen y Frescura" className="w-full h-full object-cover" width={1920} height={1080} fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-900/40 to-stone-900/80"></div>
    </div>
    <div className="max-w-7xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 bg-yolk-500/20 border border-yolk-300/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-yolk-200 text-xs font-black uppercase tracking-widest mb-8">
        <AlertCircle size={13} /> Pedidos de la semana abiertos — stock limitado por origen
      </div>
      <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-[1.1] tracking-tight">
        Huevos y productos de campo <br />
        <span className="text-yolk-300 italic relative">
          con sabor real a tu mesa
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" preserveAspectRatio="none">
            <path d="M0 5 Q 75 0 150 5 T 300 5" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        </span>
      </h1>
      <p className="mt-6 text-base sm:text-xl text-stone-200 max-w-2xl mx-auto font-medium">
        Despacho local en Santiago, selección honesta y stock limitado cada semana. Pide hoy productos con origen real, sin lógica industrial.
      </p>

      <div className="mt-6 inline-flex flex-wrap justify-center gap-2 sm:gap-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-white text-xs sm:text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5"><Egg size={14} /> Sin lógica industrial</span>
        <span className="inline-flex items-center gap-1.5"><Truck size={14} /> Despacho local Santiago</span>
        <span className="inline-flex items-center gap-1.5"><CheckSquare size={14} /> Atención directa por WhatsApp</span>
      </div>

      <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
        <button className="bg-yolk-500 text-brand-900 px-8 py-4 sm:px-10 sm:py-5 rounded-3xl font-black text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all shadow-premium group" onClick={() => handleOrder('Consulta General')}>
          Pedir por WhatsApp ahora <MessageSquare className="inline-block ml-2" size={20} />
        </button>
        <button className="bg-transparent backdrop-blur-md border-2 border-white/35 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all" onClick={() => scrollTo('catalogo')}>
          Ver productos de esta semana <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </section>
);

export default HeroSection;
