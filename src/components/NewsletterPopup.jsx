import { Mail, X, Loader2, CheckCircle, Tag, Copy } from 'lucide-react';

const NewsletterPopup = ({ showNewsletter, setShowNewsletter, newsletterEmail, setNewsletterEmail, newsletterMsg, newsletterLoading, handleNewsletterSubmit }) => {
  if (!showNewsletter) return null;

  const dismiss = () => {
    setShowNewsletter(false);
    localStorage.setItem('rdn_newsletter_dismissed', '1');
  };

  // Success State
  if (newsletterMsg) {
    return (
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300" onClick={dismiss}>
        <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative border-4 border-brand-100 animate-in zoom-in-95 duration-300 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
           <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors" aria-label="Cerrar">
              <X size={18} />
           </button>
           
           <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-5 border-4 border-white shadow-sm">
             <CheckCircle size={32} className="text-brand-600" />
           </div>
           
           <h3 className="text-2xl font-serif font-black text-stone-900 mb-2">¡Bienvenido al Nido!</h3>
           <p className="text-stone-600 text-sm text-center mb-6 leading-relaxed">
             Copia tu código de regalo y aplícalo en el mensaje de tu primer pedido.
           </p>

           <div className="bg-stone-50 border border-stone-200 border-dashed rounded-xl w-full p-4 flex flex-col items-center justify-center gap-2 mb-6 group hover:bg-stone-100 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText('BIENVENIDO10')}>
              <span className="text-xs font-bold font-mono text-stone-500 uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-600"><Tag size={12}/> Tu código 10% dcto</span>
              <div className="flex items-center gap-2">
                 <span className="text-3xl font-black text-brand-700 font-mono tracking-tight select-all">BIENVENIDO10</span>
                 <Copy size={16} className="text-stone-400 group-hover:text-brand-600" />
              </div>
           </div>

           <button onClick={dismiss} className="w-full bg-stone-900 hover:bg-black text-white rounded-xl py-3.5 font-bold text-sm transition-transform active:scale-95 shadow-md hover:shadow-lg">
             Empezar a comprar
           </button>
        </div>
      </div>
    );
  }

  // Popup form
  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={dismiss}>
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-stone-100 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={dismiss} className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-100" aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-brand-700" />
          </div>
          <h3 className="text-2xl font-serif font-black text-stone-900">10% de descuento</h3>
          <p className="text-stone-500 text-sm mt-2">en tu primer pedido. Recibe recetas exclusivas y ofertas directamente en tu email.</p>
        </div>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
          <label htmlFor="newsletter-email" className="text-xs font-bold text-stone-700">Tu email</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="nombre@email.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            required
          />
          <button type="submit" disabled={newsletterLoading} className="w-full bg-brand-700 hover:bg-brand-800 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {newsletterLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Quiero mi descuento
          </button>
          <p className="text-[10px] text-stone-400 text-center">Sin spam. Solo lo bueno del campo.</p>
        </form>
      </div>
    </div>
  );
};

export default NewsletterPopup;
