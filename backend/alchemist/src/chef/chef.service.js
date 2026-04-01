import { ZodError } from 'zod';
import { chefRecipeRequestSchema, chefRecipeSchema } from './chef.schemas.js';
import { buildChefRecipePrompt } from './chef.prompt.js';
import { AlchemistProviderError, AlchemistValidationError } from '../errors.js';
import { parseJsonObjectFromText } from '../json.js';

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

      // Evaluar la posibilidad de rechazo dictaminado por los topes de guardrails
      if (parsedPayload.refusal && typeof parsedPayload.refusal === 'string') {
        throw new AlchemistValidationError(parsedPayload.refusal, {
          field: 'refusal',
          reason: 'IA rechazó cumplir la orden por los guardrails.'
        });
      }

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

      return recipe;
    },
  };
};
