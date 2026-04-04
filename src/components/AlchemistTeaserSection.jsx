import { Sparkles, ArrowRight } from 'lucide-react';

const AlchemistTeaserSection = ({ onOpenAlchemist }) => (
  <section id="alquimista" className="py-32 px-4 bg-brand-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.05),transparent_50%)]"></div>
    <div className="max-w-6xl mx-auto rounded-[3.5rem] border border-white/5 bg-brand-900/40 backdrop-blur-3xl p-6 sm:p-12 md:p-24 shadow-2xl relative z-10 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-yolk-500/20 bg-yolk-500/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-yolk-400 mb-10">
        <Sparkles size={14} className="animate-pulse" />
        Recetas Espaciales
      </div>
      <h2 className="text-3xl sm:text-5xl md:text-8xl font-serif font-black leading-none tracking-tighter text-white">
        Deja que El Alquimista <br />
        <span className="text-yolk-500 italic">inspire tu mesa.</span>
      </h2>
      <p className="mt-8 text-lg sm:text-2xl md:text-3xl font-serif italic text-white/90 max-w-4xl mx-auto leading-[1.3]">
        Explora <span className="text-yolk-400 not-italic font-black">recetas espaciales</span> creadas con productos reales de Ruta del Nido. Descubre nuevas combinaciones y formas mas memorables de disfrutar lo que llega a tu mesa.
      </p>
      <div className="mt-14 flex flex-col items-center gap-4">
        <button
          onClick={onOpenAlchemist}
          className="bg-yolk-500 text-brand-950 px-8 py-4 sm:px-12 sm:py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yolk-500/20"
        >
          Explorar recetas espaciales <ArrowRight className="inline-block ml-2" size={18} />
        </button>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Experiencia de descubrimiento • Productos reales del catalogo</p>
      </div>
    </div>
  </section>
);

export default AlchemistTeaserSection;
