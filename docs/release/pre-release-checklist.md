# Pre-Release Checklist

## Gating

- No desplegar mientras exista un bloqueador `P0` abierto.
- No desplegar sin evidencia local en verde.
- No desplegar secretos desde archivos versionados.

## Configuración y secretos

- Cargar secretos definitivos solo en el VPS o en el gestor de secretos:
  - `JWT_SECRET`
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`
  - `CRM_JWT_AUDIENCE`
  - `CRM_LOGIN_PASSWORD`
  - `CRM_OPERATOR_PASSWORD`
  - `GEMINI_API_KEY`
  - `CHEF_ACCESS_CODE`
  - `RESEND_API_KEY`
  - `ANALYTICS_IP_HASH_SALT`
- Confirmar que `backend/.env` y archivos locales ignorados no se copiarán al repo ni al despliegue.
- Confirmar `CORS_ORIGINS=https://rutadelnido.com,https://www.rutadelnido.com`.
- Confirmar `APP_BASE_URL=https://rutadelnido.com`.

## Verificación local obligatoria

- `npm audit --audit-level=high`
- `npm run lint`
- `npm run build`
- `cd backend && npm test`
- smoke manual o automatizado de:
  - `/`
  - `/alquimista`
  - CTA WhatsApp
  - menú móvil
  - login/estado anónimo sin errores de consola

## Verificación SEO mínima

- `canonical` apunta a `https://rutadelnido.com/`
- `og:url` apunta a `https://rutadelnido.com/`
- `twitter:image:alt` presente
- `robots.txt` apunta a `https://rutadelnido.com/sitemap.xml`
- `sitemap.xml` incluye `/`, `/alquimista` y `noticia-chef-ia.html`

## Verificación VPS obligatoria

- `curl -I https://rutadelnido.com`
- `curl -I https://www.rutadelnido.com`
- `curl http://127.0.0.1:3004/api/health`
- validar `https://rutadelnido.com/api/catalog`
- validar `https://rutadelnido.com/api/auth/me`
- validar que Nginx sirva frontend estático y proxyee `/api/*`

## Rollback mínimo

- respaldo de `backend/database.sqlite` o de la base real activa
- commit o artefacto anterior identificado
- procedimiento de rebuild del frontend documentado
- procedimiento de restart de backend y reload de Nginx documentado
