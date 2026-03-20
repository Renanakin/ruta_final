import {
  Lock,
  Unlock,
  ArrowRight,
  ChefHat,
  Send,
  Loader2,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/constants';

const ChefView = ({
  isChefUnlocked,
  accessCode,
  setAccessCode,
  verifyCode,
  codeError,
  chefQuery,
  setChefQuery,
  askChef,
  chefLoading,
  chefResult,
  chefFallbackText,
  chefLimitReached,
  handleOrder
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      {!isChefUnlocked ? (
        <div className="bg-white p-12 rounded-[3.5rem] shadow-premium text-center border border-stone-100 max-w-2xl mx-auto">
          <div className="bg-yolk-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Lock size={32} className="text-yolk-600" />
          </div>
          <h2 className="text-4xl font-serif font-black text-stone-900 mb-6">Acceso Exclusivo Chef IA</h2>
          <p className="text-stone-500 mb-10 font-medium">Ingresa tu código de cliente para desbloquear recetas y recomendaciones con productos naturales Ruta del Nido.</p>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Ej: NIDO2026"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
              className={cn(
                "w-full px-8 py-5 rounded-2xl text-center font-black text-2xl tracking-widest border-2 outline-none transition-all",
                codeError ? "border-red-500 bg-red-50" : "border-stone-100 bg-stone-50 focus:border-brand-500 focus:bg-white"
              )}
            />
            <button
              onClick={verifyCode}
              className="w-full bg-brand-700 text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-premium"
            >
              Desbloquear Chef <ArrowRight className="inline-block ml-2" />
            </button>
          </div>
          {codeError && <p className="text-red-500 mt-4 font-bold text-sm">Código incorrecto. Intenta de nuevo.</p>}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="text-center mb-16">
            <div className="bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-black uppercase mb-6">
              <Unlock size={14} /> Acceso Premium Cliente Ruta del Nido
            </div>
            <h2 className="text-5xl md:text-7xl font-serif font-black text-stone-900">Chef Ruta del Nido</h2>
            <p className="text-stone-500 mt-6 text-xl font-medium">Pregúntame qué tienes en tu cocina y te sugeriré recetas con huevos de campo y alimentos naturales de nuestra red.</p>
          </div>

          <div className="bg-stone-950 p-1 rounded-[3.5rem] shadow-2xl overflow-hidden">
            <div className="bg-white p-10 rounded-[3.2rem]">
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <ChefHat className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-600" />
                  <input
                    type="text"
                    placeholder="Ej: Tengo cebollas y longaniza..."
                    value={chefQuery}
                    onChange={(e) => setChefQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askChef()}
                    className="w-full pl-16 pr-8 py-6 bg-beige-50/50 rounded-3xl border border-stone-100 outline-none focus:ring-2 focus:ring-brand-500 font-bold transition-all shadow-sm"
                  />
                  <button
                    onClick={askChef}
                    disabled={chefLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-700 text-white p-4 rounded-2xl hover:bg-brand-800 transition-all disabled:opacity-50"
                  >
                    {chefLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  </button>
                </div>

                <div className={cn(
                  "min-h-[300px] p-8 rounded-3xl border border-stone-50 transition-all flex flex-col items-center justify-center text-center",
                  (chefResult || chefFallbackText) ? "bg-white/90 backdrop-blur-sm text-left items-start border-brand-100 shadow-inner" : "bg-beige-50/30"
                )}>
                  {!chefResult && !chefFallbackText && !chefLoading && (
                    <div className="max-w-sm">
                      <ChefHat size={48} className="text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 font-bold">Dime qué ingredientes tienes y te daré la mejor receta con huevos Ruta del Nido.</p>
                    </div>
                  )}
                  {chefLoading && (
                    <div className="text-center">
                      <div className="flex gap-1 justify-center mb-4">
                        <div className="w-3 h-3 bg-brand-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-brand-600 rounded-full animate-bounce delay-75"></div>
                        <div className="w-3 h-3 bg-brand-600 rounded-full animate-bounce delay-150"></div>
                      </div>
                      <span className="text-stone-400 font-black uppercase tracking-widest text-[10px]">El Chef está cocinando tu respuesta...</span>
                    </div>
                  )}
                  {chefResult && (
                    <div className="w-full">
                      {chefResult.imageUrl && (
                        <div className="mb-8 w-full h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                          <img src={chefResult.imageUrl} alt={chefResult.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                            <span className="bg-brand-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3">Receta del Nido</span>
                            <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">{chefResult.title}</h3>
                          </div>
                        </div>
                      )}

                      <div className="mb-6">
                        {!chefResult.imageUrl && (
                          <h3 className="text-3xl font-serif font-black text-brand-800">{chefResult.title}</h3>
                        )}
                        <p className="text-stone-600 mt-2 leading-relaxed text-lg">{chefResult.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-yolk-100 text-yolk-700">{chefResult.timeMinutes} min</span>
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-100 text-brand-700">{chefResult.difficulty}</span>
                        </div>
                      </div>

                      {!!chefResult.ingredients?.length && (
                        <div className="mb-6">
                          <h4 className="text-sm uppercase tracking-[0.2em] font-black text-brand-700 mb-3">Ingredientes</h4>
                          <ul className="space-y-2">
                            {chefResult.ingredients.map((item, index) => (
                              <li key={`ing-${index}`} className="flex items-start gap-2 text-stone-700">
                                <span className="w-2 h-2 rounded-full bg-yolk-500 mt-2"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!!chefResult.steps?.length && (
                        <div className="mb-6">
                          <h4 className="text-sm uppercase tracking-[0.2em] font-black text-brand-700 mb-3">Preparación</h4>
                          <div className="space-y-3">
                            {chefResult.steps.map((step, index) => (
                              <div key={`step-${index}`} className="rounded-2xl border border-brand-100 bg-white p-4">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-600 mb-1">Paso {index + 1}</div>
                                <p className="text-stone-700 leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-yolk-200 bg-yolk-50 p-4">
                          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-yolk-700 mb-1">Tip de sabor</div>
                          <p className="text-stone-700">{chefResult.flavorTip}</p>
                        </div>
                        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-700 mb-1">Tip de presentación</div>
                          <p className="text-stone-700">{chefResult.presentationTip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {chefFallbackText && !chefResult && (
                    <div className="w-full">
                      <div className="text-stone-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {chefFallbackText}
                      </div>
                      {chefLimitReached && (
                        <button onClick={() => handleOrder('Consulta Chef IA')} className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-all">
                          <MessageSquare size={18} /> Continuar en WhatsApp
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefView;
