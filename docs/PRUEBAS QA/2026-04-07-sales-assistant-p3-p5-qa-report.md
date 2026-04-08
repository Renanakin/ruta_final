# QA Report - Sales Assistant P3-P5

Fecha: 2026-04-07
Modulo: sales-assistant
Referencia de ejecucion: docs/PRUEBAS QA/2026-04-07-sales-assistant-p3-p5-qa-handoff.md
Estado general: QA parcial con bloqueos severos

## 1. Resumen ejecutivo

Se ejecuto la pauta completa del handoff P3-P5.

Resultado consolidado:

- automatizacion base: en verde
- flujo manual: parcialmente operativo
- casos de precio, uso/ranking y objecion: estables
- categoria, comparacion, pre-cierre, handoff, gating y handoff enriquecido: con fallos
- criterio de aceptacion "sin 500/502 en /api/ai/sales/message" no se cumple

## 2. Evidencia automatizada

Backend:

- comando: cd C:/dev/1_ruta/backend && npm test
- resultado: OK

Frontend:

- comando: cd C:/dev/1_ruta && npm run test:ci
- resultado: OK

Suite conversacional:

- archivo: C:/dev/1_ruta/backend/tests/sales.conversation-eval.test.js
- estado: incluida en backend test, en verde
- umbral esperado: >= 90%
- estado observado: cumple

## 3. Entorno de prueba manual

- frontend QA usado: http://localhost:4173/
- backend QA usado: http://127.0.0.1:3004
- flag: VITE_ENABLE_SALES_ASSISTANT=true
- superficie validada: home publica (fuera de /alquimista)

Nota de entorno:

- localhost:5173 estaba ocupado por otra app (POS Ruta del Nido)
- se ejecuto QA manual en 4173 para aislar el frontend correcto

## 4. Resultado por caso (handoff P3-P5)

### Caso 1: Precio visible

- estado: PASS
- mensajes:
  - Cual es el precio del huevo blanco extra
  - Cual es el valor del queso chanco
- HTTP: 200, 200
- observacion: responde precio visible correcto; en queso aclara valor referencial por 1/4 kg

### Caso 2: Categoria y listado

- estado: FAIL
- mensajes:
  - Que quesos tienen hoy?
  - Que congelados tienen?
- HTTP: 500, 500
- observacion: cae a fallback defensivo

### Caso 3: Comparacion

- estado: FAIL parcial
- mensajes:
  - Compara el queso chanco con el mantecoso
  - Comparalos para fundir
- HTTP: 500, 200
- observacion: el primer paso cae; no hay continuidad robusta de comparacion

### Caso 4: Uso y ranking por categoria

- estado: PASS
- mensajes:
  - Que queso me conviene para fundir?
  - Que me conviene en embutidos para asado?
  - Este queso me sirve para tabla?
- HTTP: 200, 200, 200
- observacion: prioriza y responde con contexto comercial util

### Caso 5: Objecion

- estado: PASS
- mensajes:
  - No se si vale la pena llevar queso ahora
  - No estoy seguro todavia
- HTTP: 200 (respuesta valida observada)
- observacion: valida duda y mantiene tono comercial razonable

### Caso 6: Pre-cierre

- estado: FAIL
- mensajes:
  - Ya, dejame una propuesta para avanzar
  - Arma algo simple para desayuno
- HTTP: 502, 502
- observacion: fallback defensivo; no deja pre-cierre util

### Caso 7: Handoff directo

- estado: FAIL
- mensajes:
  - Quiero hablar con una persona
  - Sigamos por WhatsApp
- HTTP: 502, 502
- observacion: fallback defensivo; no se abrio popup de WhatsApp en la corrida (popupUrl null)

### Caso 8: Gating de cierre por falta de datos

- estado: FAIL
- mensajes:
  - Ya quiero avanzar con el queso
  - Me interesa esa propuesta
- HTTP: 502, 502
- observacion: no ejecuta gating suave; cae a fallback

### Caso 9: Handoff enriquecido

- estado: FAIL
- mensaje:
  - Todavia no estoy seguro, pero si me ordenas una propuesta para Providencia puedo avanzar
- HTTP: 502
- observacion: no retorna payload enriquecido util en la ruta manual observada

## 5. Hallazgos tecnicos para desarrollo

### Hallazgo A (alta)

Titulo: message supera limite de schema en respuesta del asistente

Evidencia:

- backend log: Too big: expected string to have <=480 characters
- endpoint: POST /api/ai/sales/message
- efecto: 500 y fallback en preguntas de categoria/comparacion

Impacto:

- rompe preguntas cerradas de P3
- afecta continuidad conversacional en flujos clave

### Hallazgo B (alta)

Titulo: respuesta del proveedor invalida quickReplies en ciertos flujos

Evidencia:

- backend log: quickReplies Too small (>=1)
- endpoint: POST /api/ai/sales/message
- estado HTTP observado: 502 en pre-cierre, handoff, gating y handoff enriquecido

Impacto:

- impide cierre asistido
- impide handoff directo robusto

### Hallazgo C (media)

Titulo: handoff manual no abre WhatsApp de forma consistente tras fallback

Evidencia:

- en corrida del Caso 7 no se obtuvo popup de WhatsApp
- popupUrl: null

Impacto:

- riesgo operativo de no derivar al canal humano aun cuando el usuario lo solicita

## 6. Criterios de aceptacion vs estado actual

- no hay 500/502 en /api/ai/sales/message: NO CUMPLE
- no hay fallback defensivo en preguntas cerradas de P3: NO CUMPLE
- pre-cierre y objeciones con salida comercial razonable: PARCIAL
- handoff a WhatsApp con contexto util para cierre humano: NO CUMPLE
- gating suave antes de derivar cuando faltan datos: NO CUMPLE
- suite automatica >=90%: CUMPLE

## 7. Prioridad sugerida de correccion

1. controlar longitud de message para no romper schema
2. garantizar quickReplies validas en todos los caminos, especialmente preclose/handoff
3. asegurar que solicitud explicita de humano derive con exito y contexto util
4. revalidar casos 2, 3, 6, 7, 8 y 9 como regresion minima

## 8. Re-test minimo recomendado tras fix

- Que quesos tienen hoy?
- Compara el queso chanco con el mantecoso
- Que queso me conviene para fundir?
- Ya, dejame una propuesta para avanzar
- Quiero hablar con una persona
- Ya quiero avanzar con el queso
- Todavia no estoy seguro, pero si me ordenas una propuesta para Providencia puedo avanzar

## 9. Estado final de esta corrida

La corrida P3-P5 queda documentada como no aprobada para cierre QA manual.
Se requiere correccion de backend/orquestacion de respuesta para estabilizar categoria/comparacion y completar pre-cierre/handoff/gating.