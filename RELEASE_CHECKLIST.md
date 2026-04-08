# Release Checklist

## Antes del release

- completar `/.env.production.example` en el servidor o en el gestor de secretos
- completar `backend/.env.production.example` en el servidor o en el gestor de secretos
- no copiar archivos `.env` locales del desarrollo
- respaldar `backend/database.sqlite` o la base real activa
- validar `npm audit --audit-level=high`
- validar `npm run lint`
- validar `npm run build`
- validar `cd backend && npm test`
- validar smoke local de `/` y `/alquimista`

## Infraestructura

- copiar `infra/nginx/rutadelnido.conf` a Nginx
- copiar `infra/systemd/ruta-del-nido-backend.service` a systemd
- habilitar HTTPS con Certbot
- dejar el backend accesible solo internamente

## Smoke test

- `GET /api/health`
- `GET /api/catalog`
- `OPTIONS /api/catalog` con origen real
- registro de usuario
- login de usuario
- verify email
- reset password
- CTA principal a WhatsApp
- CTA de productos a WhatsApp con contexto
- confirmar que no exista flujo publico de carrito o checkout online
- `/crm` bloqueado
- alquimista operativo si sus variables estan cargadas
- `robots.txt`
- `sitemap.xml`

## Rollback

- restaurar `backend/database.sqlite` o la base real
- volver al commit previo
- reconstruir frontend
- reiniciar backend
- recargar Nginx

## Cierre de pruebas y secretos

- eliminar claves reales de archivos locales usados para pruebas
- dejar `*.example` solo con placeholders seguros
- no conservar secretos reales en el repo después del ciclo de pruebas
- mover secretos definitivos al VPS, panel del proveedor o gestor de secretos
- no cambiar estado a release hasta cerrar evidencia en `docs/release/phase-p0.md`
