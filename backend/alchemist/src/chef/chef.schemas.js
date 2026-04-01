import { z } from 'zod';

const normalizeSingleLine = (value) => value.trim().replace(/\s+/g, ' ');

const normalizeParagraph = (value) => value.trim().replace(/\s+/g, ' ');

const normalizeListItem = (value) => value.trim().replace(/\s+/g, ' ');

export const chefRecipeRequestSchema = z.object({
  query: z.string().trim().min(3, 'La consulta debe tener al menos 3 caracteres.').max(400, 'La consulta es demasiado larga.'),
  locale: z.string().trim().min(2).max(10).optional().default('es-CL'),
});

export const chefRecipeSchema = z.object({
  title: z.string().min(3).max(160).transform(normalizeSingleLine),
  summary: z.string().min(12).max(600).transform(normalizeParagraph),
  timeMinutes: z.coerce.number().int().min(5).max(240),
  difficulty: z.enum(['Facil', 'Media', 'Dificil']),
  ingredients: z.array(z.string().min(2).max(200).transform(normalizeListItem)).min(3).max(25),
  steps: z.array(z.string().min(8).max(800).transform(normalizeParagraph)).min(3).max(15),
  flavorTip: z.string().min(8).max(400).transform(normalizeParagraph),
  presentationTip: z.string().min(8).max(400).transform(normalizeParagraph),
});
