import { useState } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  UserCircle,
  Instagram,
  MessageSquare
} from 'lucide-react';
import { cn, INSTAGRAM_URL } from '../lib/constants';

const Nav = ({
  activeTab,
  scrollTo,
  mobileMenuOpen,
  setMobileMenuOpen,
  onGoHome,
  onOpenAlchemist,
  handleOrder,
  onOpenAccount,
  onOpenOrders,
  onOpenSubscription,
  onOpenCart
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 isolate transition-all duration-500 bg-[#fdfbf7]/90 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-3">
          <div className="flex items-center cursor-pointer group" onClick={onGoHome}>
            <div className="bg-transparent p-2 rounded-2xl transition-all duration-500">
              <img 
                src="/images/RUTA_DEL_NIDO_LOGO.svg" 
                alt="Ruta del Nido" 
                className="h-10 md:h-12 w-auto" 
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollTo('catalogo')} 
              className="text-stone-600 hover:text-brand-700 text-xs font-black uppercase tracking-[0.2em] transition-colors"
            >
              Productos
            </button>
            <button 
              onClick={() => scrollTo('suscripciones')} 
              className="text-stone-600 hover:text-brand-700 text-xs font-black uppercase tracking-[0.2em] transition-colors"
            >
              Suscripciones
            </button>
            <button 
              onClick={onOpenAlchemist} 
              className={cn(
                "text-xs font-black uppercase tracking-[0.3em] transition-all px-6 py-2.5 rounded-full border",
                activeTab === 'alquimista' 
                  ? "bg-yolk-500 border-yolk-400 text-brand-950 shadow-lg shadow-yolk-500/20" 
                  : "border-beige-200 text-stone-600 hover:bg-beige-100"
              )}
            >
              El Alquimista
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenCart}
              className="p-3 rounded-2xl border transition-all border-beige-200 bg-white hover:bg-beige-100"
              aria-label="Pedir por WhatsApp"
            >
              <MessageSquare size={20} className="text-brand-700" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="p-3 rounded-2xl border transition-all border-beige-200 bg-white hover:bg-beige-100"
              >
                <UserCircle size={20} className="text-brand-700" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 bg-white border-beige-200 text-stone-700">
                  <button onClick={() => { onOpenOrders(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-beige-100">Mis Pedidos</button>
                  <button onClick={() => { onOpenSubscription(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-beige-100">Suscripción</button>
                </div>
              )}
            </div>

            {activeTab !== 'alquimista' && (
              <button
                onClick={() => scrollTo('catalogo')}
                className="bg-yolk-500 text-brand-950 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:bg-yolk-400"
              >
                Comprar Ahora
              </button>
            )}
            
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Instagram size={18} className="group-hover:rotate-6 transition-transform" />
              Instagram
            </a>
          </div>

          <button
            className="md:hidden p-3 rounded-2xl transition-all text-stone-900 hover:bg-stone-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div className={cn(
        "md:hidden relative z-[60] overflow-hidden transition-all duration-300 bg-white border-b border-beige-200",
        mobileMenuOpen ? "max-h-[500px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        <div className="relative z-[61] p-6 space-y-2">
            <button onClick={() => { scrollTo('catalogo'); setMobileMenuOpen(false) }} className="w-full text-left py-4 text-xs font-black uppercase tracking-widest text-stone-700">Productos</button>
            <button onClick={() => { scrollTo('suscripciones'); setMobileMenuOpen(false) }} className="w-full text-left py-4 text-xs font-black uppercase tracking-widest text-stone-700">Suscripciones</button>
            <button onClick={() => { onOpenAlchemist(); setMobileMenuOpen(false) }} className={cn("w-full text-left py-4 text-xs font-black uppercase tracking-widest", activeTab === 'alquimista' ? "text-yolk-500" : "text-stone-700")}>El Alquimista</button>
            <button onClick={() => { handleOrder('Consulta General'); setMobileMenuOpen(false) }} className="w-full text-left py-4 text-xs font-black uppercase tracking-widest text-brand-500 border-t border-stone-100">WhatsApp Directo</button>
          
          <div className="pt-6 grid grid-cols-2 gap-4">
            <button onClick={() => { onOpenCart(); setMobileMenuOpen(false); }} className="relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest border-beige-200 bg-white text-stone-700">
              <MessageSquare size={20} className="text-brand-700" />
              WhatsApp
            </button>
            <button onClick={() => { onOpenAccount(); setMobileMenuOpen(false); }} className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest border-beige-200 bg-white text-stone-700">
              <UserCircle size={20} className="text-brand-700" />
              Mi Cuenta
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
