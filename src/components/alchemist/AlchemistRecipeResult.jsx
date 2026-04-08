import { BookOpen, Clock, Flame, Lightbulb, MessageSquare, PanelTop, Sparkles, Utensils } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { buildWhatsAppContextUrl, cn } from '../../lib/constants';

void motion;

const containerVariant = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const difficultyTone = {
  Facil: 'bg-brand-500/15 border-brand-500/20 text-brand-100',
  Media: 'bg-yolk-500/15 border-yolk-500/20 text-yolk-100',
  Alta: 'bg-amber-700/20 border-amber-600/30 text-amber-100'
};

const AlchemistRecipeResult = ({
  chefLoading,
  chefResult,
  chefFallbackText,
  chefFallbackActionable,
  resetChef
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={chefResult ? 'result' : chefFallbackText ? 'fallback' : chefLoading ? 'loading' : 'empty'}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'min-h-[26rem] overflow-hidden rounded-[3rem] p-6 transition-all duration-500 md:p-10',
        chefResult || chefFallbackText
          ? 'border border-white/20 bg-white/92 shadow-premium-xl backdrop-blur-xl'
          : 'flex items-center justify-center border border-dashed border-white/20 bg-white/6 text-center'
      )}
    >
      {!chefResult && !chefFallbackText && !chefLoading && (
        <div className="space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-brand-500 shadow-sm">
            <BookOpen size={34} />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-serif font-medium italic text-white md:text-3xl">
              “Describe tus ingredientes y activamos una receta con criterio.”
            </p>
            <p className="mx-auto max-w-2xl text-sm font-semibold leading-relaxed text-stone-300 md:text-base">
              El resultado prioriza combinaciones posibles, productos reales y una preparacion que se sienta cocinable de verdad.
            </p>
          </div>
        </div>
      )}

      {chefLoading && (
        <div className="flex h-full flex-col items-center justify-center space-y-8 py-10 text-center">
          <div className="flex gap-3">
            <div className="h-4 w-4 animate-bounce rounded-full bg-yolk-400" />
            <div className="h-4 w-4 animate-bounce rounded-full bg-yolk-400 [animation-delay:120ms]" />
            <div className="h-4 w-4 animate-bounce rounded-full bg-yolk-400 [animation-delay:240ms]" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.46em] text-yolk-300">Destilando la receta</p>
            <p className="text-sm font-semibold text-stone-300">El Alquimista esta ordenando ingredientes, tiempos y pasos.</p>
          </div>
        </div>
      )}

      {chefResult && (
        <motion.div variants={containerVariant} initial="hidden" animate="visible" className="-m-6 md:-m-10">
          <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-brand-950 to-stone-950 px-6 py-8 md:px-10 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(226,178,54,0.18),transparent_45%)]" />
            <div className="relative z-10 text-center">
              <motion.div variants={itemVariant} className="flex flex-wrap justify-center gap-3">
                {chefResult.timeMinutes && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-white">
                    <Clock size={14} className="text-yolk-300" />
                    {chefResult.timeMinutes} min
                  </span>
                )}
                {chefResult.difficulty && (
                  <span className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em]', difficultyTone[chefResult.difficulty] || difficultyTone.Media)}>
                    <Flame size={14} />
                    {chefResult.difficulty}
                  </span>
                )}
              </motion.div>
              <motion.h3 variants={itemVariant} className="mt-5 px-2 text-3xl font-serif font-black leading-[1.02] text-amber-50 sm:text-4xl md:text-6xl">
                {chefResult.title}
              </motion.h3>
              <motion.p variants={itemVariant} className="mx-auto mt-5 max-w-3xl text-base font-serif italic leading-relaxed text-stone-200 md:text-xl">
                {chefResult.summary}
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-stone-100 lg:grid-cols-2 lg:divide-x">
            <div className="px-6 py-8 md:px-10">
              <motion.h4 variants={itemVariant} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.42em] text-stone-400">
                <Sparkles size={16} className="text-brand-500" />
                Ingredientes
              </motion.h4>
              <ul className="mt-5 space-y-3">
                {chefResult.ingredients?.map((item) => {
                  const isRouteProduct = /ruta del nido/i.test(item);
                  return (
                    <motion.li
                      variants={itemVariant}
                      key={item}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold',
                        isRouteProduct
                          ? 'border-yolk-200 bg-yolk-50 text-yolk-900'
                          : 'border-stone-100 bg-stone-50 text-stone-700'
                      )}
                    >
                      <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', isRouteProduct ? 'bg-yolk-500' : 'bg-brand-400')} />
                      <span>{item}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-stone-100 px-6 py-8 md:px-10 lg:border-t-0">
              <motion.h4 variants={itemVariant} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.42em] text-stone-400">
                <Utensils size={16} className="text-brand-500" />
                Paso a paso
              </motion.h4>
              <div className="mt-5 space-y-5">
                {chefResult.steps?.map((step, index) => (
                  <motion.div variants={itemVariant} key={`${index}-${step.slice(0, 20)}`} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-sm font-black text-white shadow-sm">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm font-medium leading-relaxed text-stone-700 md:text-base">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {(chefResult.flavorTip || chefResult.presentationTip) && (
            <div className="grid grid-cols-1 gap-4 border-t border-stone-100 px-6 py-6 md:grid-cols-2 md:px-10 md:py-8">
              {chefResult.flavorTip && (
                <motion.article variants={itemVariant} className="rounded-[2rem] bg-brand-950 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yolk-500/20 text-yolk-300">
                      <Lightbulb size={17} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.38em] text-yolk-300">Consejo de sabor</span>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-white/85 md:text-base">{chefResult.flavorTip}</p>
                </motion.article>
              )}
              {chefResult.presentationTip && (
                <motion.article variants={itemVariant} className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <PanelTop size={17} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.38em] text-brand-700">Presentacion</span>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-stone-700 md:text-base">{chefResult.presentationTip}</p>
                </motion.article>
              )}
            </div>
          )}

          <div className="flex justify-center px-6 pb-6 md:px-10 md:pb-8">
            <button
              onClick={() => {
                resetChef?.();
                setTimeout(() => document.getElementById('alchemist-ingredients-input')?.focus(), 100);
              }}
              className="rounded-full bg-stone-900 px-7 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition-colors hover:bg-stone-800"
            >
              Crear otra receta
            </button>
          </div>
        </motion.div>
      )}

      {chefFallbackText && !chefResult && (
        <div className="flex h-full flex-col items-center justify-center py-8 text-center">
          <p className="max-w-3xl text-2xl font-serif font-black italic leading-tight text-stone-900 md:text-4xl">
            “{chefFallbackText}”
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            {chefFallbackActionable && (
              <a
                href={buildWhatsAppContextUrl('continuar con El Alquimista')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-sm font-black text-brand-950 shadow-premium-xl transition-transform hover:scale-[1.02] md:text-base"
              >
                <MessageSquare size={20} />
                Continuar por WhatsApp
              </a>
            )}
            <button
              onClick={() => {
                resetChef?.();
                setTimeout(() => document.getElementById('alchemist-ingredients-input')?.focus(), 100);
              }}
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-stone-600 transition-colors hover:bg-stone-100"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </motion.div>
  </AnimatePresence>
);

export default AlchemistRecipeResult;
