# Sales Assistant

Modulo aislado del asistente de ventas web "El Alquimista del Nido - Vendedor Inteligente".

## Objetivo

Guiar al cliente durante la navegacion, sugerir productos complementarios, preparar el pre-cierre y derivar a una persona solo al final.

## Aislamiento

Este modulo debe concentrar:

- UI del asistente
- estado conversacional
- integracion con proveedor
- adaptacion de respuestas a cards y quick replies

Si cambia el proveedor o endpoint principal, el primer lugar a revisar es:

- `salesAssistantProvider.js`
- `salesAssistant.config.js`

## Archivos principales

- `AlquimistaSalesAssistant.jsx`: orquestador del modulo
- `SalesBubble.jsx`: burbuja flotante
- `SalesAssistantPanel.jsx`: panel conversacional
- `SalesAssistantProductCards.jsx`: render de productos sugeridos
- `salesAssistantProvider.js`: adaptador de backend/proveedor
- `salesAssistant.config.js`: defaults y activacion

## Integracion esperada

Props recomendadas:

- `pathname`
- `products`
- `currentProduct`
- `onTrackEvent`
- `onDirectOrder`

## Regla clave

El modulo no debe conocer detalles internos del resto de la app mas alla del catalogo visible y callbacks de orden / tracking.

## Logica comercial activa

La IA de ventas sigue un playbook propio, separado del chef:

- deteccion de intencion
- venta consultiva
- recomendacion por contexto de uso
- manejo de objeciones
- pre-cierre
- derivacion a humano

Las reglas del vendedor viven en `C:/dev/1_ruta/alchemist/src/sales/`.

## Estado actual

El modulo debe considerarse hoy como:

- MVP funcional serio
- no final
- listo para fase de estabilizacion

Documento de seguimiento:

- `C:/dev/1_ruta/docs/sales-assistant/2026-04-05-fase-actual-y-cierre-vendedor.md`

## Agentes recomendados para evolucion

Orden recomendado:

- `planner`
- `architect`
- `executor`
- `test-engineer`
- `code-reviewer`
- `verifier`

Especialistas segun necesidad:

- `dependency-expert`
- `security-reviewer`

## Skills recomendadas

- `playwright`
- `code-review`
- `note`
- `plan`
