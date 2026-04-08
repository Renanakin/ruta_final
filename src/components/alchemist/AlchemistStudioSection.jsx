import { useEffect } from 'react';
import { ArrowRight, ChefHat, Flame, KeyRound, ScrollText, Sparkles } from 'lucide-react';
import ExclusiveAccess from '../ExclusiveAccess';
import AlchemistRecipeResult from './AlchemistRecipeResult';

const AlchemistStudioSection = ({
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
    if (!isChefUnlocked) return;

    setTimeout(() => {
      document.getElementById('alchemist-recipe-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        document.getElementById('alchemist-ingredients-input')?.focus();
      }, 500);
    }, 250);
  }, [isChefUnlocked]);

  return (
    <section id="alchemist-studio" className="relative overflow-hidden bg-stone-950 px-4 py-22 sm:px-6 md:py-32">
      <div className="absolute inset-0">
        <img
          src="/images/alchemist_ai/southern_vault.png"
          alt="Boveda del Alquimista"
          className="h-full w-full object-cover opacity-20 animate-fog"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-950/85 to-stone-950" />
        <div className="absolute left-1/2 top-[28%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-amber-600/18 blur-[130px]" />
        <div className="absolute right-[8%] top-[14%] h-40 w-40 rounded-full bg-brand-500/20 blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-yolk-300">La boveda del Alquimista</p>
          <h2 className="mt-4 text-3xl font-serif font-black leading-[0.95] text-white sm:text-5xl md:text-7xl">
            Activa tu acceso y cocina
            <span className="block italic text-yolk-300">con una receta guiada.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-300 md:text-lg">
            Aqui sucede el tramo central de la experiencia: desbloqueas el acceso, describes tu despensa y recibes una receta pensada para una mesa real.
          </p>
          <div className="mt-6 inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/8 px-5 py-3 backdrop-blur-md">
            <img
              src="/images/ALQUIMISTA.png"
              alt="Avatar del Alquimista"
              className="h-10 w-10 rounded-full object-cover border border-yolk-400/50"
            />
            <p className="text-xs font-bold tracking-wide text-stone-200">
              “No cocino para impresionar. Cocino para que quieras repetir.”
            </p>
          </div>
        </div>

        {!isChefUnlocked ? (
          <div className="mt-14 grid grid-cols-1 items-center gap-8 xl:grid-cols-[1.1fr_1.35fr]">
            <article className="rounded-[3rem] border border-white/10 bg-white/8 p-7 shadow-3xl backdrop-blur-2xl md:p-9">
              <p className="text-xs font-black uppercase tracking-[0.42em] text-yolk-300">Antes de entrar</p>
              <h3 className="mt-4 text-3xl font-serif font-black text-white md:text-4xl">Tu acceso se abre en tres movimientos.</h3>
              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: KeyRound,
                    title: 'Abre la puerta',
                    text: 'Ingresa el codigo que habilita la experiencia exclusiva del Alquimista.'
                  },
                  {
                    icon: ScrollText,
                    title: 'Cuida el contexto',
                    text: 'Piensa en los productos que compraste y en los ingredientes que ya tienes a mano.'
                  },
                  {
                    icon: ChefHat,
                    title: 'Pide una receta util',
                    text: 'El sistema devuelve una propuesta clara, con tiempo, dificultad y pasos cocinables.'
                  }
                ].map(({ icon: Icon, title, text }) => {
                  void Icon;

                  return (
                    <div key={title} className="flex gap-4 rounded-[2rem] border border-white/8 bg-stone-950/35 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yolk-500/20 bg-yolk-500/8 text-yolk-300">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-black text-white">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-300">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <div className="flex justify-center">
              <ExclusiveAccess validateLogic={validateLogic} onUnlockSuccess={onUnlockSuccess} />
            </div>
          </div>
        ) : (
          <div id="alchemist-recipe-panel" className="mt-14 rounded-[3.5rem] border border-white/10 bg-white/6 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur-3xl md:p-8">
            <div className="rounded-[2.75rem] border border-white/8 bg-stone-950/45 p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:gap-8">
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-yolk-300">Acceso activo</p>
                    <h3 className="mt-3 text-3xl font-serif font-black leading-[0.95] text-white md:text-5xl">
                      Tu estudio
                      <span className="block italic text-yolk-300">culinario.</span>
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed text-stone-300 md:text-base">
                    Escribe ingredientes concretos, productos Ruta del Nido y alguna restriccion si la tienes. Mientras mas claro seas, mas util sera la receta.
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { icon: Sparkles, label: 'Productos reales' },
                      { icon: Flame, label: 'Pasos claros' },
                      { icon: ArrowRight, label: 'Salida accionable' }
                    ].map(({ icon: Icon, label }) => {
                      void Icon;

                      return (
                        <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/6 px-4 py-4 text-center">
                          <Icon size={18} className="mx-auto text-yolk-300" />
                          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.24em] text-stone-200">{label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-[2rem] border border-yolk-500/12 bg-yolk-500/8 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.34em] text-yolk-200">Prompt sugerido</p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-200">
                      “Tengo salmon porcionado, huevos, mantequilla, ajo y arroz. Quiero una receta para dos personas que sea rapida y se vea bien al servir.”
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-yolk-500/35 via-amber-500/20 to-brand-500/20 blur-xl" />
                    <div className="relative rounded-[2rem] border border-white/10 bg-stone-950/75 p-3 shadow-inner">
                      <label htmlFor="alchemist-ingredients-input" className="sr-only">
                        Describe los ingredientes para El Alquimista
                      </label>
                      <div className="flex flex-col gap-3">
                        <textarea
                          id="alchemist-ingredients-input"
                          value={chefQuery}
                          onChange={(e) => setChefQuery(e.target.value)}
                          placeholder="Ej: Salmon porcionado, mantequilla, ajo, huevos, queso y algo verde para terminar."
                          className="min-h-[9rem] w-full resize-none rounded-[1.6rem] border border-white/8 bg-transparent px-5 py-5 text-base font-medium leading-relaxed text-white outline-none placeholder:text-stone-500 md:text-lg"
                        />
                        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
                          <p className="text-xs font-semibold leading-relaxed text-stone-400">
                            Describe ingredientes reales y el Alquimista te devolvera una receta util, no solo inspiracional.
                          </p>
                          <button
                            onClick={askChef}
                            disabled={chefLoading}
                            aria-label="Generar receta con El Alquimista"
                            className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-yolk-400 to-amber-500 px-6 py-4 text-sm font-black uppercase tracking-[0.24em] text-stone-950 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                          >
                            <Flame size={18} />
                            Generar receta
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AlchemistRecipeResult
                    chefLoading={chefLoading}
                    chefResult={chefResult}
                    chefFallbackText={chefFallbackText}
                    chefFallbackActionable={chefFallbackActionable}
                    resetChef={resetChef}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AlchemistStudioSection;
