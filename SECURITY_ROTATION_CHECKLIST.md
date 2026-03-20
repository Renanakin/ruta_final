# Security Rotation Checklist

Estado actual:

- El repo ya no depende de secretos reales en archivos base.
- `backend/.env.local` contiene los valores locales y esta ignorado por git.
- `backend/.env` quedo con placeholders.
- Se regeneraron secretos internos de la app: `JWT_SECRET`, `CRM_ADMIN_TOKEN`, credenciales CRM y `CHEF_ACCESS_CODE`.

Rotacion externa pendiente:

1. Supabase
   - Rota la contraseña del usuario `postgres` en el panel de Supabase.
   - Copia la nueva cadena del `Session pooler`.
   - Actualiza `DATABASE_URL` en `backend/.env.local` o en tu secret manager.

2. Gemini
   - Revoca la API key actual en Google AI Studio o Google Cloud.
   - Genera una nueva key.
   - Actualiza `GEMINI_API_KEY`.

3. Resend
   - Si luego activas correo real, genera una nueva API key.
   - Actualiza `RESEND_API_KEY`.

4. Variables de despliegue
   - Configura todos los secretos en el proveedor de hosting o VPS.
   - No copies `backend/.env.local` al repositorio.
   - Mantén `DEBUG_ERRORS=false` en ambientes no locales.

5. Credenciales CRM
   - Los valores internos ya fueron regenerados localmente.
   - Si quieres forzar sincronizacion una sola vez, usa `CRM_BOOTSTRAP_MODE=sync`, inicia el backend y luego vuelve a `create_missing`.

6. Validacion post-rotacion
   - Ejecuta `cd backend && npm test`
   - Levanta el backend y valida:
     - `GET /api/health`
     - `POST /api/crm/login`
     - `POST /api/auth/register`
     - `POST /api/auth/login`
     - `POST /api/cart/items`
     - `POST /api/cart/checkout`
