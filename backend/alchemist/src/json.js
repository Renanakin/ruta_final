import { AlchemistProviderError } from './errors.js';

const findJsonObject = (text) => {
  const start = text.indexOf('{');
  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
};

export const parseJsonObjectFromText = (text) => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new AlchemistProviderError('El proveedor de IA devolvio una respuesta vacia.');
  }

  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonBlock = findJsonObject(cleaned);

  if (!jsonBlock) {
    throw new AlchemistProviderError('El proveedor de IA no devolvio un objeto JSON valido.', {
      preview: cleaned.slice(0, 300),
    });
  }

  try {
    return JSON.parse(jsonBlock);
  } catch (error) {
    throw new AlchemistProviderError('No fue posible interpretar el JSON devuelto por la IA.', {
      preview: jsonBlock.slice(0, 300),
      cause: error.message,
    });
  }
};
