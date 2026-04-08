# QA Handoff

Esta carpeta guarda los archivos de handoff de QA que deben dejarse cuando un modulo se cierra pero la validacion manual o conversacional sera ejecutada por otro agente.

## Regla operativa

Si un modulo requiere QA manual, visual, conversacional o exploratorio:

- el agente que implementa debe dejar un archivo en esta carpeta
- ese archivo debe permitir ejecutar el QA sin rearmar contexto desde cero
- el handoff debe quedar listo antes de considerar cerrado el modulo tecnico

## Convencion de nombre

- `YYYY-MM-DD-<modulo>-qa-handoff.md`

Ejemplo:

- `2026-04-06-sales-assistant-qa-handoff.md`

## Contenido minimo

Cada handoff QA debe incluir:

- modulo
- objetivo del QA
- alcance
- precondiciones
- entorno o comandos necesarios
- casos a probar
- criterios de aceptacion
- riesgos conocidos
- evidencia esperada

## Plantilla sugerida

```md
# QA Handoff - <modulo>

Fecha: YYYY-MM-DD
Modulo: `<modulo>`
Responsable tecnico: `<agente o rama>`
Objetivo: `<que debe validar QA>`

## 1. Alcance

- `<flujo 1>`
- `<flujo 2>`

## 2. Precondiciones

- `<feature flag, datos, rama, entorno>`
- `<usuario o estado requerido>`

## 3. Entorno

- Repo: `C:/dev/1_ruta`
- Rama: `<branch>`
- Comandos previos:
  - `<comando>`
  - `<comando>`

## 4. Casos de prueba

1. `<caso>`
   Resultado esperado: `<esperado>`

2. `<caso>`
   Resultado esperado: `<esperado>`

## 5. Criterios de aceptacion

- `<criterio 1>`
- `<criterio 2>`

## 6. Riesgos conocidos

- `<riesgo>`

## 7. Evidencia esperada

- `<capturas, logs, checklist, tasa de acierto, etc.>`
```
