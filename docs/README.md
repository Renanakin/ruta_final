# Documentacion Viva

Esta carpeta conserva solo la documentacion que sigue sirviendo para:

- operacion del proyecto
- release
- mejora futura del producto
- handoff al ingeniero que actualizara el VPS

## Documentos activos

- [qa/README.md](C:/dev/1_ruta/docs/qa/README.md)
  Convencion oficial para handoff de QA por modulo y plantilla de archivo que debe dejarse al cerrar entregables que requieren prueba manual o conversacional.

- [alquimista-avatar/README.md](C:/dev/1_ruta/docs/alquimista-avatar/README.md)
  Plan de ejecucion por fases para integrar la nueva identidad del avatar del Alquimista.

- [alquimista-avatar/SKILLS.md](C:/dev/1_ruta/docs/alquimista-avatar/SKILLS.md)
  Matriz de roles, skills y gates para ejecutar el proyecto del avatar del Alquimista.

- [conversion/README.md](C:/dev/1_ruta/docs/conversion/README.md)
  Base de diagnostico, plan, matriz y propuesta de trabajo para mejorar conversion en Ruta del Nido.

- [release/phase-p0.md](C:/dev/1_ruta/docs/release/phase-p0.md)
  Evidencia local y estado actual de la fase P0.

- [release/pre-release-checklist.md](C:/dev/1_ruta/docs/release/pre-release-checklist.md)
  Checklist de salida antes de tocar produccion.

- [release/2026-04-03-vps-update-handoff.md](C:/dev/1_ruta/docs/release/2026-04-03-vps-update-handoff.md)
  Handoff operativo para actualizar la preview ya existente del VPS.

- [COMO_EJECUTAR_LA_WEB.md](C:/dev/1_ruta/docs/COMO_EJECUTAR_LA_WEB.md)
  Referencia para levantar el proyecto localmente.

- [PROPUESTA_ALQUIMISTA_CODIGOS.md](C:/dev/1_ruta/docs/PROPUESTA_ALQUIMISTA_CODIGOS.md)
  Propuesta futura que sigue siendo util para mejoras del Alquimista.

## Criterio de limpieza

Se eliminaron documentos legacy que:

- describian un estado ya superado
- proponian una arquitectura o roadmap contradictorio con el estado actual
- documentaban rollback o pruebas viejas ya no vigentes

Si se agrega documentacion nueva, debe ayudar a operar, mantener o mejorar la web actual.

## Regla de QA por modulo

Cuando se cierre un modulo que requiera QA manual, visual, conversacional o exploratorio:

- se debe dejar un archivo de handoff en `docs/qa/`
- ese archivo debe contener los parametros necesarios para que otro agente ejecute el QA
- el agente que implementa no debe consumir contexto adicional realizando esa fase manual si ya existe el handoff y el usuario decidio delegarla
