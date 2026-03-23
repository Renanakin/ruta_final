import { GoogleGenerativeAI } from '@google/generative-ai';
import { AlchemistConfigurationError, AlchemistProviderError } from '../errors.js';

export const createGeminiTextGenerator = ({
  apiKey,
  model = 'gemini-2.5-flash',
  generationConfig,
} = {}) => {
  if (!apiKey) {
    throw new AlchemistConfigurationError('GEMINI_API_KEY no esta configurada para El Alquimista.');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const generativeModel = client.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
      ...generationConfig,
    },
  });

  return {
    async generateText(prompt) {
      try {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        throw new AlchemistProviderError('Fallo la comunicacion con Gemini.', {
          cause: error.message,
        });
      }
    },
  };
};
