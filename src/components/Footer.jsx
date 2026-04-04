import { ArrowRight, Instagram, MessageSquare } from 'lucide-react';
import { cn, INSTAGRAM_URL, buildWhatsAppContextUrl } from '../lib/constants';
import VisitorCounter from './VisitorCounter';


const Footer = ({ scrollTo, onOpenAlchemist, handleOrder, activeTab }) => {
  const isAlchemist = activeTab === 'alquimista';

  return (
    <footer className={cn(
      "py-24 transition-all duration-500",
      isAlchemist ? "bg-brand-950 border-t border-white/5 text-white/50" : "bg-beige-100/70 border-t border-beige-200"
    )}>
      <div className="max-w-7xl mx-auto px-4 md:flex justify-between items-center gap-10">
        <div className="mb-14 md:mb-0">
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-500",
              isAlchemist ? "bg-white/10 backdrop-blur-md border border-white/5" : "bg-transparent"
            )}>
              <img 
                src="/images/RUTA_DEL_NIDO_LOGO.svg" 
                alt="Ruta del Nido" 
                className="h-12 w-auto" 
              />
            </div>
          </div>
          <p className={cn("max-w-xs font-medium text-lg leading-relaxed", isAlchemist ? "text-white/60" : "text-stone-500")}>
            Conectamos origen, nutrición y confianza para que tu hogar se alimente mejor cada semana.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-16 text-sm">
          <div>
            <p className={cn("font-black uppercase tracking-[0.3em] mb-8", isAlchemist ? "text-white/85" : "text-stone-900")}>Explorar</p>
            <ul className="space-y-5 font-bold tracking-widest uppercase text-[10px]">
              <li><button onClick={() => scrollTo('catalogo')} className="hover:text-yolk-500 transition-colors">Productos</button></li>
              <li><button onClick={() => scrollTo('suscripciones')} className="hover:text-yolk-500 transition-colors">Suscripciones</button></li>
              <li><button onClick={onOpenAlchemist} className="hover:text-yolk-500 transition-colors">El Alquimista</button></li>
            </ul>
          </div>
          <div>
            <p className={cn("font-black uppercase tracking-[0.3em] mb-8", isAlchemist ? "text-white/85" : "text-stone-900")}>Ayuda</p>
            <ul className="space-y-5 font-bold tracking-widest uppercase text-[10px]">
              <li><button onClick={() => handleOrder('Preguntas')} className="hover:text-yolk-500 transition-colors">WhatsApp</button></li>
              <li><button onClick={() => handleOrder('Soporte')} className="hover:text-yolk-500 transition-colors">Contacto</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-14">
        <div className={cn(
          "rounded-[3rem] p-8 md:p-14 text-center",
          isAlchemist ? "bg-white/5 border border-white/10" : "bg-brand-900 text-white"
        )}>
          <h2 className="font-serif font-black text-3xl md:text-5xl text-white mb-4">Haz tu pedido hoy.</h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8 font-medium leading-relaxed">
            Compra por WhatsApp, revisa la disponibilidad de esta semana y lleva a tu mesa productos con sabor real, origen claro y una experiencia más cercana.
          </p>
          <a
            href={buildWhatsAppContextUrl('pedido')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-yolk-500 text-brand-900 px-10 py-5 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-yolk-400"
          >
            <MessageSquare size={22} /> Quiero pedir ahora
          </a>
        </div>
      </div>

      {/* ── Visitor Counter ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mt-14">
        <VisitorCounter isAlchemist={isAlchemist} />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col md:flex-row items-center justify-between gap-8 rounded-[3rem] border border-white/5 bg-gradient-to-r from-brand-900 to-brand-950 p-8 md:p-12 text-white shadow-2xl hover:scale-[1.01] transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-6 relative z-10 text-center md:text-left">
            <span className="grid h-16 w-16 place-items-center rounded-[2rem] bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
              <Instagram size={32} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-yolk-400 mb-2">Comunidad del Nido</p>
              <p className="font-serif font-black text-2xl md:text-3xl leading-tight">Síguenos en Instagram para promociones y sabiduría culinaria</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-3 rounded-full bg-white text-brand-900 px-10 py-5 text-sm font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform shadow-xl relative z-10">
            Seguir <ArrowRight size={20} />
          </span>
        </a>
      </div>
      <div className={cn("text-center mt-32 text-[10px] font-bold uppercase tracking-[0.8em]", isAlchemist ? "text-white/60" : "text-stone-600")}>
        © 2026 Ruta del Nido &nbsp;•&nbsp; Diseñada, programada y desplegada por HackTeck Design
      </div>
    </footer>
  );
};

export default Footer;
