import { ChefHat, KeyRound, MessageCircleMore, ShoppingBag } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: 'Compra productos de Ruta del Nido',
    description: 'La experiencia nace desde alimentos reales: huevos, quesos, salmones, mariscos o embutidos seleccionados.',
    icon: ShoppingBag
  },
  {
    id: '02',
    title: 'Ingresa tu codigo de acceso',
    description: 'El ritual de acceso valida que entraste a una experiencia reservada para esta cocina guiada.',
    icon: KeyRound
  },
  {
    id: '03',
    title: 'Describe lo que tienes en casa',
    description: 'El Alquimista mezcla tus productos y tu despensa para proponer una preparacion realista y util.',
    icon: MessageCircleMore
  },
  {
    id: '04',
    title: 'Recibe una receta clara y accionable',
    description: 'Obtienes ingredientes, pasos, tiempo, dificultad y sugerencias para que la receta se sienta cocinable de verdad.',
    icon: ChefHat
  }
];

const AlchemistFlowSection = () => (
  <section id="alchemist-flow" className="relative overflow-hidden bg-gradient-to-b from-white via-white to-beige-50 px-4 py-20 sm:px-6 md:py-28">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(52,101,74,0.08),transparent_30%),radial-gradient(circle_at_90%_95%,rgba(205,159,52,0.1),transparent_28%)]" />
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.38em] text-brand-700">Flujo guiado</p>
        <h2 className="mt-4 text-3xl font-serif font-black leading-[0.95] text-stone-900 sm:text-5xl md:text-6xl">
          Una ruta simple para cocinar
          <span className="block italic text-brand-700">con mejor criterio.</span>
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-stone-600">
          El Alquimista no reemplaza la compra ni improvisa por ti. Ordena lo que tienes, prioriza productos reales y convierte la inspiracion en una receta que se puede hacer.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ id, title, description, icon: Icon }) => {
          void Icon;

          return (
            <article
              key={id}
              className="rounded-[2rem] border border-stone-200/90 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                  <Icon size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.32em] text-stone-400">{id}</span>
              </div>
              <h3 className="mt-6 text-2xl font-serif font-black text-stone-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{description}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default AlchemistFlowSection;
