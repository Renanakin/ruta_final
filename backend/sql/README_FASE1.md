# Fase 1 - SQL clientes

Este directorio contiene los scripts de base de datos para la Fase 1 del modulo de clientes.

## Archivos

- `001_phase1_clientes_schema.sql`: crea tablas y relaciones base.
- `001_phase1_clientes_rollback.sql`: revierte la fase completa.

## Orden recomendado

1. Crear DB `ruta_del_nido` si no existe.
2. Ejecutar `001_phase1_clientes_schema.sql`.
3. Verificar tablas y claves foraneas.

## Nota

El backend tambien incluye bootstrap idempotente en `server.js` para asegurar que el esquema de fase 1 exista al iniciar.
