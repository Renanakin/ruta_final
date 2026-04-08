# Sales Assistant P6: Observabilidad y QA Conversacional

Fecha: 2026-04-06
Estado: implementado en widget, analytics y CRM

## Objetivo

Cerrar `P6` con trazabilidad real por turno y una base minima de QA conversacional operable desde CRM.

## Eventos instrumentados

- `sales_assistant_opened`
- `sales_assistant_engaged`
- `sales_assistant_fallback`
- `sales_assistant_handoff`

## Campos clave por turno

- `conversation_id`
- `message_source`
- `quick_reply_intent`
- `detected_intent`
- `resolved_by`
- `next_step`
- `handoff`
- `latency_ms`
- `roundtrip_ms`
- `topic`
- `category`
- `lead_temperature`

## KPIs minimos en CRM

- total de turnos
- conversaciones unicas
- tasa de fallback
- tasa de handoff sugerido
- clicks reales a handoff
- latencia promedio
- distribucion por `resolved_by`
- top intents
- origen del turno: `quick_reply` vs `free_text`

## Matriz QA base

1. Deterministico precio:
   Esperado: `resolved_by=deterministic`, intent de precio, sin fallback.
2. Generativo recomendacion:
   Esperado: `resolved_by=generative`, intent de recomendacion, quick replies validas.
3. Fallback cliente:
   Esperado: evento `sales_assistant_fallback`, handoff habilitado, error trazable.
4. Handoff humano:
   Esperado: evento `sales_assistant_handoff`, motivo y temperatura cuando existan.
5. Comparacion contextual:
   Esperado: continuidad por `conversation_id` y trazas con intent de comparacion.

## Evidencia automatizada

- `backend/tests/sales.conversation-eval.test.js`
- `backend/tests/alchemist.service.test.js`
- `backend/tests/analytics.test.js`
