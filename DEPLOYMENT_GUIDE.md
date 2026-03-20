# Guia de Despliegue

## Estado real del release

Este release considera:

- frontend publico React + Vite
- backend publico Node.js + Express
- SQLite como runtime actual del backend
- alquimista publico activo cuando existan credenciales
- CRM fuera del alcance publico

No tomar este release como una salida basada en Supabase/PostgreSQL. Ese camino puede retomarse despues, pero no es la base operativa actual.

## Variables de entorno

### Frontend (`./.env` o `.env.production`)

Obligatorias:

- `VITE_API_BASE_URL`
- `VITE_WHATSAPP_NUMBER`

Opcionales:

- `VITE_GA_ID`
- `VITE_META_PIXEL_ID`

Si no se usan GA o Meta Pixel, conviene dejarlas vacias y asumir los warnings del build, o retirar esas referencias mas adelante.

### Backend (`./backend/.env.local` o secretos del host)

Obligatorias:

- `NODE_ENV=production`
- `PORT=3001`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `APP_BASE_URL`

Opcionales segun uso:

- `GEMINI_API_KEY`
- `ALCHEMIST_GEMINI_MODEL`
- `CHEF_ACCESS_CODE`
- `RESEND_API_KEY`
- `REPORT_EMAIL_FROM`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_SAMESITE`

Notas:

- `backend/.env.example` ya refleja SQLite como runtime actual.
- `DATABASE_URL` no es requisito para este release publico.

## Ruta recomendada de despliegue

La ruta mas segura hoy es:

1. build del frontend con `npm run build`
2. frontend servido como sitio estatico
3. backend ejecutado con Node y gestionado por systemd
4. Nginx como reverse proxy
5. SQLite persistida en disco del servidor

## Build y validacion previa

### Frontend

```bash
npm install
npm run test
npm run build
```

### Backend

```bash
cd backend
npm install
npm test
```

## Despliegue en VPS

### Frontend

- generar `dist/`
- servir `dist/` con Nginx o equivalente

### Backend

- ejecutar `node src/app.js` desde `backend/`
- mantener el proceso con systemd
- exponer solo a traves de Nginx

## Nginx recomendado

- `tudominio.com` y `www.tudominio.com`: frontend estatico
- `api.tudominio.com`: backend Express

## SQLite y persistencia

SQLite es el runtime actual. Por eso:

- hay que conservar el archivo `backend/database.sqlite`
- se recomienda backup antes de cada release
- no se debe asumir persistencia correcta con el `docker-compose` actual sin adaptarlo primero

## Hardening minimo antes de subir

- `NODE_ENV=production`
- `DEBUG_ERRORS=false`
- `JWT_SECRET` fuerte
- `CORS_ORIGINS` restringido al dominio real
- HTTPS activo
- puerto del backend no expuesto publicamente
- backup de `backend/database.sqlite`

## Smoke test minimo

Despues del deploy, validar:

1. `GET /api/health`
2. `GET /api/catalog`
3. registro de usuario
4. login de usuario
5. verificacion de email
6. reset de password
7. carrito y checkout
8. `POST /api/ai/chef/verify` con codigo valido
9. `POST /api/ai/chef` con receta estructurada
10. acceso bloqueado a `/crm`
11. carga del frontend en dominio final

## Riesgos conocidos

- `VITE_GA_ID` y `VITE_META_PIXEL_ID` siguen marcando warning si no se definen
- el `docker-compose` actual no es la ruta recomendada para produccion de este release
- el alquimista depende de `CHEF_ACCESS_CODE` y `GEMINI_API_KEY`; sin eso la ruta publica existe, pero no quedara operativa para recetas reales
