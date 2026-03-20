import { describe, expect, it } from 'vitest';
import { createChefService, AlchemistProviderError } from '../../alchemist/src/index.js';

describe('Alchemist chef service', () => {
  it('extrae y valida JSON aunque venga envuelto en texto del modelo', async () => {
    const service = createChefService({
      textGenerator: {
        async generateText() {
          return `Claro, aqui va tu receta:

\`\`\`json
{
  "title": "Huevos al sarten con tomate",
  "summary": "Una receta rapida y sabrosa para desayuno o cena liviana.",
  "timeMinutes": 12,
  "difficulty": "Facil",
  "ingredients": ["3 huevos", "1 tomate grande", "Aceite de oliva"],
  "steps": ["Calienta el sarten con aceite.", "Agrega tomate picado y cocina 3 minutos.", "Incorpora los huevos y cocina hasta el punto deseado."],
  "flavorTip": "Termina con oregano seco y pimienta negra.",
  "presentationTip": "Sirve en sarten de fierro con pan tostado.",
  "imagePrompt": "A skillet of eggs with roasted tomatoes, rustic plating, natural light, highly detailed food photography"
}
\`\`\``;
        },
      },
    });

    const recipe = await service.generateRecipe({
      query: 'Una receta con huevos y tomate',
    });

    expect(recipe.title).toBe('Huevos al sarten con tomate');
    expect(recipe.timeMinutes).toBe(12);
    expect(recipe.imageUrl).toContain('pollinations');
  });

  it('rechaza payloads invalidos del proveedor', async () => {
    const service = createChefService({
      textGenerator: {
        async generateText() {
          return JSON.stringify({
            title: 'Receta rota',
            summary: 'Muy corta',
            timeMinutes: 1,
            difficulty: 'Imposible',
            ingredients: [],
            steps: [],
            flavorTip: 'x',
            presentationTip: 'y',
            imagePrompt: 'short',
          });
        },
      },
    });

    await expect(
      service.generateRecipe({
        query: 'algo',
      }),
    ).rejects.toBeInstanceOf(AlchemistProviderError);
  });
});
