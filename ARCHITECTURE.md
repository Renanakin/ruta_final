# Arquitectura del Sistema - Ruta Fresca

Este documento describe la organizacion tecnica, los patrones de diseno y las decisiones arquitectonicas del backend de Ruta Fresca.

## Patron de Diseno: Arquitectura en Capas

### 1. Capa de Rutas

- Responsabilidad: definir endpoints y middlewares.
- Contenido: mapeo de URL a controladores.
- Validacion: Zod valida `body` y `params` antes de llegar al controlador.

### 2. Capa de Controladores

- Responsabilidad: orquestar la peticion.
- Flujo: extrae datos del `req`, llama servicios y compone la respuesta HTTP.
- Error handling: delega errores al middleware global.

### 3. Capa de Servicios

- Responsabilidad: logica de negocio y persistencia.
- Contenido: reglas de negocio, transformaciones y CRUD.
- Independencia: no depende de `req` ni `res`.

## Organizacion por Modulos

El sistema se organiza en `backend/src/modules/`:

- `auth/`: usuarios, JWT, verificacion de email y reset de contrasena.
- `catalog/`: productos y stock.
- `orders/`: pedidos y estados.
- `cart/`: carrito de compra.
- `ai/`: endpoints publicos del Alquimista y limites de uso.
- `crm/`: panel operativo.
- `newsletter/`: captacion de suscriptores.
- `analytics/`: tracking de eventos.
- `user/`: perfil y suscripciones.

Ademas existe `alchemist/` como modulo aislado para la logica de IA estructurada. El backend solo lo consume; no mezcla prompts, parseo ni validaciones del modelo dentro de las rutas HTTP.

## Seguridad y Utilidades

- `backend/src/lib/jwt.js`: firma y verificacion de tokens.
- `backend/src/lib/authSession.js`: resolucion de sesion cliente via bearer o cookie httpOnly.
- `backend/src/middleware/auth.middleware.js`: protege rutas autenticadas.
- `backend/src/lib/logger.js`: logging estructurado.
- `backend/src/config/db.js`: inicializacion SQLite, tablas operativas y sincronizacion basica de esquema.
- `alchemist/src/chef/chef.service.js`: validacion y normalizacion de recetas estructuradas generadas por IA.

## Estrategia de Datos

- Base principal: SQLite en `backend/database.sqlite`.
- Inicializacion: el backend crea y completa tablas faltantes al iniciar.
- Migracion historica: `backend/scripts/migrate-sqlite-to-postgres.mjs` queda disponible solo si mas adelante se retoma PostgreSQL.
- El backend publico actual no depende de Supabase ni de `DATABASE_URL`.

## Flujo del Alquimista

El flujo publico del Alquimista se divide en dos capas:

1. frontend React:
   - entrada por `/alquimista`
   - validacion de codigo con `/api/ai/chef/verify`
   - consulta culinaria con `/api/ai/chef`
   - fallback a WhatsApp cuando la IA falla o se agota el limite
2. backend + modulo `alchemist`:
   - validacion de entrada con Zod
   - generacion de prompt canonico
   - parseo de JSON desde la salida del proveedor
   - validacion estricta del payload antes de responder al frontend
   - mapeo de errores tipados a respuestas HTTP seguras

## Testing

- Se usa Vitest + Supertest.
- Los tests viven en `backend/tests`.
- La suite actual valida auth, carrito, checkout, CRM, analytics y rutas del Alquimista.
