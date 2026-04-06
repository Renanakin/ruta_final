import {
  ArrowRight,
  ChefHat,
  Instagram,
  MessageSquare,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Utensils
} from 'lucide-react';
import { INSTAGRAM_URL, buildWhatsAppContextUrl, cn } from '../../lib/constants';

const channelLabel = {
  interno: 'Curado por Ruta del Nido',
  whatsapp: 'Recibido por WhatsApp',
  instagram: 'Recibido por Instagram'
};

const authorLabel = {
  admin: 'Equipo editorial',
  usuario: 'Comunidad'
};

const ecosystemFlow = [
  {
    id: '01',
    icon: ShoppingBag,
    title: 'Producto real',
    description: 'La receta nace desde compra real en Ruta del Nido.'
  },
  {
    id: '02',
    icon: ChefHat,
    title: 'Cocina guiada',
    description: 'El Alquimista ordena ingredientes, pasos y presentacion.'
  },
  {
    id: '03',
    icon: Utensils,
    title: 'Mesa publicada',
    description: 'Se comparte por WhatsApp o Instagram y pasa curaduria manual.'
  },
  {
    id: '04',
    icon: Sparkles,
    title: 'Nueva inspiracion',
    description: 'La galeria inspira otra receta y empuja una nueva compra.'
  }
];

const AlchemistCuratedRecipesSection = ({ recipes }) => {
  const featuredRecipe = recipes.find((recipe) => recipe.featured) || recipes[0];
  const sideRecipes = recipes.filter((recipe) => recipe.id !== featuredRecipe?.id).slice(0, 3);

  return (
    <section id="alchemist-creations" className="relative overflow-hidden bg-gradient-to-b from-beige-100 via-white to-beige-50 px-4 py-20 sm:px-6 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(215,162,64,0.14),transparent_34%),radial-gradient(circle_at_92%_88%,rgba(49,100,73,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-700">Recetas creadas por El Alquimista</p>
            <h2 className="mt-4 text-3xl font-serif font-black leading-[0.95] text-stone-900 sm:text-5xl md:text-6xl">
              Esta seccion no colecciona fotos,
              <span className="block italic text-brand-700">documenta mesas que si suman.</span>
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-stone-600">
              El Alquimista explica por que una receta entra: origen real de ingredientes, utilidad de cocina y valor para inspirar a la comunidad.
            </p>

            <div className="mt-7 rounded-[2rem] border border-stone-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <img
                  src="/images/ALQUIMISTA.png"
                  alt="Alquimista guiando la curaduria"
                  className="h-16 w-16 shrink-0 object-contain"
                />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-alchemy-700">Guia del Alquimista</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    “Si un plato no enseña algo util, no entra. Esta galeria debe ayudarte a cocinar mejor y elegir mejor en tu proxima compra.”
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ecosystemFlow.map(({ id, icon: Icon, title, description }) => {
                void Icon;

                return (
                  <article key={id} className="rounded-[1.4rem] border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <Icon size={17} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">{id}</span>
                    </div>
                    <p className="mt-3 text-sm font-black text-stone-900">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">{description}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-alchemy-200 bg-alchemy-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-alchemy-700">
                  <ScrollText size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-alchemy-700">Campos obligatorios</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    Titulo, descripcion, ingredientes, autor, canal y URL de imagen validada. Sin esos campos no se publica.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildWhatsAppContextUrl('enviar foto de mi plato para Recetas creadas por El Alquimista')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-sm font-black text-brand-950 shadow-premium-xl transition-transform hover:scale-[1.02]"
              >
                <MessageSquare size={18} />
                Enviar plato por WhatsApp
                <ArrowRight size={16} />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-6 py-4 text-sm font-black text-stone-800 transition-colors hover:bg-stone-50"
              >
                <Instagram size={18} />
                Enviar plato por Instagram
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <article className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-lg">
              <img
                src="/images/ALQUIMISTA_PLATO_PREVIEW.png"
                alt="Preview de plato que se puede lograr con el Alquimista"
                className="h-52 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-alchemy-700">Preview de resultado posible</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Este tipo de resultado representa el estandar visual y culinario que buscamos cuando una receta pasa la curaduria y se publica en la galeria.
                </p>
              </div>
            </article>

            {featuredRecipe ? (
              <article className="overflow-hidden rounded-[2.4rem] border border-stone-200/80 bg-white shadow-xl">
                <img src={featuredRecipe.image} alt={featuredRecipe.title} className="h-60 w-full object-cover" />
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-alchemy-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-alchemy-700">
                      Receta destacada
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-stone-600">
                      {channelLabel[featuredRecipe.sourceChannel]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-3xl font-serif font-black leading-[1.02] text-stone-900">
                    {featuredRecipe.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{featuredRecipe.description}</p>
                  <div className="mt-4 rounded-xl border border-alchemy-200 bg-alchemy-50 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-alchemy-700">Resena del Alquimista</p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-700">{featuredRecipe.review}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {featuredRecipe.ingredients.slice(0, 4).map((ingredient) => (
                      <span key={ingredient} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-bold text-stone-700">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-stone-500">
                    {authorLabel[featuredRecipe.authorType]} • {featuredRecipe.authorName}
                  </p>
                </div>
              </article>
            ) : (
              <article className="rounded-[2.4rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                <p className="text-2xl font-serif font-black text-stone-900">Todavia no hay recetas publicadas.</p>
                <p className="mt-2 text-sm font-semibold text-stone-600">
                  Apenas se aprueben nuevas mesas, apareceran aqui con sus ingredientes y contexto.
                </p>
              </article>
            )}

            {sideRecipes.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sideRecipes.map((recipe) => (
                  <article key={recipe.id} className="overflow-hidden rounded-[1.9rem] border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <img src={recipe.image} alt={recipe.title} className="h-40 w-full object-cover" />
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(
                          'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em]',
                          recipe.authorType === 'usuario'
                            ? 'bg-alchemy-100 text-alchemy-800'
                            : 'bg-brand-100 text-brand-700'
                        )}>
                          {recipe.authorType === 'usuario' ? 'Comunidad' : 'Equipo'}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">
                          {recipe.sourceChannel}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-serif font-black leading-tight text-stone-900">{recipe.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-stone-600">{recipe.description}</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-alchemy-800 font-semibold">{recipe.review}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlchemistCuratedRecipesSection;
