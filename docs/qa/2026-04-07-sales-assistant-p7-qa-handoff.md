# QA Handoff - sales-assistant-p7

Fecha: 2026-04-07
Modulo: `sales-assistant`
Responsable tecnico: `Codex`
Objetivo: validar el piloto controlado antes de abrir trafico real

## 1. Alcance

- elegibilidad por cohorte
- kill switch
- QA force
- allowlist
- scope por pagina
- lectura operativa en CRM

## 2. Precondiciones

- `VITE_ENABLE_SALES_ASSISTANT=true`
- backend levantado con base inicializada
- acceso admin a `/crm`
- piloto accesible en `Sales Assistant: Piloto Controlado`

## 3. Entorno

- Repo: `C:/dev/1_ruta`
- Comandos previos:
  - `cd backend && npm test`
  - `npm run test:ci`

## 4. Casos de prueba

1. Kill switch
   Resultado esperado: con `enabled=off` el widget no aparece.

2. QA force
   Resultado esperado: con `qa_force_enabled=on` y `?salesAssistantPilot=force` el widget aparece.

3. Allowlist
   Resultado esperado: con allowlist activa y `?salesAssistantPilotToken=<token>` el widget aparece.

4. Scope producto
   Resultado esperado: con `page_scope=product_only` el widget no aparece en home y si en ficha de producto.

5. Rollout inicial
   Resultado esperado: con preset `10% producto` solo una fraccion de sesiones ve el widget.

6. CRM observabilidad
   Resultado esperado: el panel admin muestra KPIs, trazas y advertencias de readiness.

## 5. Criterios de aceptacion

- kill switch responde sin redeploy
- QA puede entrar con modo forzado
- allowlist funciona con token valido
- el scope configurado se respeta
- el panel CRM deja guardar presets y leer estado actualizado

## 6. Riesgos conocidos

- si `VITE_ENABLE_SALES_ASSISTANT=false`, el CRM no puede encender el piloto por si solo
- la cohorte es por sesion, no por usuario autenticado

## 7. Evidencia esperada

- capturas del panel CRM con preset aplicado
- captura del widget visible/invisible segun caso
- registro de trazas `sales assistant` en CRM
