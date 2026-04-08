# Alchemist

Modulo de IA de Ruta Fresca para experiencias culinarias, prompts y capacidades futuras de asistente.

## Objetivo

`alchemist` centraliza la logica de IA para que el backend exponga rutas HTTP sin mezclar:

- prompts
- validacion de entrada
- validacion estructural de salida
- seleccion de proveedor
- errores de proveedor y configuracion

Hoy implementa el caso de uso `chef`: generar recetas estructuradas a partir de una consulta del usuario.

## Principios

- Sin UI: aqui no viven componentes React ni vistas.
- Sin acceso directo a la base de datos del backend.
- Contratos estables: el backend consume servicios de `alchemist`, no prompts sueltos.
- Fallos controlados: toda respuesta del modelo debe validarse antes de devolverse al cliente.
- Preparado para evolucionar a paquete interno o microservicio separado.

## Estructura

- [`src/index.js`](/K:/desarrollos/ruta_fresca/alchemist/src/index.js): exports publicos
- [`src/chef/chef.service.js`](/K:/desarrollos/ruta_fresca/alchemist/src/chef/chef.service.js): caso de uso principal
- [`src/chef/chef.prompt.js`](/K:/desarrollos/ruta_fresca/alchemist/src/chef/chef.prompt.js): prompt canonico del chef
- [`src/chef/chef.schemas.js`](/K:/desarrollos/ruta_fresca/alchemist/src/chef/chef.schemas.js): contratos Zod
- [`src/providers/gemini-text-generator.js`](/K:/desarrollos/ruta_fresca/alchemist/src/providers/gemini-text-generator.js): adaptador Gemini
- [`src/errors.js`](/K:/desarrollos/ruta_fresca/alchemist/src/errors.js): errores tipados

## Integracion actual

El backend consume este modulo desde [`backend/src/modules/ai/ai.routes.js`](/K:/desarrollos/ruta_fresca/backend/src/modules/ai/ai.routes.js).

Flujo:

1. la web publica valida acceso con `POST /api/ai/chef/verify`
2. la ruta `POST /api/ai/chef` recibe `query`, `locale` y opcionalmente `code`
3. `alchemist` valida la solicitud
4. se genera prompt para Gemini
5. la salida textual se parsea a JSON
6. el JSON se valida contra un esquema estricto
7. el backend responde con un payload seguro para frontend
8. si el proveedor falla, el frontend cae a un fallback controlado fuera de este modulo

## Contrato activo del chef

Respuesta esperada hacia frontend:

- `title`
- `summary`
- `timeMinutes`
- `difficulty`
- `ingredients`
- `steps`
- `flavorTip`
- `presentationTip`
- `imagePrompt`
- `imageUrl`

Las rutas HTTP asociadas viven en el backend:

- `POST /api/ai/chef/verify`
- `POST /api/ai/chef`

## Variables de entorno relevantes

- `GEMINI_API_KEY`
- `ALCHEMIST_GEMINI_MODEL` opcional, por defecto `gemini-2.5-flash`
- `CHEF_ACCESS_CODE` para acceso por codigo al chef

## Criterio de produccion

Para considerar este modulo listo:

- prompts versionados y aislados
- contratos de entrada/salida validados
- errores tipados con status HTTP mapeable
- pruebas automatizadas
- integracion desacoplada del framework HTTP
