# Sales Assistant P7: Piloto Controlado

Fecha: 2026-04-07
Estado: implementado

## Objetivo

Activar el sales assistant con control operacional, segmento acotado y capacidad de pausar sin redeploy.

## Controles disponibles

- `enabled`: kill switch total
- `rollout_percentage`: cohorte deterministica por sesion
- `page_scope`: `product_only` o `all`
- `allowlist_enabled` + `allowlist_tokens`
- `qa_force_enabled`

## Endpoint publico

- `POST /api/ai/sales/pilot/eligibility`

Respuesta:

- `enabled`
- `eligible`
- `reason`
- `cohort`
- `rolloutPercentage`
- `pageScope`

## Operacion desde CRM

Ruta:

- panel admin CRM
- seccion `Sales Assistant: Piloto Controlado`

## Configuracion inicial recomendada para produccion

- `enabled = on`
- `rollout_percentage = 10`
- `page_scope = product_only`
- `allowlist_enabled = off`
- `qa_force_enabled = on`
- `notes = Piloto inicial 10% en fichas de producto`

## Secuencia recomendada de apertura

1. `Off`
2. `QA only`
3. `10% producto`
4. revisar metricas y trazas
5. `25% producto`
6. revisar 24-48h
7. `100% full` solo si fallback, latencia y handoff siguen sanos

## QA manual sugerido

1. `enabled=off`
   Esperado: widget no aparece.
2. `enabled=on`, `rollout_percentage=0`
   Esperado: widget no aparece salvo QA force o allowlist.
3. `qa_force_enabled=on` y URL con `?salesAssistantPilot=force`
   Esperado: widget aparece si pasa el resto de chequeos basicos.
4. `allowlist_enabled=on` y URL con `?salesAssistantPilotToken=<token>`
   Esperado: widget aparece con token valido.
5. `rollout_percentage=100`
   Esperado: widget aparece para todo el scope configurado.
6. `page_scope=product_only`
   Esperado: widget solo aparece en ficha de producto.

## Verificacion automatizada

- `backend/tests/sales-assistant-pilot.test.js`
- `backend/tests/analytics.test.js`
- `backend/tests/sales.conversation-eval.test.js`
