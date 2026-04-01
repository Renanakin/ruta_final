import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChefHat,
  Loader2,
  Sparkles,
  Zap,
  MessageSquare,
  Utensils,
  BookOpen,
  Sprout,
  ShoppingBag,
  Home,
  Star,
  Clock,
  Flame,
  Lightbulb,
  PanelTop,
  Key
} from 'lucide-react';
import { cn, WHATSAPP_NUMBER } from '../lib/constants';
import ExclusiveAccess from './ExclusiveAccess';

const containerVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15
    }
  }
};

const itemVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  }
};

const imageVariant = {
  hidden: { opacity: 0, scale: 1.1, filter: 'grayscale(100%)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'grayscale(0%)',
    transition: { duration: 1.2, ease: "easeOut" }
  }
};

const AlchemistViewAnimated = ({
  isChefUnlocked,
  validateLogic,
  onUnlockSuccess,
  chefQuery,
  setChefQuery,
  askChef,
  chefLoading,
  chefResult,
  chefFallbackText,
  chefFallbackActionable,
  resetChef
}) => {
  useEffect(() => {
    if (isChefUnlocked) {
      setTimeout(() => {
        const element = document.getElementById('receta-menu-alquimista');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
          document.getElementById('alchemist-ingredients-input')?.focus();
        }, 800);
      }, 300);
    }
  }, [isChefUnlocked]);

  const particles = useMemo(() =>
    [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dx: `${(Math.random() - 0.5) * 200}px`,
      dy: `${-Math.random() * 400}px`,
      duration: `${4 + Math.random() * 6}s`,
      delay: `${Math.random() * 5}s`
    }))
  , []);

  return (
    <div className="min-h-screen bg-beige-100 text-stone-900 selection:bg-yolk-500 selection:text-brand-950 font-sans">
      
      {/* --- HERO: EL ALQUIMISTA Y LOS PRODUCTOS --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20 sm:pt-32 pb-16 sm:pb-20 bg-beige-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/alchemist_ai/southern_hero.png" 
            alt="Fogón de la Ruta" 
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-beige-100/10 via-transparent to-beige-100"></div>
          
          {/* Ambient Particles */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
             {particles.map((p) => (
               <div
                 key={p.id}
                 className="absolute w-1 h-1 bg-yolk-400 rounded-full animate-particle"
                 style={{
                   left: p.left,
                   top: p.top,
                   '--dx': p.dx,
                   '--dy': p.dy,
                   '--duration': p.duration,
                   animationDelay: p.delay
                 }}
               />
             ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-brand-200 text-brand-700 px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.4em] mb-10 shadow-xl">
            <Sparkles size={16} className="animate-pulse" /> Inteligencia Culinaria
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[11rem] font-serif font-black leading-[0.8] tracking-tighter mb-10 text-stone-900">
            Alquimia <br />
            <span className="text-brand-700 italic drop-shadow-[0_0_40px_rgba(31,59,45,0.1)]">Real.</span>
          </h1>
          
          <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent mx-auto my-12 rounded-full"></div>
          
          <p className="text-base sm:text-xl md:text-3xl font-serif text-stone-600 mb-16 max-w-4xl mx-auto leading-relaxed italic">
            "Fusionamos los <span className="text-brand-700 not-italic font-black">mejores tesoros de nuestra ruta</span> con lo que tienes en casa para crear salud y sabor."
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => document.getElementById('despensa')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white border border-brand-100 text-stone-700 px-7 py-4 sm:px-10 sm:py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-beige-50 transition-all flex items-center gap-3 shadow-sm"
            >
              <ShoppingBag size={18} /> Nuestra Despensa
            </button>
            <button
              onClick={() => document.getElementById('ritual')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-700 text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-premium-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
            >
              <ChefHat size={18} /> Iniciar Receta <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* --- SECTION: NUESTRA DESPENSA + TU COCINA --- */}
      <section id="despensa" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-yolk-500/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            
            <div className="lg:col-span-6 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-brand-700">
                   <div className="w-12 h-[2px] bg-brand-500"></div> 
                   <span className="font-black text-sm uppercase tracking-[0.5em]">El Secreto del Sabor</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-7xl font-serif font-black leading-[1] text-stone-900">
                  Tus ingredientes, <br />
                  <span className="text-brand-700 italic font-medium">Nuestra Maestría.</span>
                </h2>
                <p className="text-stone-600 text-xl font-medium leading-relaxed max-w-xl">
                  El Alquimista no solo cocina; <span className="text-brand-600 font-bold underline decoration-brand-500/30 underline-offset-4">analiza la calidad</span> de los productos Ruta del Nido para ofrecerte el máximo valor nutricional posible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "Huevos de Autor", sub: "Ruta del Nido", icon: <Sprout size={24} />, color: "brand-500" },
                  { name: "Mares de Chile", sub: "Salmón & Mariscos", icon: <Utensils size={24} />, color: "brand-500" },
                  { name: "Quesos del Nido", sub: "Artesanales", icon: <Star size={24} />, color: "yolk-500" },
                  { name: "Tu Despensa", sub: "Lo que tienes en casa", icon: <Home size={24} />, color: "stone-700" }
                ].map((item, id) => (
                  <div key={id} className="p-4 sm:p-6 md:p-8 rounded-[2.5rem] bg-beige-50 border border-beige-200 hover:border-brand-500 transition-all group cursor-default shadow-sm hover:shadow-md">
                    <div className={cn("w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm", item.color === 'brand-500' ? 'text-brand-600' : (item.color === 'yolk-500' ? 'text-yolk-600' : 'text-stone-600'))}>
                      {item.icon}
                    </div>
                    <h4 className="font-serif font-black text-stone-900 text-2xl">{item.name}</h4>
                    <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-2">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
               <div className="relative aspect-square rounded-[4rem] overflow-hidden border-8 border-beige-50 shadow-premium-xl group">
                  <img src="/images/alchemist_ai/southern_ingredients.png" alt="Ingredientes Ruta del Nido" className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="p-8 md:p-10 rounded-[3rem] bg-white/95 backdrop-blur-md border border-brand-500/20 shadow-2xl">
                      <div className="flex gap-1 mb-4 text-yolk-500">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                      </div>
                      <p className="text-xl md:text-2xl font-serif font-black italic text-stone-900 leading-tight">
                        “La mejor receta es la que cuida tu cuerpo usando alimentos con origen real.”
                      </p>
                      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-stone-100">
                        <div className="w-14 h-14 rounded-full bg-brand-700 flex items-center justify-center shadow-lg">
                          <ChefHat className="text-white" size={28} />
                        </div>
                        <div>
                          <p className="text-stone-900 font-black text-sm uppercase tracking-[0.2em]">Sello Alquimista</p>
                          <p className="text-brand-600 text-xs font-black uppercase tracking-widest">Compromiso Ruta del Nido</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRANSFORMACIONES REALES --- */}
      <section className="py-32 px-6 bg-beige-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
             <span className="text-brand-600 font-black text-xs uppercase tracking-[0.6em]">Casos de Éxito</span>
             <h2 className="text-3xl sm:text-5xl md:text-8xl font-serif font-black text-stone-900 tracking-tighter">Resultados <span className="text-brand-700">Inspiradores</span></h2>
             <p className="text-stone-600 text-xl md:text-2xl max-w-3xl mx-auto font-medium italic opacity-80">Creaciones deliciosas logradas con productos de la Ruta y la sugerencia de nuestro Chef AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 1, product: "Huevos de Campo", tag: "Alquimia de Proteína" },
              { id: 2, product: "Salmón Premium", tag: "Fuego & Mares" },
              { id: 3, product: "Queso Licán Ray", tag: "Maduración Lenta" },
              { id: 4, product: "Longaniza Artesanal", tag: "Sabor del Secreto" }
            ].map((item) => (
              <div key={item.id} className="group relative aspect-[3/4] rounded-[3.5rem] overflow-hidden border border-stone-200 shadow-xl transition-all hover:scale-[1.02]">
                <img 
                   src={`/images/alchemist_ai/creations_${item.id}.png`} 
                   alt={item.product} 
                   className="w-full h-full object-cover transition duration-1000 scale-[1.01] group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent"></div>
                
                <div className="absolute bottom-10 left-10 right-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 text-white drop-shadow-lg">
                   <h4 className="text-2xl font-serif font-black mb-2">{item.product}</h4>
                   <p className="text-yolk-400 font-black text-[11px] uppercase tracking-[0.3em]">{item.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LA BÓVEDA DEL ALQUIMISTA --- */}
      <section id="ritual" className="py-32 px-6 relative overflow-hidden bg-stone-950">
        
        {/* Fondo Cinematográfico (Fotografía + Capas Oscuras) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/alchemist_ai/southern_ingredients.png" 
            alt="Preparación Artesanal" 
            className="w-full h-full object-cover blur-[8px] opacity-40 scale-105 saturate-150 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-amber-950/60 to-stone-950"></div>
          {/* Luz focal dorada */}
          <div className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] bg-amber-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none blend-screen"></div>
        </div>
        
        <div className="max-w-[85rem] mx-auto relative z-10 w-full flex flex-col items-center">
          
          <div className={cn(
            "w-full transition-all duration-1000",
            isChefUnlocked && "max-w-5xl" 
          )}>
            <div className={cn(
               "w-full transition-all duration-700 relative"
            )}>
              
              {!isChefUnlocked ? (
                <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full pt-10">
                  
                  {/* INSTRUCCIONES EXTERNAS FLOTANTES (Costado Izquierdo) */}
                  <div className="w-full max-w-sm xl:w-[26rem] order-2 xl:order-1 flex-shrink-0 p-8 md:p-10 rounded-[3rem] bg-stone-900/60 backdrop-blur-xl border border-yolk-500/20 shadow-2xl select-none space-y-10">
                    <div className="space-y-4 text-center xl:text-left">
                       <h3 className="text-3xl font-serif text-yolk-400 font-medium italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                         Magia en 3 Pasos
                       </h3>
                       <p className="text-stone-400 font-sans text-xs tracking-widest uppercase font-bold">
                         Guía para saborear nuestra tierra
                       </p>
                    </div>

                    <div className="space-y-8">
                       <div className="flex gap-5 items-start">
                         <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yolk-500/10 border border-yolk-500/30 flex items-center justify-center shadow-inner">
                           <Key className="text-yolk-400 w-5 h-5" />
                         </div>
                         <div className="space-y-1 pt-1">
                           <h4 className="text-xl font-serif text-stone-100 font-bold">1. Abre la Puerta</h4>
                           <p className="text-stone-400 font-serif leading-relaxed text-sm">Ingresa el código mágico en el letrero interactivo a tu derecha.</p>
                         </div>
                       </div>
                       
                       <div className="flex gap-5 items-start">
                         <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yolk-500/10 border border-yolk-500/30 flex items-center justify-center shadow-inner">
                           <ShoppingBag className="text-yolk-400 w-5 h-5" />
                         </div>
                         <div className="space-y-1 pt-1">
                           <h4 className="text-xl font-serif text-stone-100 font-bold">2. Dinos qué tienes</h4>
                           <p className="text-stone-400 font-serif leading-relaxed text-sm">Escríbele al Alquimista los productos que compraste o tienes en la cocina.</p>
                         </div>
                       </div>

                       <div className="flex gap-5 items-start">
                         <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yolk-500/10 border border-yolk-500/30 flex items-center justify-center shadow-inner">
                           <ChefHat className="text-yolk-400 w-5 h-5" />
                         </div>
                         <div className="space-y-1 pt-1">
                           <h4 className="text-xl font-serif text-stone-100 font-bold">3. Sorpréndete</h4>
                           <p className="text-stone-400 font-serif leading-relaxed text-sm">Presiona el botón luminoso y descubre tu receta paso a paso preparada al instante.</p>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* CUADRO DEL ALQUIMISTA - ORIGNAL E INTACTO (Costado Derecho / Centro) */}
                  <div className="w-full flex-1 max-w-2xl order-1 xl:order-2 flex justify-center">
                    <ExclusiveAccess
                      validateLogic={validateLogic}
                      onUnlockSuccess={onUnlockSuccess}
                    />
                  </div>
                </div>
              ) : (
                <div id="receta-menu-alquimista" className="p-8 md:p-16 space-y-12 bg-white/5 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[3.8rem] border border-white/10 z-10 relative mt-16 w-full">
                  
                  {/* Textos del Usuario Desbloqueado */}
                  <div className="text-center space-y-6 pb-6 border-b border-white/10">
                     <span className="text-yolk-500 font-sans text-[11px] font-black tracking-[0.4em] uppercase">Bienvenido al Santuario</span>
                     <h3 className="text-3xl md:text-5xl font-serif font-black text-stone-100 tracking-tight">Tu Bóveda <span className="text-transparent bg-clip-text bg-gradient-to-r from-yolk-300 to-amber-500 italic">Culinaria.</span></h3>
                     <p className="text-stone-400 font-serif text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
                       Combina tus exquisitos salmones, quesos artesanales o cortes rústicos de <strong className="text-stone-100">Ruta del Nido</strong> con los ingredientes de tu despensa. Elaboraremos juntos obras de arte inigualables.
                     </p>
                  </div>

                  {/* Search Input Bar */}
                  <div className="relative group mt-8">
                    <div className="absolute -inset-2 bg-gradient-to-r from-yolk-600 via-stone-400 to-amber-600 rounded-[3rem] blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
                    <div className="relative flex flex-col md:flex-row items-center bg-stone-900/80 rounded-[3rem] border border-white/10 p-2 gap-3 shadow-inner">
                       <input
                        id="alchemist-ingredients-input"
                        type="text"
                        placeholder={'Ej: Salmón Premium y mantequilla artesanal...'}
                        value={chefQuery}
                        onChange={(e) => setChefQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askChef()}
                        className="flex-1 w-full px-8 py-6 bg-transparent outline-none font-serif font-medium text-xl md:text-2xl text-stone-100 placeholder:text-stone-500/70"
                      />
                      <button
                        onClick={askChef}
                        disabled={chefLoading}
                        className="w-full md:w-auto bg-gradient-to-r from-yolk-500 to-amber-600 text-stone-900 font-bold px-12 py-6 rounded-[2.5rem] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-yolk-500/20 flex items-center justify-center gap-4 border border-yolk-400/50"
                      >
                        {chefLoading ? <Loader2 className="animate-spin text-stone-900" size={24} /> : <><Flame size={24} strokeWidth={2.5} /> Cocinar</>}
                      </button>
                    </div>
                  </div>

                  {/* Result Area */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={chefResult ? 'result' : chefFallbackText ? 'fallback' : chefLoading ? 'loading' : 'empty'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        "min-h-[400px] rounded-[3.5rem] p-10 md:p-14 transition-all duration-700 relative overflow-hidden",
                        (chefResult || chefFallbackText) ? "bg-white/90 backdrop-blur-xl border-2 border-white/50 shadow-premium-xl" : "bg-white/40 backdrop-blur-sm border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-center px-10"
                      )}
                    >
                      
                      {!chefResult && !chefFallbackText && !chefLoading && (
                        <div className="space-y-8">
                          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-stone-100">
                            <BookOpen size={40} className="text-brand-500/40" />
                          </div>
                          <p className="text-stone-500 text-2xl md:text-3xl font-serif font-medium italic">“Combina tus tesoros hoy para una receta estelar.”</p>
                        </div>
                      )}

                      {chefLoading && (
                        <div className="text-center space-y-10 py-16">
                          <div className="flex gap-4 justify-center">
                            <div className="w-5 h-5 bg-brand-600 rounded-full animate-bounce"></div>
                            <div className="w-5 h-5 bg-brand-600 rounded-full animate-bounce delay-150"></div>
                            <div className="w-5 h-5 bg-brand-600 rounded-full animate-bounce delay-300"></div>
                          </div>
                          <p className="text-brand-800 font-black uppercase tracking-[0.5em] text-xs">Destilando la magia culinaria...</p>
                          <p className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">El Alquimista está creando algo especial</p>
                        </div>
                      )}

                      {chefResult && (
                        <motion.div 
                          variants={containerVariant} 
                          initial="hidden" 
                          animate="visible" 
                          className="w-full -m-10 md:-m-14"
                        >

                          {/* Hero tipografico */}
                          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-stone-900 via-brand-950 to-stone-900 lg:-mx-14 lg:-mt-14 mb-10 shadow-premium-xl">
                            {/* Particulas atmosfericas */}
                            <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[url('/images/noise.png')] mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-stone-900/40" />
                            
                            <div className="relative z-10 p-10 md:p-20 flex flex-col items-center justify-center text-center space-y-6">
                              <motion.div variants={itemVariant} className="flex flex-wrap justify-center gap-3 mb-2">
                                {chefResult.timeMinutes && (
                                  <span className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                    <Clock size={14} className="text-brand-400" /> {chefResult.timeMinutes} MIN
                                  </span>
                                )}
                                {chefResult.difficulty && (
                                  <span className={cn(
                                    "inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md",
                                    chefResult.difficulty === 'Facil' ? "bg-green-500/20 border-green-500/30 text-green-200" :
                                    chefResult.difficulty === 'Media' ? "bg-yolk-500/20 border-yolk-500/30 text-yolk-200" :
                                    "bg-red-500/20 border-red-500/30 text-red-200"
                                  )}>
                                    <Flame size={14} /> {chefResult.difficulty}
                                  </span>
                                )}
                              </motion.div>
                              <motion.h3 
                                variants={itemVariant}
                                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-black text-amber-50 leading-[1.1] drop-shadow-2xl px-4"
                              >
                                {chefResult.title}
                              </motion.h3>
                              <motion.div variants={itemVariant} className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-60 mt-4 mx-auto rounded-full"></motion.div>
                            </div>
                          </div>

                          {/* Summary */}
                          <motion.div variants={itemVariant} className="px-8 md:px-14 pt-10 pb-8 border-b border-stone-100">
                            <p className="text-brand-800 italic text-lg md:text-2xl font-serif font-medium leading-relaxed">{chefResult.summary}</p>
                          </motion.div>

                          {/* Ingredientes + Pasos */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-100">

                            {/* Ingredientes */}
                            <div className="px-8 md:px-14 py-10 space-y-6">
                              <motion.h4 variants={itemVariant} className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.5em] text-stone-400">
                                <Sparkles size={16} className="text-brand-500" /> Ingredientes
                              </motion.h4>
                              <ul className="space-y-3">
                                {chefResult.ingredients?.map((item, i) => {
                                  const isRDN = /ruta del nido/i.test(item);
                                  return (
                                    <motion.li variants={itemVariant} key={i} className={cn(
                                      "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold border transition-all",
                                      isRDN
                                        ? "bg-yolk-50 border-yolk-200 text-yolk-900 shadow-sm shadow-yolk-500/20"
                                        : "bg-beige-50 border-stone-100 text-stone-700"
                                    )}>
                                      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", isRDN ? "bg-yolk-500" : "bg-brand-400")} />
                                      <span>{item}</span>
                                      {isRDN && (
                                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-yolk-600 bg-yolk-100 px-2 py-1 rounded-full border border-yolk-200 shrink-0">
                                          Ruta del Nido
                                        </span>
                                      )}
                                    </motion.li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Pasos */}
                            <div className="px-8 md:px-14 py-10 space-y-6">
                              <motion.h4 variants={itemVariant} className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.5em] text-stone-400">
                                <Utensils size={16} className="text-brand-500" /> El Arte del Proceso
                              </motion.h4>
                              <div className="space-y-5">
                                {chefResult.steps?.map((step, i) => (
                                  <motion.div variants={itemVariant} key={i} className="flex gap-5 group">
                                    <span className="shrink-0 w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center text-sm font-black shadow-md group-hover:scale-110 transition-transform">
                                      {i + 1}
                                    </span>
                                    <p className="text-stone-600 text-base md:text-lg font-medium leading-relaxed pt-1 group-hover:text-stone-900 transition-colors">{step}</p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Tips */}
                          {(chefResult.flavorTip || chefResult.presentationTip) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 md:px-14 py-10 border-t border-stone-100 perspective-[1000px]">
                              {chefResult.flavorTip && (
                                <motion.div 
                                  initial={{ rotateY: 90, opacity: 0, x: -50 }} 
                                  whileInView={{ rotateY: 0, opacity: 1, x: 0 }} 
                                  viewport={{ once: true, amount: 0.3 }}
                                  transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                  className="bg-brand-950 rounded-3xl p-7 space-y-3 hover:shadow-2xl hover:shadow-brand-500/30 transition-shadow duration-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-yolk-500/20 flex items-center justify-center">
                                      <Lightbulb size={18} className="text-yolk-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yolk-400">Consejo de Sabor</span>
                                  </div>
                                  <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">{chefResult.flavorTip}</p>
                                </motion.div>
                              )}
                              {chefResult.presentationTip && (
                                <motion.div 
                                  initial={{ rotateY: 90, opacity: 0, x: 50 }} 
                                  whileInView={{ rotateY: 0, opacity: 1, x: 0 }} 
                                  viewport={{ once: true, amount: 0.3 }}
                                  transition={{ duration: 0.8, delay: 0.1, type: 'spring', bounce: 0.4 }}
                                  className="bg-white border border-stone-200 rounded-3xl p-7 space-y-3 hover:shadow-xl transition-shadow duration-300"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                                      <PanelTop size={18} className="text-brand-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-600">Presentación</span>
                                  </div>
                                  <p className="text-stone-600 text-sm md:text-base font-medium leading-relaxed">{chefResult.presentationTip}</p>
                                </motion.div>
                              )}
                            </div>
                          )}

                          {/* Botón Nueva Receta */}
                          <div className="flex justify-center mt-12 mb-4">
                            <button
                              onClick={() => {
                                resetChef?.();
                                setTimeout(() => document.getElementById('alchemist-ingredients-input')?.focus(), 100);
                              }}
                              className="px-8 py-4 bg-stone-900 border border-stone-700 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-lg"
                            >
                              Ingresar Nueva Receta
                            </button>
                          </div>

                        </motion.div>
                      )}

                      {chefFallbackText && !chefResult && (
                        <div className="w-full text-center space-y-12 py-12">
                          <p className="text-stone-900 text-2xl md:text-4xl font-serif font-black italic max-w-3xl mx-auto leading-tight">
                            “{chefFallbackText}”
                          </p>
                          <div className="flex flex-col items-center gap-6">
                            {chefFallbackActionable && (
                              <button 
                                onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, necesito ayuda con una receta saludable de Ruta del Nido.')}`, '_blank')}
                                className="inline-flex items-center gap-5 bg-[#25D366] text-white px-12 py-7 rounded-full font-black text-xl shadow-premium-xl hover:scale-105 active:scale-95 transition-all"
                              >
                                <MessageSquare size={28} /> Hablar con el Alquimista
                              </button>
                            )}
                            <button
                              onClick={() => {
                                resetChef?.();
                                setTimeout(() => document.getElementById('alchemist-ingredients-input')?.focus(), 100);
                              }}
                              className="px-8 py-4 bg-transparent border border-stone-300 text-stone-600 rounded-full font-black text-sm uppercase tracking-widest hover:bg-stone-100 transition-colors"
                            >
                              Intentar de Nuevo
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- CIERRE MAGICO --- */}
      <section className="py-24 md:py-48 px-6 bg-beige-50 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <h2 className="text-4xl sm:text-6xl md:text-9xl lg:text-[12rem] font-serif font-black mb-20 leading-[0.8] tracking-tighter text-stone-900">
            Origen, Salud <br />
            <span className="text-brand-700 italic drop-shadow-[0_0_80px_rgba(31,59,45,0.05)]">& Tú.</span>
          </h2>
          <div className="flex flex-col items-center gap-10">
            <button
                onClick={() => document.getElementById('ritual')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-700 text-white px-8 py-5 sm:px-14 sm:py-8 md:px-24 md:py-12 rounded-full font-black text-base sm:text-2xl md:text-4xl uppercase tracking-widest shadow-premium-xl hover:scale-110 active:scale-95 transition-all shadow-brand-900/10"
             >
                Crear Mi Receta <ArrowRight size={40} className="inline-block ml-6" />
            </button>
            <p className="text-stone-400 font-black tracking-[1em] text-[10px] uppercase">Ruta del Nido • Alquimia de Autor</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AlchemistViewAnimated;
