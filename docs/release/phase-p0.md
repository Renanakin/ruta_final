# Phase P0 - Evidencia Local

Fecha: 2026-04-03
Responsable: Codex
Estado: en progreso

## Alcance cubierto en local

- `npm audit --audit-level=high` del frontend sin vulnerabilidades bloqueantes
- `npm run lint` del frontend en verde
- `npm run build` del frontend en verde
- `cd backend && npm test` en verde
- CORS local validado para `http://127.0.0.1:5173 -> http://127.0.0.1:3004`
- JWT endurecido con separación entre cliente web y CRM
- dominio canónico alineado a `https://rutadelnido.com`
- `robots.txt`, `sitemap.xml` y metadata SEO servidos correctamente en local
- smoke real en navegador de `/` y `/alquimista` sin errores de consola
- Lighthouse local:
  - home: accesibilidad `1.0`, SEO `1.0`
  - alquimista: accesibilidad `1.0`, SEO `1.0`

## Evidencia

- Frontend:
  - `npm audit --audit-level=high`
  - `npm run lint`
  - `npm run build`
- Backend:
  - `cd backend && npm test`
  - `GET http://127.0.0.1:3004/api/health`
  - `OPTIONS http://127.0.0.1:3004/api/catalog` con `Origin: http://127.0.0.1:5173`
- Browser QA:
  - smoke real en `http://127.0.0.1:5173/`
  - smoke real en `http://127.0.0.1:5173/alquimista`
- Lighthouse:
  - `.omx/logs/lh-home.json`
  - `.omx/logs/lh-alquimista.json`

## Riesgos residuales antes de producción

- HTTPS no puede validarse localmente; Lighthouse en best-practices queda penalizado solo por HTTP local.
- Falta rotar y cargar secretos definitivos fuera del repo para producción.
- Falta validación final del VPS real:
  - `curl -I https://rutadelnido.com`
  - `curl -I https://www.rutadelnido.com`
  - `curl http://127.0.0.1:3004/api/health` desde el servidor
  - validación del proxy `/api/*`

## Decisión actual

- `NO DEPLOY` todavía.
- La app quedó apta para pasar a preparación de secretos y checklist operativa de release.
