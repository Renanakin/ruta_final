# VPS Update Handoff - 2026-04-03

## Objetivo

Actualizar la web preview que ya existe en el VPS para dejarla operativa como sitio principal, sin rediseñar la infraestructura.

Este handoff asume:

- el VPS ya tiene una version preview funcional
- solo se hara una actualizacion de codigo y configuracion
- la venta online por carrito **no debe activarse**
- todos los pedidos publicos deben seguir yendo a **WhatsApp**

## Regla comercial vigente

La web publica **no** debe operar como ecommerce de checkout directo.

Estado correcto:

- productos visibles en web
- formulario de cuenta operativo
- suscripciones visibles
- pedidos dirigidos por WhatsApp
- carrito y checkout online deshabilitados en la experiencia publica

No habilitar:

- alta publica al carrito
- checkout web
- flujo de compra online desde la UI

## Resumen de cambios aplicados

### Frontend publico

- se alineo el dominio canonico a `https://rutadelnido.com`
- se corrigieron `canonical`, `og:url`, `twitter:image:alt`, `robots.txt` y `sitemap.xml`
- se limpiaron errores de consola en `/` y `/alquimista`
- se corrigio el menu movil
- se mejoro accesibilidad y contraste
- se desactivo el flujo visible de carrito
- los CTA de compra ahora apuntan a WhatsApp con contexto prellenado

### Cuenta de cliente

- registro y login funcionan en local
- el panel de cliente mantiene:
  - perfil
  - pedidos
  - suscripcion
- el panel ya no expone carrito como flujo real de compra
- si una ruta vieja llega a `cart`, se muestra un mensaje de derivacion a WhatsApp

### Backend

- CORS local y productivo quedaron alineados
- JWT de cliente y CRM quedaron separados por audiencia y `token_use`
- tests backend quedaron en verde

### SEO y artefactos publicos

- `index.html` actualizado con metadata real
- `public/robots.txt` actualizado a `.com`
- `public/sitemap.xml` actualizado a `.com`
- `public/noticia-chef-ia.html` actualizado con metadata valida
- `public/_redirects` actualizado para redirigir a `.com`

## Archivos clave cambiados

### Frontend

- [index.html](C:/dev/1_ruta/index.html)
- [src/App.jsx](C:/dev/1_ruta/src/App.jsx)
- [src/components/Nav.jsx](C:/dev/1_ruta/src/components/Nav.jsx)
- [src/components/AccountPanel.jsx](C:/dev/1_ruta/src/components/AccountPanel.jsx)
- [src/components/CatalogSection.jsx](C:/dev/1_ruta/src/components/CatalogSection.jsx)
- [src/components/ProductDetailModal.jsx](C:/dev/1_ruta/src/components/ProductDetailModal.jsx)
- [src/components/SubscriptionSection.jsx](C:/dev/1_ruta/src/components/SubscriptionSection.jsx)
- [src/components/WhatsAppFloat.jsx](C:/dev/1_ruta/src/components/WhatsAppFloat.jsx)
- [src/components/AlchemistView.jsx](C:/dev/1_ruta/src/components/AlchemistView.jsx)
- [src/components/AlchemistViewAnimated.jsx](C:/dev/1_ruta/src/components/AlchemistViewAnimated.jsx)
- [src/components/Footer.jsx](C:/dev/1_ruta/src/components/Footer.jsx)
- [src/components/SocialProof.jsx](C:/dev/1_ruta/src/components/SocialProof.jsx)
- [src/components/ExclusiveAccess.jsx](C:/dev/1_ruta/src/components/ExclusiveAccess.jsx)
- [src/components/VisitorCounter.jsx](C:/dev/1_ruta/src/components/VisitorCounter.jsx)
- [src/lib/constants.js](C:/dev/1_ruta/src/lib/constants.js)

### Backend

- [backend/src/app.js](C:/dev/1_ruta/backend/src/app.js)
- [backend/src/lib/jwt.js](C:/dev/1_ruta/backend/src/lib/jwt.js)
- [backend/src/lib/authSession.js](C:/dev/1_ruta/backend/src/lib/authSession.js)
- [backend/src/middleware/crmAuth.middleware.js](C:/dev/1_ruta/backend/src/middleware/crmAuth.middleware.js)
- [backend/src/modules/crm/crm.routes.js](C:/dev/1_ruta/backend/src/modules/crm/crm.routes.js)
- [backend/src/modules/analytics/analytics.routes.js](C:/dev/1_ruta/backend/src/modules/analytics/analytics.routes.js)
- [backend/src/config/db.js](C:/dev/1_ruta/backend/src/config/db.js)
- [backend/sync_db.js](C:/dev/1_ruta/backend/sync_db.js)

### Documentacion y release

- [docs/release/phase-p0.md](C:/dev/1_ruta/docs/release/phase-p0.md)
- [docs/release/pre-release-checklist.md](C:/dev/1_ruta/docs/release/pre-release-checklist.md)
- [RELEASE_CHECKLIST.md](C:/dev/1_ruta/RELEASE_CHECKLIST.md)
- [SECURITY_ROTATION_CHECKLIST.md](C:/dev/1_ruta/SECURITY_ROTATION_CHECKLIST.md)

## Variables a revisar antes de subir

### Frontend

- `VITE_API_BASE_URL`
- `VITE_WHATSAPP_NUMBER`
- `VITE_GA_ID`
- `VITE_META_PIXEL_ID`

### Backend

- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `CRM_JWT_AUDIENCE`
- `CRM_LOGIN_EMAIL`
- `CRM_LOGIN_PASSWORD`
- `CRM_OPERATOR_EMAIL`
- `CRM_OPERATOR_PASSWORD`
- `CORS_ORIGINS`
- `APP_BASE_URL`
- `GEMINI_API_KEY`
- `CHEF_ACCESS_CODE`
- `RESEND_API_KEY`
- `ANALYTICS_IP_HASH_SALT`

Templates:

- [backend/.env.example](C:/dev/1_ruta/backend/.env.example)
- [backend/.env.production.example](C:/dev/1_ruta/backend/.env.production.example)
- [.env.example](C:/dev/1_ruta/.env.example)

## Importante para el ingeniero del VPS

### No subir estos archivos desde local

- `backend/database.sqlite`
- `database.sqlite`
- cualquier `.env` local
- artefactos `.playwright-cli/`

Si el VPS usa SQLite real en produccion, respaldar primero la base activa del servidor antes de actualizar codigo.

### Si el preview ya esta operativo

La estrategia recomendada es:

1. actualizar codigo fuente en el directorio actual del preview
2. actualizar variables de entorno productivas
3. construir frontend nuevo
4. reiniciar backend
5. recargar Nginx o el proxy que ya sirve la preview
6. validar smoke final en el mismo host

## Verificaciones obligatorias post-update

### HTTP / proxy

- `curl -I https://rutadelnido.com`
- `curl -I https://www.rutadelnido.com`
- `curl https://rutadelnido.com/api/health`
- `curl https://rutadelnido.com/api/catalog`

### UX publica

- `/` carga sin errores
- `/alquimista` carga sin errores
- CTA principal abre WhatsApp
- CTA de catalogo abre WhatsApp con nombre de producto
- CTA de suscripciones abre WhatsApp
- menu movil abre y navega bien
- no aparece flujo de carrito o checkout online para publico

### Cuenta

- registro
- login
- perfil
- pedidos
- suscripcion

## Estado de calidad local alcanzado

- `npm audit --audit-level=high`: OK
- `npm run lint`: OK
- `npm run build`: OK
- `cd backend && npm test`: OK
- smoke browser de `/` y `/alquimista`: OK
- Lighthouse local:
  - home accesibilidad `1.0`
  - home SEO `1.0`
  - alquimista accesibilidad `1.0`
  - alquimista SEO `1.0`

## Decision operativa

La actualizacion al VPS debe dejar la preview convertida en la version productiva visible, pero **manteniendo la venta por WhatsApp**.

Si alguna configuracion del VPS reactiva checkout, carrito o pedidos online, eso se considera una desviacion del alcance actual.
