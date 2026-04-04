import { Leaf, MapPin, MessageCircle, Zap, Truck, CalendarClock } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: <Leaf className="text-yolk-500 group-hover:text-brand-900 transition-colors" size={24} />,
      title: 'Mas sabor, mejor textura',
      desc: 'Huevos de campo con yema naranja real y productos seleccionados para que tu cocina diaria se note mas rica.'
    },
    {
      icon: <MapPin className="text-yolk-500 group-hover:text-brand-900 transition-colors" size={24} />,
      title: 'Origen claro, sin industria',
      desc: 'Seleccionamos por calidad, frescura y procedencia. Sin logica de supermercado ni volumen industrial.'
    },
    {
      icon: <MessageCircle className="text-yolk-500 group-hover:text-brand-900 transition-colors" size={24} />,
      title: 'Atencion cercana',
      desc: 'Pedidos por WhatsApp con acompanamiento real. Te ayudamos a elegir segun tu mesa y tu rutina.'
    },
    {
      icon: <Zap className="text-yolk-500 group-hover:text-brand-900 transition-colors" size={24} />,
      title: 'Practicidad semanal',
      desc: 'Categoria por categoria, priorizamos productos que ahorran tiempo sin sacrificar sabor ni confianza.'
    }
  ];

  return (
    <section className="py-24 px-4 bg-[#fdfbf7] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-700 font-black text-xs uppercase tracking-[0.4em] block mb-4">Por que elegir Ruta del Nido</span>
          <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950">
            No es supermercado. <br /><span className="text-yolk-500">Es origen, seleccion y sabor real.</span>
          </h2>
          <p className="mt-6 text-stone-600 text-lg max-w-2xl mx-auto font-medium">
            Reunimos huevos de campo, quesos y productos elegidos por calidad, frescura y procedencia para hacer tu compra mas clara y util.
          </p>
          <div className="w-24 h-1.5 bg-yolk-500 mx-auto mt-8 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-sm border border-brand-100 p-8 rounded-[2.5rem] shadow-xl hover:bg-white/60 transition-all hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-brand-900 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-yolk-500 transition-colors">
                {v.icon}
              </div>
              <h3 className="text-2xl font-serif font-black text-brand-950 mb-4">{v.title}</h3>
              <p className="text-stone-600 leading-relaxed text-sm font-black">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-brand-100 bg-white/80 backdrop-blur px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-stone-200 px-4 py-3 bg-stone-50">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-700 flex items-center gap-2">
                <Truck size={14} />
                Despacho local
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">Entregas en Santiago con coordinacion directa.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 px-4 py-3 bg-stone-50">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-700 flex items-center gap-2">
                <MapPin size={14} />
                Cobertura
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">Confirmacion por zona antes de cerrar tu pedido.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 px-4 py-3 bg-stone-50">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-700 flex items-center gap-2">
                <MessageCircle size={14} />
                WhatsApp directo
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">Atencion rapida para dudas, cambios y coordinacion.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 px-4 py-3 bg-stone-50">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-700 flex items-center gap-2">
                <CalendarClock size={14} />
                Disponibilidad
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">Stock y cupos actualizados por disponibilidad semanal.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
