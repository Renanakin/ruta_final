import { Home, ShoppingBag, Sparkles, Sprout, Star, Utensils } from 'lucide-react';
import { buildWhatsAppContextUrl, cn } from '../../lib/constants';

const pillars = [
  { title: 'Huevos de autor', sub: 'Ruta del Nido', icon: Sprout, tone: 'text-brand-600' },
  { title: 'Mares de Chile', sub: 'Salmon y mariscos', icon: Utensils, tone: 'text-brand-600' },
  { title: 'Quesos del sur', sub: 'Artesanales', icon: Star, tone: 'text-yolk-600' },
  { title: 'Tu despensa', sub: 'Lo que ya tienes', icon: Home, tone: 'text-stone-600' }
];

const recipeIdeas = [
  {
    title: 'Tortilla cremosa con yema naranja',
    product: 'Huevo de Gallina Feliz Premium',
    proof: 'Muy pedida para desayunos y rutina semanal.'
  },
  {
    title: 'Salmon al sarten con ajo y mantequilla',
    product: 'Salmon porcionado 500g',
    proof: 'Top para cenas rapidas con calidad.'
  },
  {
    title: 'Tabla templada para compartir',
    product: 'Queso Mantecoso de Pua',
    proof: 'Elegida para reuniones y fines de semana.'
  },
  {
    title: 'Salteado rustico con vegetales',
    product: 'Longaniza Artesanal de Contulmo',
    proof: 'Alta recompra por sabor y practicidad.'
  }
];

const AlchemistPantrySection = () => (
  <section className="relative overflow-hidden bg-beige-50 px-4 py-20 sm:px-6 md:py-28">
    <div className="absolute right-0 top-0 h-[32rem] w-[32rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-yolk-500/10 blur-[120px]" />

    <div className="relative mx-auto max-w-7xl">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-brand-700">Origen + criterio</p>
          <h2 className="mt-4 text-3xl font-serif font-black leading-[0.96] text-stone-900 sm:text-5xl md:text-6xl">
            Tu cocina no parte de cero.
            <span className="block italic text-brand-700">Parte de buenos ingredientes.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            El valor del Alquimista no es inventar por inventar. Es ayudarte a usar mejor lo que compraste y lo que ya tienes, con una receta que respete tiempos, sabor y realidad de cocina.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pillars.map(({ title, sub, icon: Icon, tone }) => {
              void Icon;

              return (
                <article key={title} className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-beige-50 shadow-sm', tone)}>
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-2xl font-serif font-black text-stone-900">{title}</h3>
                  <p className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] text-stone-500">{sub}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white shadow-premium-xl">
            <img
              src="/images/alchemist_ai/southern_ingredients.png"
              alt="Ingredientes seleccionados de Ruta del Nido"
              className="h-[28rem] w-full object-cover md:h-[34rem]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] border border-white/10 bg-white/92 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-yolk-500">
                <Sparkles size={15} />
                <Sparkles size={15} />
                <Sparkles size={15} />
              </div>
              <p className="mt-4 text-xl font-serif font-black italic leading-tight text-stone-900 md:text-2xl">
                “La mejor receta es la que convierte buenos productos en una mesa que si quieres repetir.”
              </p>
              <p className="mt-4 text-sm font-semibold text-stone-600">
                El Alquimista prioriza productos reales, combinaciones posibles y una presentacion que eleva la experiencia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[2.5rem] border border-brand-100 bg-white p-6 shadow-lg md:p-8">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-700">Recetas accionables</p>
          <h3 className="mt-3 text-2xl font-serif font-black text-stone-900 md:text-3xl">
            Inspiracion real para pedir y cocinar en el mismo recorrido
          </h3>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {recipeIdeas.map((recipe) => (
            <article key={recipe.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-black text-stone-900">{recipe.title}</p>
              <p className="mt-1 text-sm font-semibold text-stone-600">{recipe.product}</p>
              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">{recipe.proof}</p>
              <a
                href={buildWhatsAppContextUrl(`pedido de ${recipe.product}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-brand-950 transition-colors hover:bg-[#20ba5a]"
              >
                <ShoppingBag size={16} />
                Pedir este producto
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AlchemistPantrySection;
