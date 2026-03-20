import { ShoppingBag, Star, Clock, Heart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: <Clock className="text-brand-700" size={24} />,
      title: "Sin intermediarios",
      desc: "Del origen a tu mano sin pasos innecesarios."
    },
    {
      icon: <Star className="text-brand-700" size={24} />,
      title: "Selección cuidadosa",
      desc: "Elegimos solo el calibre y frescura superior."
    },
    {
      icon: <ShoppingBag className="text-brand-700" size={24} />,
      title: "Frescura garantizada",
      desc: "Productos recolectados y enviados en tiempo récord."
    },
    {
      icon: <Heart className="text-brand-700" size={24} />,
      title: "Producto Real",
      desc: "Nada industrial. Alimentos honestos y nutritivos."
    }
  ];

  return (
    <section className="py-24 px-4 bg-[#fdfbf7] relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-950">
            ¿Por qué elegir <span className="text-yolk-500">Ruta del Nido?</span>
          </h2>
          <div className="w-24 h-1.5 bg-yolk-500 mx-auto mt-8 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-sm border border-brand-100 p-8 rounded-[2.5rem] shadow-xl hover:bg-white/60 transition-all hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-brand-900 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-yolk-500 transition-colors">
                <div className="text-yolk-500 group-hover:text-brand-900 transition-colors">
                  {v.icon}
                </div>
              </div>
              <h3 className="text-2xl font-serif font-black text-brand-950 mb-4">{v.title}</h3>
              <p className="text-stone-600 leading-relaxed text-sm font-black">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
