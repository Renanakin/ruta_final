# Security Rotation Checklist

## Estado actual

- El repo no debe depender de secretos reales en archivos versionados.
- Los archivos `*.example` son la única fuente versionada para configuración.
- Los valores locales deben vivir solo en archivos ignorados por git o en el secret manager del VPS.
- La separación de JWT entre cliente web y CRM quedó implementada a nivel de claims y audiencia.
- CORS local y dominio canónico quedaron alineados a `rutadelnido.com`.

## Rotación externa pendiente

1. Supabase
   - Rotar la contraseña del usuario `postgres` en Supabase.
   - Copiar la nueva cadena del `Session pooler`.
   - Actualizar `DATABASE_URL` solo en el secret manager o en archivos locales ignorados.

2. Gemini
   - Revocar la API key actual en Google AI Studio o Google Cloud.
   - Generar una nueva key.
   - Actualizar `GEMINI_API_KEY`.

3. Resend
   - Si se activará correo real, generar una nueva API key.
   - Actualizar `RESEND_API_KEY`.

4. Variables de despliegue
   - Configurar todos los secretos en el VPS o proveedor de hosting.
   - No copiar archivos `.env` locales al repositorio.
   - Mantener `DEBUG_ERRORS=false` fuera de local.
   - Definir:
     - `JWT_AUDIENCE=ruta-fresca-clients`
     - `CRM_JWT_AUDIENCE=ruta-fresca-crm`
     - `CORS_ORIGINS=https://rutadelnido.com,https://www.rutadelnido.com`
     - `APP_BASE_URL=https://rutadelnido.com`

5. Credenciales CRM
   - Rotar `CRM_LOGIN_PASSWORD` y `CRM_OPERATOR_PASSWORD`.
   - Verificar que no queden credenciales reutilizadas entre local y producción.

## Validación post-rotación

- Ejecutar:
  - `npm audit --audit-level=high`
  - `npm run lint`
  - `npm run build`
  - `cd backend && npm test`
- Validar localmente:
  - `GET /api/health`
  - `POST /api/crm/login`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/cart/items`
  - `POST /api/cart/checkout`
- Validar en el VPS:
  - `curl -I https://rutadelnido.com`
  - `curl -I https://www.rutadelnido.com`
  - `curl http://127.0.0.1:3004/api/health`
