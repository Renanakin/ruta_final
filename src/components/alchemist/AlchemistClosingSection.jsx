import { ArrowRight, MessageSquare, ShoppingBag } from 'lucide-react';
import { buildWhatsAppContextUrl } from '../../lib/constants';

const scrollToStudio = () => {
  document.getElementById('alchemist-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const AlchemistClosingSection = () => (
  <section className="relative overflow-hidden bg-beige-50 px-4 py-20 sm:px-6 md:py-28">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,103,77,0.06),transparent_45%)]" />

    <div className="relative mx-auto max-w-5xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.42em] text-brand-700">Cierre de experiencia</p>
      <h2 className="mt-5 text-4xl font-serif font-black leading-[0.9] text-stone-900 sm:text-6xl md:text-7xl">
        Cocina mejor hoy,
        <span className="block italic text-brand-700">y comparte el resultado despues.</span>
      </h2>
      <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-stone-600 md:text-xl">
        El Alquimista existe para ayudarte a usar mejor lo que compras, dar forma a una receta clara y convertir una buena mesa en una historia que tambien puede inspirar a otros.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={scrollToStudio}
          className="inline-flex items-center gap-3 rounded-full bg-brand-700 px-7 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-premium-xl transition-transform hover:scale-[1.02]"
        >
          Activar mi receta
          <ArrowRight size={18} />
        </button>
        <a
          href={buildWhatsAppContextUrl('comprar productos para cocinar con El Alquimista')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.24em] text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
        >
          <ShoppingBag size={18} />
          Pedir productos
        </a>
      </div>

      <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.32em] text-white">
        <MessageSquare size={16} className="text-yolk-300" />
        Ruta del Nido • productos reales • recetas con criterio
      </div>
    </div>
  </section>
);

export default AlchemistClosingSection;
