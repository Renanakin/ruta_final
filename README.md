# Ruta Fresca (Ruta del Nido)

Plataforma web + CRM para venta y operacion de pedidos y suscripciones de Ruta del Nido.

## Stack Tecnologico

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + SQLite
- **Logging**: Pino + Pino-pretty
- **Auth**: JWT con verificacion de email, recuperacion de contrasena y cookie httpOnly para la web publica
- **IA**: Google Gemini
- **Email**: Resend API
- **Testing**: Vitest + Supertest

## Requisitos

- Node.js 18+ (20 recomendado)
- Docker opcional
- SQLite local en `backend/database.sqlite`

## Configuracion

### Frontend (`.env`)

```env
VITE_WHATSAPP_NUMBER=56993685089
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`backend/.env` y `backend/.env.local`)

Crea `backend/.env` a partir de [backend/.env.example](/K:/desarrollos/ruta_fresca/backend/.env.example) y guarda los secretos reales en `backend/.env.local`.

Variables minimas:

```env
PORT=3001
NODE_ENV=development
APP_BASE_URL=http://localhost:5173
SQLITE_PATH=./database.sqlite
JWT_SECRET=tu_secreto_aleatorio_largo
CORS_ORIGINS=http://localhost:5173
GEMINI_API_KEY=tu_key_de_gemini
RESEND_API_KEY=re_tu_key_de_resend
REPORT_EMAIL_FROM=No-Responder <onboarding@resend.dev>
```

Notas:

- `backend/.env` debe quedar con placeholders seguros para el repo.
- `backend/.env.local` sobreescribe `backend/.env` y queda ignorado por git.
- El frontend no debe exponer tokens administrativos en variables `VITE_*`.
- `DATABASE_URL` no es requisito del runtime publico actual; solo queda como soporte de migracion puntual.

## Ejecución local (2 Métodos)

Puedes correr este proyecto de dos formas distintas, **incluso simultáneamente** si lo deseas.

### 1. Método Nativo (Puerto 5173) - Recomendado para Desarrollo
Ideal si tienes Node.js 20 instalado y quieres cambios instantáneos.
```bash
# Frontend (Raíz)
npm install
npm run dev

# Backend (en otra terminal)
cd backend
npm install
npm run dev
```
Acceso: [http://localhost:5173](http://localhost:5173)

### 2. Método Docker (Puerto 5174) - Recomendado para Prueba/Distribución 
Ideal para correr el proyecto completo con un solo comando sin instalar dependencias.
```bash
docker compose up --build -d
```
Acceso: [http://localhost:5174](http://localhost:5174)

---

Guía detallada:
- [docs/COMO_EJECUTAR_LA_WEB.md](docs/COMO_EJECUTAR_LA_WEB.md)

## Migracion desde SQLite a PostgreSQL

Orden recomendado:

1. Configura `DATABASE_URL` del destino.
2. Verifica el origen SQLite actual:

```bash
cd backend
npm run db:migrate:sqlite -- --dry-run
```

3. Ejecuta la migracion real:

```bash
cd backend
npm run db:migrate:sqlite
```

4. Valida el backend:

```bash
cd backend
npm test
```

## Docker (Recomendado)

La forma más rápida de levantar el proyecto completo es usando Docker Compose:

```bash
docker compose up --build -d
```
Esto levantará el frontend en [http://localhost:5174](http://localhost:5174) (configurado para evitar colisiones) y el backend en el puerto `3003`.

Para más detalles, consulta la [Guía de Ejecución](docs/COMO_EJECUTAR_LA_WEB.md).

## Arquitectura

El proyecto sigue una arquitectura en capas por modulos:

1. **Routes**: endpoints y validacion de entrada.
2. **Controller**: orquestacion HTTP.
3. **Service**: logica de negocio y acceso a datos.

Mas detalle en [ARCHITECTURE.md](/K:/desarrollos/ruta_fresca/ARCHITECTURE.md).

## Alquimista Publico

El Alquimista del Nido ya esta activo en la experiencia publica.

Flujo actual:

1. el usuario entra por `/alquimista`
2. valida su codigo con `POST /api/ai/chef/verify`
3. consulta ingredientes o contexto culinario con `POST /api/ai/chef`
4. el backend devuelve una receta estructurada y segura
5. si la IA falla o llega al limite, la UI deriva a WhatsApp como salida auxiliar

Requisitos operativos:

- `CHEF_ACCESS_CODE`
- `GEMINI_API_KEY`
- `ALCHEMIST_GEMINI_MODEL` opcional

Validacion recomendada para esta capacidad:

```bash
cd backend
npm test

cd ..
npm run lint
npm run build
```

## Analitica Enriquecida

El proyecto incluye una capa analitica completa para navegacion, conversion y geografia.

### Capacidades implementadas

- tracking enriquecido desde frontend para:
  - `page_view`
  - `view_product`
  - `create_account`
  - `login`
  - `newsletter_subscribe`
  - `add_to_cart`
  - `begin_checkout`
  - `purchase`
  - `ai_interaction`
  - `subscription_interest`
  - `subscription_start`
- deteccion de IP real en backend con anonimizado por `ip_hash` e `ip_masked`
- geolocalizacion en modo `mock` y `live`
- cache geografica en `geo_ip_cache`
- agregados administrativos para resumen, geo, paginas, productos, heatmaps y eventos
- dashboard CRM con:
  - KPIs de eventos, sesiones, usuarios, cuentas e IA
  - top paises y ciudades
  - mapa geografico real estilizado de Chile
  - heatmap de navegacion
  - top paginas y productos
  - filtros por fecha, evento, producto, canal y pagina
  - presets locales de filtros
  - exportacion CSV y PDF

### Endpoints analiticos

- `POST /api/analytics/events`
- `GET /api/analytics/summary`
- `GET /api/analytics/geo`
- `GET /api/analytics/pages`
- `GET /api/analytics/products`
- `GET /api/analytics/heatmap`
- `GET /api/analytics/events`

Todos los endpoints `GET` de analytics estan protegidos para uso CRM administrativo.

### Hardening operativo

- exclusion de trafico interno y bots en la ingesta
- limite de tasa para `POST /api/analytics/events`
- limite de tamano de payload analitico
- sanitizacion de propiedades sensibles
- retencion automatica de `analytics_events` y `geo_ip_cache`

### Variables de entorno analiticas

Configuralas en `backend/.env` segun el entorno:

```env
ANALYTICS_GEO_MODE=mock
ANALYTICS_GEO_PROVIDER=ip-api
ANALYTICS_GEO_TIMEOUT_MS=3000
ANALYTICS_TRACK_INTERNAL=false
ANALYTICS_PAYLOAD_MAX_BYTES=4096
ANALYTICS_RETENTION_DAYS=180
ANALYTICS_RATE_LIMIT_WINDOW_MS=60000
ANALYTICS_RATE_LIMIT_MAX=120
ANALYTICS_IP_HASH_SALT=CHANGE_ME_ANALYTICS_HASH_SALT
```

### Validacion recomendada

```bash
cd backend
npm test

cd ..
npm run build
```

Estado actual:

- backend analitico listo
- tracking frontend listo
- dashboard CRM analitico listo
- exportaciones analiticas listas
