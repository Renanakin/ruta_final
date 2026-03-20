import { useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import { cn, PRICE_PLACEHOLDER } from '../lib/constants';

const formatClp = (value) => {
  if (value === null || value === undefined) return PRICE_PLACEHOLDER;
  return `$${Number(value).toLocaleString('es-CL')}`;
};

const CatalogSection = ({ products, onSelectProduct, onProductWhatsApp }) => {
  const [activeTab, setActiveTab] = useState('todos');
  
  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'huevos', label: 'Huevos' },
    { id: 'quesos', label: 'Quesos' },
    { id: 'embutidos', label: 'Embutidos' },
    { id: 'congelados', label: 'Congelados' }
  ];


  return (
    <section id="catalogo" className="py-24 px-4 bg-[#fdfbf7] relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-stone-100 to-transparent"></div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
          <div className="max-w-xl">
            <span className="text-brand-700 font-black text-xs uppercase tracking-[0.2em] mb-4 block">Línea actual</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-900 leading-tight">Variedades Seleccionadas</h2>
            <p className="text-stone-500 mt-4 text-lg italic">Cada producto ha sido curado por El Alquimista por su alma y su origen.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap",
                  activeTab === cat.id 
                    ? "bg-brand-900 text-white border-brand-900 shadow-md scale-105" 
                    : "bg-white text-stone-500 border-stone-200 hover:border-brand-300 hover:shadow-sm"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-16">
          {categories.filter(c => c.id !== 'todos').map(cat => {
            const categoryProducts = products.filter(p => p.category === cat.id);
            if (activeTab !== 'todos' && activeTab !== cat.id) return null;
            if (categoryProducts.length === 0) return null;

            return (
              <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {activeTab === 'todos' && (
                  <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-serif font-black text-stone-900">{cat.label}</h3>
                    <div className="h-px flex-1 bg-stone-200"></div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
                  {categoryProducts.map((p) => (
                    <div key={p.id} className="group flex flex-col">
                      <div className="relative aspect-[4/5] rounded-[2.25rem] overflow-hidden bg-stone-100 mb-7">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" width={800} height={1000} loading="lazy" />
                        <div className="absolute top-5 left-5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-black text-stone-900 shadow-premium">
                          {p.badge}
                        </div>
                      </div>

                      <div className="px-1">
                        <h3 className="text-xl font-serif font-black text-stone-900 mb-2">{p.name}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed mb-4 font-medium">{p.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={cn('text-xs font-black px-3 py-1 rounded-full', p.inStock ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                            {p.inStock ? 'En stock' : 'Próximamente'}
                          </span>
                          <span className="text-xs text-stone-500 font-semibold">Del campo directo a tu mesa</span>
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-stone-100">
                          <div>
                            <span className="text-xl sm:text-2xl md:text-3xl font-black text-brand-950 leading-tight">{formatClp(p.price)}</span>
                            <span className="text-[11px] text-stone-500 block font-black uppercase tracking-widest mt-1">
                              {p.price ? 'Precio vigente' : 'Lanzamiento próximo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectProduct(p)}
                              className="px-4 py-2 rounded-xl border border-brand-200 text-brand-700 font-bold text-sm hover:bg-brand-50"
                            >
                              Detalle
                            </button>
                            <button
                              onClick={() => onProductWhatsApp(p.name)}
                              className="bg-brand-700 hover:bg-brand-800 text-white p-4 rounded-3xl shadow-premium transition-all active:scale-90"
                              aria-label={`Pedir ${p.name} por WhatsApp`}
                            >
                              <ShoppingBasket size={22} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
