# Backend

API y logica de negocio de Ruta Fresca. Este modulo expone endpoints REST para frontend publico, CRM y Alchemist, gestiona autenticacion, validaciones, acceso a datos y analitica.

## Alcance

- Implementar endpoints REST para frontend y Alchemist.
- Gestionar base de datos, reglas de negocio y seguridad.
- Proveer autenticacion, autorizacion, validaciones y observabilidad basica.

## Limites

- No construir interfaces de usuario.
- No acoplar logica especifica del frontend.
- No mover reglas de negocio al cliente.

## Ejecucion

```bash
npm install
npm test
npm run dev
```

## Requisitos de configuracion

- Definir `JWT_SECRET` con al menos 32 caracteres.
- Configurar `CORS_ORIGINS` segun los clientes autorizados.
- Configurar `RESEND_API_KEY` y `APP_BASE_URL` para flujos de email reales.
- Configurar `GEMINI_API_KEY` y `CHEF_ACCESS_CODE` para endpoints de IA.

## Runtime real

- El runtime actual usa SQLite con separacion por entorno:
  - Produccion: `backend/database_prod_rutadelnido_2026_04.sqlite`
  - Desarrollo: `backend/database_dev_local.sqlite`
- `DATABASE_URL` no participa del flujo publico diario; queda solo como soporte para migraciones o validaciones manuales.
- El catalogo publico, auth de clientes, carrito, pedidos, newsletter y suscripciones salen de esta base SQLite.

## Contratos publicos estabilizados

- `POST /api/auth/login` y `GET /api/auth/verify-email` devuelven JWT y ademas emiten cookie httpOnly para sesiones del frontend.
- `GET /api/auth/me` acepta `Authorization: Bearer` o la cookie httpOnly del backend.
- `POST /api/auth/logout` limpia la cookie de sesion.
- `PATCH /api/cart/items/:id` y `PATCH /api/customer/subscription/:id` quedan soportados para mantener compatibilidad con la web publica actual.
- `GET /api/cart` devuelve items con `id` y `cart_item_id`.
- `POST /api/cart/checkout` persiste `order_items` y responde `order_id` + `orders_count`.
- `GET /api/customer/orders` devuelve resumen util para la web publica (`product_name`, `quantity`).

## Estado actual

- Bootstrap HTTP endurecido con `helmet`, `rate-limit`, `trust proxy` y `x-powered-by` deshabilitado.
- Validacion de entrada centralizada para auth, cart, orders, newsletter, CRM e IA.
- Auth de clientes y CRM separada en middlewares dedicados.
- SQLite alineado con los flujos reales de auth, CRM, analytics, orders y newsletter.
- Suite de integracion backend en verde.
