import { cn } from '../lib/constants';

const TESTIMONIALS = [
  {
    initials: 'MP',
    name: 'Maria P. - Las Condes',
    text: 'Se nota la diferencia desde el primer plato. La yema de los huevos es naranja de verdad, como en el campo.'
  },
  {
    initials: 'CR',
    name: 'Carlos R. - Providencia',
    text: 'No volvi al supermercado para estas categorias. El salmon llega con una frescura que no encontraba en retail.'
  },
  {
    initials: 'SL',
    name: 'Sofia L. - Nunoa',
    text: 'Pedir por WhatsApp es rapido y claro. Coordinamos despacho sin vueltas y todo llega muy bien.'
  }
];

const STATS = [
  { value: '500+', label: 'familias atendidas' },
  { value: 'SCL', label: 'despacho local' },
  { value: 'Semanal', label: 'disponibilidad' }
];

const SocialProof = ({ onOrderNow }) => (
  <section className="py-24 px-4 bg-stone-50 border-y border-stone-200">
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-16">
        <span className="text-brand-700 font-black text-xs uppercase tracking-[0.4em] block text-center">Confianza real</span>
        <h2 className="text-4xl md:text-6xl font-serif font-black text-stone-900 text-center">
          Lo que dicen quienes ya compran en <span className="text-brand-700">Ruta del Nido</span>
        </h2>
        <p className="text-center text-stone-600 font-semibold max-w-2xl mx-auto">
          Testimonios reales en zonas de Santiago, con foco en sabor, frescura y facilidad de coordinacion.
        </p>
        <div className="w-20 h-1 bg-brand-700 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={item.initials}
            className={cn(
              'bg-white rounded-3xl p-7 border border-beige-200 shadow-premium transition-all duration-300 hover:scale-105 active:scale-95 group',
              idx % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1'
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-700 text-white font-black flex items-center justify-center group-hover:bg-yolk-500 group-hover:text-brand-900 transition-colors">
                {item.initials}
              </div>
              <div>
                <p className="font-black text-stone-900">{item.name}</p>
                <div className="flex gap-0.5 text-yolk-600">
                  {[...Array(5)].map((_, i) => <span key={i}>*</span>)}
                </div>
              </div>
            </div>
            <p className="text-stone-800 leading-relaxed font-bold">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl overflow-hidden border border-beige-200 md:border-0 md:overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 text-center divide-y divide-beige-200 md:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white md:rounded-2xl md:border md:border-beige-200 py-5 px-4">
              <div className="text-4xl font-black text-brand-800">{stat.value}</div>
              <div className="text-sm text-stone-600 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onOrderNow}
          className="inline-flex items-center justify-center rounded-2xl bg-yolk-500 text-brand-900 px-8 py-4 font-black text-base hover:scale-105 active:scale-95 transition-all shadow-premium"
        >
          Pedir por WhatsApp ahora
        </button>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] font-bold text-brand-700">
          Microprueba social activa: familias en Santiago ya reciben esta semana
        </p>
      </div>
    </div>
  </section>
);

export default SocialProof;
