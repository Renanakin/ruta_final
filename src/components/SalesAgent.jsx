import { Leaf, Sparkles } from 'lucide-react';

const SalesAgent = ({
  customerName, setCustomerName,
  customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress,
  salesQuery, setSalesQuery,
  askSalesAgent, salesLoading, salesResult
}) => (
  <section className="py-20 px-4 bg-beige-100/70">
    <div className="max-w-5xl mx-auto bg-beige-100 border border-brand-200 rounded-[2.5rem] p-8 md:p-12 shadow-premium">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-100 border border-brand-200 mx-auto mb-3 flex items-center justify-center animate-pulse shadow-[0_0_0_6px_rgba(26,58,26,0.08)]">
          <Leaf size={24} className="text-brand-700" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Tu Asesor Natural - Preguntame lo que necesites</h2>
        <p className="text-stone-500 mt-2 font-semibold">Respondo en segundos - Disponible 24/7</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre cliente"
          className="px-4 py-3.5 rounded-xl border border-brand-200 bg-beige-50/50 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
        />
        <input
          type="text"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Telefono cliente"
          className="px-4 py-3.5 rounded-xl border border-brand-200 bg-beige-50/50 outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
        />
      </div>

      <input
        type="text"
        value={customerAddress}
        onChange={(e) => setCustomerAddress(e.target.value)}
        placeholder="Direccion de entrega (opcional)"
        className="w-full px-4 py-3.5 rounded-xl border border-brand-200 bg-beige-50/50 outline-none focus:ring-2 focus:ring-brand-500 mb-4 transition-all font-medium"
      />

      <div className="relative">
        <input
          type="text"
          value={salesQuery}
          onChange={(e) => setSalesQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askSalesAgent()}
          placeholder="Ej: Quiero 2 bandejas de gallina libre para despacho de las 14:00"
          className="w-full pl-5 pr-32 py-4.5 rounded-2xl border border-brand-300 bg-white outline-none focus:ring-2 focus:ring-brand-500 font-bold transition-all shadow-sm"
        />
        <button
          onClick={askSalesAgent}
          disabled={salesLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 hover:bg-brand-800 transition-colors"
        >
          {salesLoading ? 'Cocinando...' : 'Consultar'}
        </button>
      </div>

      <div className="mt-6 rounded-[2rem] border border-brand-100 bg-white/80 backdrop-blur-sm p-6 md:p-8 min-h-28 shadow-inner">
        {salesResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-stone-700 whitespace-pre-wrap leading-relaxed font-medium">{salesResult}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-stone-400">
            <Sparkles size={18} className="text-brand-300" />
            <p>Aqui aparecera la respuesta de tu asesor con stock actual, disponibilidad comercial y opciones de despacho...</p>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default SalesAgent;
