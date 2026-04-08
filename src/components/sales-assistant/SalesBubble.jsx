import { Sparkles } from 'lucide-react';

const SalesBubble = ({ open, onClick, teaser }) => (
  <div className="fixed bottom-24 right-4 z-[94] flex items-end gap-3">
    {!open && teaser && (
      <div className="max-w-56 rounded-[1.5rem] rounded-br-sm border border-white/10 bg-stone-950/92 px-4 py-3 text-white shadow-xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yolk-300">Alquimista vendedor</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-100">{teaser}</p>
      </div>
    )}
    <button
      onClick={onClick}
      className="group inline-flex h-15 w-15 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-700 to-alchemy-700 text-white shadow-2xl transition-transform hover:scale-105"
      aria-label="Abrir asistente de ventas"
    >
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
        <img
          src="/images/AVATAR_CHAT.png"
          alt="Avatar del asistente de ventas"
          className="h-full w-full object-cover"
        />
        <Sparkles size={12} className="absolute right-1 top-1 text-yolk-300 drop-shadow" />
      </span>
    </button>
  </div>
);

export default SalesBubble;
