# Propuesta de Desarrollo — Upgrades del Sistema
> Ruta Fresca / Ruta del Nido — 2026-03-19

---

## Estado Actual del Proyecto

El núcleo público está **completo y listo para producción**:

- Frontend React SPA funcional
- Backend Express + SQLite operativo
- AI Chef (Alchemist) generando recetas con Gemini
- Analytics de eventos implementado
- Autenticación JWT + verificación de email
- E-commerce: catálogo, carrito, checkout, órdenes

---

## Propuesta de Upgrades por Sprints

---

### Sprint 1 — Sistema de Códigos de Acceso Alquimista (Alta Prioridad)

**Objetivo:** Monetizar el AI Chef generando códigos únicos por compra.

**Diseño existente:** `docs/PROPUESTA_ALQUIMISTA_CODIGOS.md`

| Componente | Detalle |
|-----------|---------|
| Base de datos | Tablas: `alchemist_access_codes`, `alchemist_access_code_items`, `alchemist_recipe_queries` |
| Backend | Endpoints: generar código, validar código, contar queries diarias, expirar |
| Lógica de negocio | Límite 3 queries/día por código, expiración 7 días, activación única por sesión |
| Panel operador | UI para generar códigos y enviarlos por email al cliente |
| Integración checkout | Generar código automáticamente al completar un pedido |

**Estimación:** 3–4 días backend + 2 días frontend.

---

### Sprint 2 — Reactivación del CRM (Media Prioridad)

**Objetivo:** Activar el módulo CRM ya construido, que está bloqueado intencionalmente.

> El código existe (~100KB). Solo requiere auth admin y desbloqueo de ruta.

| Componente | Detalle |
|-----------|---------|
| Auth admin | Rol `admin` en JWT + middleware de guardia |
| Ruta pública | Activar `/crm` en `src/App.jsx` |
| Login admin | Pantalla de login separada o token con rol `admin` |
| Validación | Verificar que `crm.routes.js` (595 líneas) esté alineado con el schema actual |

**Componentes ya existentes:**
- `src/components/crm/CRMAdminPanel.jsx`
- `src/components/crm/CRMReportingSuite.jsx`
- `src/components/crm/CRMGeoMap.jsx`
- `src/components/crm/CRMOrderManager.jsx`
- `src/components/crm/CRMStats.jsx`

**Estimación:** 2 días para activar con autenticación segura.

---

### Sprint 3 — Polish Visual & UX (Media Prioridad)

**Objetivo:** Refinamiento de la experiencia de usuario en componentes existentes.

**Áreas identificadas:**
- Ajustes visuales en componentes principales (`src/components/`)
- Revisión de `AccountPanel.jsx` (31KB — flujo de cuenta y perfil)
- Feedback visual en flujos de checkout y confirmación de órdenes
- Revisión de responsive en vistas clave

**Estimación:** 2–3 días enfocados, luego continuo.

---

### Sprint 4 — Migración a PostgreSQL (Baja Prioridad / Cuando escale)

**Objetivo:** Pasar de SQLite a PostgreSQL cuando el volumen lo justifique.

**Script ya disponible:** `backend/scripts/migrate-sqlite-to-postgres.mjs`

**Trigger recomendado para ejecutarlo:**
- Más de ~10,000 eventos de analytics acumulados
- Concurrencia real de usuarios simultáneos
- Necesidad de réplicas o backups automáticos

---

## Orden de Ataque Recomendado

```
[1] Sprint 1 — Códigos Alquimista    →  monetización directa post-venta
[2] Sprint 2 — CRM activo            →  gestión y operación del negocio
[3] Sprint 3 — Polish UI             →  conversión y experiencia de usuario
[4] Sprint 4 — PostgreSQL            →  escalabilidad cuando sea necesario
```

---

## Notas Técnicas

- **No romper el scope actual:** Todos los upgrades son aditivos. El núcleo público no debe modificarse estructuralmente.
- **El CRM ya existe:** No hay que construirlo desde cero, solo desbloquearlo con autenticación adecuada.
- **Los códigos Alquimista están diseñados:** La propuesta en `docs/PROPUESTA_ALQUIMISTA_CODIGOS.md` es la especificación de implementación.
- **SQLite es suficiente** para la etapa actual. No migrar a PostgreSQL antes de que haya demanda real.
