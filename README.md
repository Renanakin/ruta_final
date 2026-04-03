# Ruta del Nido

Plan maestro de corrección, validación y liberación controlada a producción.

Este archivo define la ejecución oficial por fases para llevar el proyecto a un estado de release serio sobre la arquitectura real de producción:

- Frontend estático Vite servido por Nginx
- Backend Node.js + Express administrado por PM2
- API interna en `127.0.0.1:3004`
- Dominio canónico objetivo: `https://rutadelnido.com`

No autoriza despliegue automático. El proyecto permanece en estado `NO DEPLOY` hasta cerrar todos los bloqueadores de `P0`.

## Estado oficial

- Estado de ejecución: `Plan de remediación aprobado`
- Estado de release: `NO DEPLOY`
- Autoridad de pase entre fases: `Orquestador`
- Registro de skills y agentes: ver [SKILLS.md](/C:/dev/1_ruta/SKILLS.md)

## Reglas obligatorias

1. Ninguna fase comienza sin pase formal del Orquestador.
2. Ninguna fase se considera terminada sin evidencia verificable.
3. Cada entregable finalizado debe documentarse y marcarse con check.
4. Nada marcado como completado debe rehacerse, salvo que el Orquestador abra una reapertura explícita.
5. Toda fase debe cerrar con:
   - entregables
   - evidencia
   - riesgos residuales
   - check de cierre
6. Si una fase falla pruebas, vuelve a `En corrección` y no se avanza.

## Orquestación oficial

### Orquestador

El Orquestador es el responsable de:

- interpretar requerimientos de la fase
- asignar agentes y skills
- verificar criterios de entrada
- revisar evidencia de salida
- aprobar o rechazar el pase a la siguiente fase
- mantener el registro de checks completados

### Flujo de control

1. El Orquestador abre la fase.
2. Asigna agentes especializados.
3. Los agentes ejecutan solo su alcance.
4. Los agentes devuelven evidencia y piden revisión.
5. El Orquestador valida el cumplimiento.
6. Si aprueba, marca checks y libera la siguiente fase.
7. Si rechaza, devuelve observaciones y la fase continúa bloqueada.

## Registro persistente de avance

Cada cierre debe reflejarse en este archivo y, si aplica, en documentos de fase bajo `docs/release/`.

### Checks ya cerrados

- [x] Auditoría inicial de seguridad, calidad, SEO, despliegue y accesibilidad realizada
- [x] Arquitectura productiva recalibrada a `Nginx + PM2 + frontend estático`
- [x] Dictamen oficial definido: `NO DEPLOY` hasta cierre de `P0`
- [x] Plan por fases y sistema de orquestación documentados

### Checks globales pendientes para habilitar release

- [ ] `P0` cerrado completamente
- [ ] `P1` cerrado completamente
- [ ] `P2` cerrado completamente
- [ ] Validación final del VPS real aprobada por el Orquestador
- [ ] Cambio de estado de `NO DEPLOY` a `READY FOR RELEASE`

## Fases oficiales

## Fase P0 - Bloqueadores de release

Objetivo: eliminar todo riesgo que impida un despliegue seguro, coherente y verificable.

### Alcance

- dependencias críticas y altas del frontend
- secretos y configuración sensible
- CORS y autenticación CRM
- lint, build y tests
- dominio canónico y metadatos mínimos
- validación productiva del VPS

### Tareas

- [ ] Corregir o reemplazar dependencias vulnerables de severidad crítica/alta
- [ ] Rotar secretos operativos y definir política de secretos fuera del repo
- [ ] Endurecer JWT del CRM con claims consistentes
- [ ] Alinear CORS con producción real y configuración por entorno
- [ ] Llevar `npm run lint` a verde
- [ ] Llevar `npm run build` a verde sin warnings bloqueantes de release
- [ ] Llevar `backend npm test` a verde
- [ ] Definir dominio canónico único `rutadelnido.com`
- [ ] Completar SEO mínimo técnico:
  - `meta description`
  - `canonical`
  - `og:title`
  - `og:description`
  - `og:url`
  - `og:type`
  - `twitter:image:alt`
- [ ] Corregir `robots.txt`, `sitemap.xml` y JSON-LD con dominio y assets reales
- [ ] Validar VPS real con:
  - `curl -I https://rutadelnido.com`
  - `curl -I https://www.rutadelnido.com`
  - `curl http://127.0.0.1:3004/api/health` desde el servidor
  - verificación de proxy `/api/*`

### Evidencia mínima de cierre

- `npm audit` sin findings críticos/altos aceptados como bloqueantes
- `npm run lint` exitoso
- `npm run build` exitoso
- `backend npm test` exitoso
- capturas o logs de `curl` del VPS
- checklist SEO mínimo completado
- nota de secretos rotados y estrategia de carga validada

### Criterio de pase

La fase solo pasa cuando el Orquestador confirme que no queda ningún bloqueador abierto de seguridad, QA, SEO canónico o despliegue.

### Estado

- [ ] P0 aprobado por Orquestador

## Fase P1 - Calidad de producto y validación funcional

Objetivo: dejar el producto estable, accesible y limpio para QA serio.

### Alcance

- accesibilidad crítica
- errores de consola
- smoke tests funcionales
- validación visual principal
- consistencia UX

### Tareas

- [ ] Corregir controles sin nombre accesible
- [ ] Corregir navegación por teclado y skip links
- [ ] Corregir jerarquía de headings
- [ ] Corregir contraste insuficiente en UI principal
- [ ] Eliminar errores de consola evitables en sesión anónima
- [ ] Ejecutar smoke QA de:
  - `/`
  - `/alquimista`
  - `favicon`
  - CTA WhatsApp
  - footer
  - navegación móvil
- [ ] Ejecutar validación visual de home y alquimista
- [ ] Validar formularios críticos y fallback UX

### Evidencia mínima de cierre

- reporte de Lighthouse actualizado
- evidencia de pruebas manuales o automatizadas
- lista de issues a11y cerrados
- consola limpia o con warnings no bloqueantes explícitamente aceptados

### Criterio de pase

La fase solo pasa cuando el Orquestador confirme que la experiencia pública principal soporta QA funcional y accesibilidad básica sin findings graves abiertos.

### Estado

- [ ] P1 aprobado por Orquestador

## Fase P2 - Endurecimiento final y readiness operativa

Objetivo: dejar el proyecto listo para un release defendible y repetible.

### Alcance

- automatización de QA
- observabilidad
- release checklist
- rollback
- documentación final de operación

### Tareas

- [ ] Definir checklist pre-release
- [ ] Definir checklist post-deploy
- [ ] Definir plan de rollback
- [ ] Definir monitoreo y revisión de logs
- [ ] Definir validación de SEO post-release
- [ ] Dejar procedimiento de smoke test del VPS
- [ ] Dejar procedimiento de revalidación cuando se cambie infraestructura
- [ ] Dejar registro final de riesgos residuales aceptados

### Evidencia mínima de cierre

- checklist completa firmada por Orquestador
- procedimiento de rollback documentado
- procedimiento operativo de validación documentado
- documento de riesgos residuales actualizado

### Criterio de pase

La fase solo pasa cuando el Orquestador determine que el proyecto ya no depende de conocimiento tribal para ser operado, validado o liberado.

### Estado

- [ ] P2 aprobado por Orquestador

## Cambio de estado final

Solo el Orquestador puede cambiar el estado del proyecto a:

- [ ] `READY FOR RELEASE`

Ese cambio requiere:

- [ ] P0 aprobado
- [ ] P1 aprobado
- [ ] P2 aprobado
- [ ] VPS validado
- [ ] Riesgos residuales aceptados
- [ ] Documentación final cerrada

## Cómo documentar cada cierre

Cada tarea o subfase cerrada debe añadir:

- fecha
- responsable
- evidencia
- decisión del Orquestador

Formato sugerido:

```md
- [x] Nombre del entregable
  Fecha: YYYY-MM-DD
  Responsable: agente o equipo
  Evidencia: ruta/log/reporte
  Aprobado por: Orquestador
```

## Qué no se puede hacer

- desplegar por intuición
- pasar de fase por avance parcial
- cerrar tareas sin evidencia
- reabrir tareas cerradas sin justificación documentada
- iniciar `P1` o `P2` con `P0` abierto

## Siguiente paso operativo

El siguiente paso correcto es ejecutar `P0` bajo coordinación del Orquestador, usando la matriz de skills y agentes definida en [SKILLS.md](/C:/dev/1_ruta/SKILLS.md).
