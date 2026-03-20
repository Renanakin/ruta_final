import { ZodError } from 'zod';
import { chefRecipeRequestSchema, chefRecipeSchema } from './chef.schemas.js';
import { buildChefRecipePrompt } from './chef.prompt.js';
import { AlchemistProviderError, AlchemistValidationError } from '../errors.js';
import { parseJsonObjectFromText } from '../json.js';

const buildImageUrl = (imagePrompt) => {
  const encodedPrompt = encodeURIComponent(imagePrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;
};

export const createChefService = ({ textGenerator, logger } = {}) => {
  if (!textGenerator || typeof textGenerator.generateText !== 'function') {
    throw new Error('createChefService requiere un textGenerator con generateText().');
  }

  return {
    async generateRecipe(input) {
      let request;

      try {
        request = chefRecipeRequestSchema.parse(input);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new AlchemistValidationError('Solicitud invalida para El Alquimista.', error.flatten());
        }

        throw error;
      }

      const prompt = buildChefRecipePrompt(request);

      const rawText = await textGenerator.generateText(prompt, {
        feature: 'chef_recipe',
        locale: request.locale,
      });

      const parsedPayload = parseJsonObjectFromText(rawText);

      let recipe;
      try {
        recipe = chefRecipeSchema.parse(parsedPayload);
      } catch (error) {
        if (error instanceof ZodError) {
          logger?.warn?.(
            {
              feature: 'chef_recipe',
              validation: error.flatten(),
              payloadPreview: parsedPayload,
            },
            'El proveedor de IA devolvio una receta con forma invalida',
          );

          throw new AlchemistProviderError('La IA devolvio una receta incompleta o invalida.', error.flatten());
        }

        throw error;
      }

      return {
        ...recipe,
        imageUrl: buildImageUrl(recipe.imagePrompt),
      };
    },
  };
};
