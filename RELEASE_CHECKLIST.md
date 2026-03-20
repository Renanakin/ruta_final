# Release Checklist

## Antes del release

- completar `/.env.production.example` en el servidor
- completar `backend/.env.production.example` en el servidor
- respaldar `backend/database.sqlite`
- validar `npm run test` en raiz
- validar `npm test` en `backend`
- validar `npm run build` en raiz

## Infraestructura

- copiar `infra/nginx/rutadelnido.conf` a Nginx
- copiar `infra/systemd/ruta-del-nido-backend.service` a systemd
- habilitar HTTPS con Certbot
- dejar `3001` solo accesible internamente

## Smoke test

- `GET /api/health`
- `GET /api/catalog`
- registro de usuario
- login de usuario
- verify email
- reset password
- carrito y checkout
- `/crm` bloqueado
- alquimista operativo si sus variables estan cargadas

## Rollback

- restaurar `backend/database.sqlite`
- volver al commit previo
- reconstruir frontend
- reiniciar backend
- recargar Nginx

## Cierre de pruebas y secretos

- eliminar claves reales de archivos locales usados para pruebas
- dejar `*.example` solo con placeholders seguros
- no conservar secretos reales en el repo despues del ciclo de pruebas
- mover secretos definitivos al VPS, panel del proveedor o gestor de secretos
