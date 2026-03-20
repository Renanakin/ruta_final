import { ArrowLeft, ShieldOff } from 'lucide-react';

const CrmUnavailableView = () => {
  const goHome = () => {
    window.history.replaceState(null, '', '/');
    window.location.assign('/');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.14),transparent_35%),linear-gradient(145deg,rgba(28,25,23,0.98),rgba(12,10,9,0.98))] p-10 md:p-14 shadow-2xl text-center">
        <div className="mx-auto mb-8 flex h-18 w-18 items-center justify-center rounded-full bg-white/5 border border-white/10">
          <ShieldOff size={36} className="text-yolk-400" />
        </div>

        <span className="inline-flex items-center rounded-full border border-yolk-400/30 bg-yolk-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-yolk-300">
          Acceso Deshabilitado
        </span>

        <h1 className="mt-6 text-4xl md:text-5xl font-serif font-black tracking-tight">
          CRM no disponible desde la web publica
        </h1>

        <p className="mt-5 text-base md:text-lg text-stone-300 leading-8">
          Esta seccion fue retirada del sitio publico y no forma parte del release actual.
          El acceso administrativo no esta habilitado desde esta web.
        </p>

        <button
          onClick={goHome}
          className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-yolk-500 px-6 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-brand-900 transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default CrmUnavailableView;
