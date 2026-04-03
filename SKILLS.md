# SKILLS.md

Matriz oficial de orquestación, skills, agentes, pruebas y reglas de pase entre fases.

Este archivo existe para evitar improvisación y retrabajo. Si una tarea ya fue cerrada con evidencia y aprobada por el Orquestador, no debe repetirse.

## Rol central

## Orquestador

Responsable único del flujo de fases.

### Funciones

- abrir fase
- leer criterios de entrada
- asignar agentes
- seleccionar skills
- consolidar entregables
- revisar evidencia
- dar o negar pase
- actualizar checks en [README.md](/C:/dev/1_ruta/README.md)

### Perfil recomendado

- agente principal del hilo
- apoyo de `planner` para secuenciación
- apoyo de `verifier` para validación final de fase

## Reglas de uso de agentes

1. Cada agente recibe un alcance acotado.
2. Ningún agente autoriza el pase de fase por sí solo.
3. Todo agente debe devolver:
   - hallazgos
   - cambios o propuestas
   - evidencia
   - riesgos residuales
   - recomendación al Orquestador
4. El Orquestador siempre hace la revisión final.

## Fase P0

## Objetivo

Cerrar bloqueadores de release.

### Agentes recomendados

- `security-reviewer`
- `code-reviewer`
- `dependency-expert`
- `executor`
- `test-engineer`
- `verifier`

### Skills recomendadas

- `$security-review`
- `$code-review`
- `$playwright`
- `$note`

### Plugins / herramientas recomendadas

- `npm audit`
- `npm run lint`
- `npm run build`
- `backend npm test`
- `curl`
- revisión de headers y dominio real del VPS

### Entregables esperados

- dependencias críticas corregidas
- secretos endurecidos
- auth CRM corregida
- CORS corregido
- metadatos SEO mínimos corregidos
- dominio canónico unificado
- validación VPS aprobada

### Pruebas obligatorias antes del pase

- `npm audit`
- `npm run lint`
- `npm run build`
- `cd backend && npm test`
- `curl -I https://rutadelnido.com`
- `curl -I https://www.rutadelnido.com`
- `curl http://127.0.0.1:3004/api/health` en servidor

### Criterio de aprobación del Orquestador

- no existen findings críticos abiertos
- no existen findings altos bloqueantes abiertos
- pruebas mínimas en verde
- evidencia documentada

### Checklist de cierre

- [ ] Dependencias críticas cerradas
- [ ] Secretos endurecidos
- [ ] Auth CRM endurecida
- [ ] CORS alineado
- [ ] Lint verde
- [ ] Build verde
- [ ] Backend tests verdes
- [ ] SEO mínimo completo
- [ ] VPS validado
- [ ] Pase de fase aprobado por Orquestador

## Fase P1

## Objetivo

Elevar calidad funcional, UX y accesibilidad.

### Agentes recomendados

- `code-reviewer`
- `designer`
- `test-engineer`
- `vision`
- `verifier`

### Skills recomendadas

- `$playwright`
- `$visual-verdict`
- `$code-review`
- `$note`

### Plugins / herramientas recomendadas

- Lighthouse
- Playwright
- validación manual de teclado
- revisión de consola

### Entregables esperados

- controles accesibles
- navegación por teclado correcta
- contraste corregido
- errores de consola no bloqueantes
- smoke test funcional de home y alquimista

### Pruebas obligatorias antes del pase

- Lighthouse en `/`
- Lighthouse en `/alquimista`
- navegación móvil
- revisión del menú
- validación de skip links
- validación de CTAs clave

### Criterio de aprobación del Orquestador

- accesibilidad crítica cerrada
- no hay errores funcionales en rutas principales
- evidencia visual y funcional disponible

### Checklist de cierre

- [ ] Accesibilidad crítica cerrada
- [ ] Skip links válidos
- [ ] Botones con nombre accesible
- [ ] Contraste mínimo aceptable
- [ ] Consola limpia o justificada
- [ ] Smoke QA aprobado
- [ ] Pase de fase aprobado por Orquestador

## Fase P2

## Objetivo

Dejar readiness operativa, QA repetible y release controlado.

### Agentes recomendados

- `planner`
- `writer`
- `test-engineer`
- `verifier`

### Skills recomendadas

- `$note`
- `$plan`
- `$playwright`

### Plugins / herramientas recomendadas

- checklists documentales
- smoke scripts
- `curl`
- revisión de logs

### Entregables esperados

- checklist pre-release
- checklist post-deploy
- procedimiento de rollback
- procedimiento de validación de VPS
- procedimiento de revalidación SEO

### Pruebas obligatorias antes del pase

- simulación del checklist completo
- revisión del rollback
- revisión de riesgos residuales
- validación final del Orquestador

### Criterio de aprobación del Orquestador

- el proyecto puede operarse y validarse sin ambigüedad
- la salida a producción es repetible
- hay documentación suficiente para no depender de memoria informal

### Checklist de cierre

- [ ] Checklist pre-release lista
- [ ] Checklist post-deploy lista
- [ ] Rollback documentado
- [ ] Validación VPS documentada
- [ ] Riesgos residuales registrados
- [ ] Pase de fase aprobado por Orquestador

## Protocolo de revisión del Orquestador

Cada vez que un agente termine una tarea, debe devolver este formato:

```md
Tarea: <nombre>
Fase: <P0|P1|P2>
Estado: completada
Entregables:
- ...
Evidencia:
- ...
Riesgos residuales:
- ...
Solicitud:
- revisar y autorizar pase o cierre
```

El Orquestador responde con una de estas salidas:

```md
Decision: aprobado
Accion: marcar checks y continuar
```

o

```md
Decision: rechazado
Accion: volver a corrección
Observaciones:
- ...
```

## Reglas para no rehacer trabajo

Una tarea cerrada no debe repetirse si cumple estas condiciones:

- está marcada con check en [README.md](/C:/dev/1_ruta/README.md)
- tiene evidencia trazable
- tiene aprobación explícita del Orquestador

Solo se reabre si:

- aparece un bug nuevo relacionado
- cambia el requerimiento
- la evidencia era insuficiente
- el Orquestador deja constancia de reapertura

## Registro sugerido de evidencia

Guardar o referenciar evidencia en:

- `docs/release/phase-p0.md`
- `docs/release/phase-p1.md`
- `docs/release/phase-p2.md`
- logs de comandos
- reportes de Lighthouse
- reportes de pruebas

## Secuencia obligatoria

1. P0
2. revisión del Orquestador
3. P1
4. revisión del Orquestador
5. P2
6. revisión del Orquestador
7. decisión final de release

No se permite saltar fases.
