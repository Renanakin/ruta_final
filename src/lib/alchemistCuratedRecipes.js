export const ALCHEMIST_RECIPE_AUTHOR_TYPES = ['usuario', 'admin'];
export const ALCHEMIST_RECIPE_SOURCE_CHANNELS = ['whatsapp', 'instagram', 'interno'];

export const ALCHEMIST_RECIPE_REQUIRED_FIELDS = [
  'id',
  'title',
  'description',
  'review',
  'ingredients',
  'image',
  'authorName',
  'authorType',
  'sourceChannel',
  'published',
  'featured',
  'sortOrder'
];

/**
 * Contrato final para recetas publicadas en la galeria del Alquimista.
 * Se mantiene en frontend para operacion manual inicial y migracion posterior.
 */
export const ALCHEMIST_RECIPE_CONTRACT = {
  requiredFields: ALCHEMIST_RECIPE_REQUIRED_FIELDS,
  enums: {
    authorType: ALCHEMIST_RECIPE_AUTHOR_TYPES,
    sourceChannel: ALCHEMIST_RECIPE_SOURCE_CHANNELS
  }
};

const AUTHOR_TYPE_SET = new Set(ALCHEMIST_RECIPE_AUTHOR_TYPES);
const SOURCE_CHANNEL_SET = new Set(ALCHEMIST_RECIPE_SOURCE_CHANNELS);

const RAW_ALCHEMIST_CURATED_RECIPES = [
  {
    id: 1,
    title: 'Tostada cremosa con huevo de yema intensa',
    description: 'Una receta nacida desde El Alquimista para desayunos lentos y mesas simples con productos de origen real.',
    review: 'Resena del Alquimista: balancea textura cremosa y crocante, y funciona muy bien para mesas de fin de semana.',
    ingredients: ['Huevo de Gallina Feliz Premium', 'Pan campesino', 'Mantequilla', 'Pimienta negra'],
    image: '/images/alchemist_recetas/huevo-real.png',
    authorName: 'Mesa de la Ruta',
    authorType: 'admin',
    sourceChannel: 'interno',
    published: true,
    featured: true,
    sortOrder: 1
  },
  {
    id: 2,
    title: 'Salmon dorado al sarten con hierbas suaves',
    description: 'Pensada para una cena corta entre semana, con foco en sabor limpio, coccion amable y buena presentacion.',
    review: 'Resena del Alquimista: receta muy consistente para repetir entre semana, con buena relacion tiempo-resultado.',
    ingredients: ['Salmon porcionado 500g', 'Mantequilla', 'Ajo', 'Hierbas frescas'],
    image: '/images/alchemist_recetas/salmon-real.png',
    authorName: 'Carolina R.',
    authorType: 'usuario',
    sourceChannel: 'whatsapp',
    published: true,
    featured: false,
    sortOrder: 2
  },
  {
    id: 3,
    title: 'Tabla templada de quesos del sur',
    description: 'Una idea creada para compartir, con quesos artesanales, pan tostado y contrastes simples que elevan la mesa.',
    review: 'Resena del Alquimista: destaca por facilidad de montaje y por mantener protagonismo del producto artesanal.',
    ingredients: ['Queso Chanco de Lican Ray', 'Queso Mantecoso de Pua', 'Pan tostado', 'Miel o mermelada suave'],
    image: '/images/alchemist_recetas/quesos-real.png',
    authorName: 'Equipo Ruta del Nido',
    authorType: 'admin',
    sourceChannel: 'interno',
    published: true,
    featured: false,
    sortOrder: 3
  },
  {
    id: 4,
    title: 'Salteado rustico con longaniza artesanal',
    description: 'Un plato de cocina cotidiana con alma surena, preparado desde ingredientes reales y una combinacion muy facil de repetir.',
    review: 'Resena del Alquimista: plato de alto sabor y ejecucion simple, ideal para cocina diaria con caracter sureño.',
    ingredients: ['Longaniza Artesanal de Contulmo', 'Cebolla', 'Pimientos', 'Huevos de campo'],
    image: '/images/alchemist_recetas/sarten-longaniza-real.png',
    authorName: 'Valentina M.',
    authorType: 'usuario',
    sourceChannel: 'instagram',
    published: true,
    featured: false,
    sortOrder: 4
  }
];

function assertNonEmptyString(value, fieldName, recipeId) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "${fieldName}" invalido en receta ${recipeId}`);
  }
  return value.trim();
}

function normalizeIngredients(value, recipeId) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "ingredients" invalido en receta ${recipeId}`);
  }

  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (normalized.length === 0) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "ingredients" invalido en receta ${recipeId}`);
  }

  return normalized;
}

function normalizeAlchemistRecipe(raw) {
  const recipeId = raw?.id ?? 'unknown';

  if (typeof raw?.id !== 'number' || Number.isNaN(raw.id)) {
    throw new Error('[ALCHEMIST_CONTRACT] Campo "id" invalido');
  }
  if (typeof raw?.sortOrder !== 'number' || Number.isNaN(raw.sortOrder)) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "sortOrder" invalido en receta ${recipeId}`);
  }
  if (typeof raw?.published !== 'boolean') {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "published" invalido en receta ${recipeId}`);
  }
  if (typeof raw?.featured !== 'boolean') {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "featured" invalido en receta ${recipeId}`);
  }
  if (!AUTHOR_TYPE_SET.has(raw?.authorType)) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "authorType" invalido en receta ${recipeId}`);
  }
  if (!SOURCE_CHANNEL_SET.has(raw?.sourceChannel)) {
    throw new Error(`[ALCHEMIST_CONTRACT] Campo "sourceChannel" invalido en receta ${recipeId}`);
  }

  return {
    id: raw.id,
    title: assertNonEmptyString(raw.title, 'title', recipeId),
    description: assertNonEmptyString(raw.description, 'description', recipeId),
    review: assertNonEmptyString(raw.review, 'review', recipeId),
    ingredients: normalizeIngredients(raw.ingredients, recipeId),
    image: assertNonEmptyString(raw.image, 'image', recipeId),
    authorName: assertNonEmptyString(raw.authorName, 'authorName', recipeId),
    authorType: raw.authorType,
    sourceChannel: raw.sourceChannel,
    published: raw.published,
    featured: raw.featured,
    sortOrder: raw.sortOrder
  };
}

export const ALCHEMIST_CURATED_RECIPES = RAW_ALCHEMIST_CURATED_RECIPES.map(normalizeAlchemistRecipe);

export function getPublishedAlchemistRecipes() {
  return ALCHEMIST_CURATED_RECIPES
    .filter((recipe) => recipe.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
