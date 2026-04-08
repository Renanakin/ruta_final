# QA Handoff - Sales Assistant P3-P5

Fecha: 2026-04-07
Modulo: `sales-assistant`
Rama de trabajo sugerida: `codex/sales-assistant-p2-p3`
Objetivo: validar el estado actual del vendedor IA despues del cierre fuerte de `P3`, el avance de `P4` y el remate operativo de `P5`.

## 1. Alcance

- preguntas cerradas de catalogo sin depender del LLM
- continuidad conversacional por sesion
- bundles y pre-cierre generativo reforzado
- handoff humano con resumen comercial estructurado
- gating suave antes del cierre cuando faltan datos comerciales clave

## 2. Precondiciones

- repo en `C:/dev/1_ruta`
- backend funcional en `127.0.0.1:3004`
- frontend funcional en `localhost:5173`
- `VITE_ENABLE_SALES_ASSISTANT=true`
- widget visible fuera de `/alquimista`

## 3. Comandos base

Backend:

```powershell
cd C:\dev\1_ruta\backend
npm install
npm test
npm run dev
```

Frontend:

```powershell
cd C:\dev\1_ruta
npm install
npm run test:ci
npm run dev
```

## 4. Evidencia automatica esperada

- `backend npm test` en verde
- `npm run test:ci` en verde
- suite conversacional automatica en:
  - `C:/dev/1_ruta/backend/tests/sales.conversation-eval.test.js`
- umbral esperado actual:
  - `>= 90%`

## 5. Casos manuales prioritarios

### Caso 1: Precio visible

Mensajes:

- `Cual es el precio del huevo blanco extra`
- `Cual es el valor del queso chanco`

Esperado:

- precio visible correcto
- en quesos aclara que es referencial por `1/4 kg`
- quick replies coherentes

### Caso 2: Categoria y listado

Mensajes:

- `Que quesos tienen hoy?`
- `Que congelados tienen?`

Esperado:

- lista de categoria sin fallback defensivo
- productos visibles correctos
- quick replies de precio/formato/uso

### Caso 3: Comparacion

Mensajes:

- `Compara el queso chanco con el mantecoso`
- `Comparalos para fundir`

Esperado:

- compara precio visible, formato, origen, hechos de familia y uso visible
- si son de la misma familia, explica mejor la diferencia
- no cae a fallback general

### Caso 4: Uso y ranking por categoria

Mensajes:

- `Que queso me conviene para fundir?`
- `Que me conviene en embutidos para asado?`
- `Este queso me sirve para tabla?`

Esperado:

- prioriza mejor opcion segun uso
- mensaje no generico
- mantiene contexto de categoria/producto

### Caso 5: Objecion

Mensajes:

- `No se si vale la pena llevar queso ahora`
- `No estoy seguro todavia`

Esperado:

- valida la duda
- responde con propuesta concreta
- no usa tono robotico

### Caso 6: Pre-cierre

Mensajes:

- `Ya, dejame una propuesta para avanzar`
- `Arma algo simple para desayuno`

Esperado:

- resumen comercial claro
- CTA util
- quick reply tipo `Si, quiero esa propuesta`
- quick reply para ajustar propuesta

### Caso 7: Handoff directo

Mensajes:

- `Quiero hablar con una persona`
- `Sigamos por WhatsApp`

Esperado:

- deriva al humano
- WhatsApp incluye:
  - interes
  - uso
  - propuesta
  - temperatura
  - motivo de derivacion
  - ultimo mensaje

### Caso 8: Gating de cierre por falta de datos

Mensajes:

- `Ya quiero avanzar con el queso`
- `Me interesa esa propuesta`

Esperado:

- si faltan comuna/uso/urgencia y no hay solicitud explicita de humano:
  - el flujo se queda en `preclose`
  - pide datos faltantes antes de derivar
  - ofrece quick reply para completar datos
- si el usuario fuerza `WhatsApp/persona/humano`, deja pasar con el mejor contexto disponible

### Caso 9: Handoff enriquecido

Mensajes:

- `Todavia no estoy seguro, pero si me ordenas una propuesta para Providencia puedo avanzar`

Esperado:

- resumen corto valido
- `handoffDetails` con:
  - `customerNeed`
  - `useContext`
  - `locationHint`
  - `urgencyHint` si aplica
  - `handoffReason`
  - `channel`
  - `lastCustomerMessage`
  - `proposedProducts`
  - `bundleTitle`
  - `leadTemperature`
  - `nextAction`

## 6. Criterios de aceptacion

- no hay `500` ni `502` en `/api/ai/sales/message` durante el flujo principal
- no hay fallback defensivo en preguntas cerradas de `P3`
- pre-cierre y objeciones muestran salida comercial razonable
- handoff a WhatsApp llega con contexto util para cierre humano
- si faltan datos de cierre, el sistema pregunta antes de derivar, salvo solicitud explicita de humano
- la suite automatica se mantiene `>= 90%`

## 7. Riesgos conocidos

- el matching conversacional sigue siendo heuristico
- el texto del handoff se compacta para respetar el schema
- algunos casos ambiguos todavia pueden caer al flujo generativo

## 8. Evidencia esperada

- capturas del widget en:
  - categoria
  - comparacion
  - objecion
  - pre-cierre
  - handoff
- registro corto de aprobados/fallidos
- porcentaje de la suite automatica
- errores de consola o red si aparecen

## 9. Casos minimos de re-test si hay hallazgos

- `Que quesos tienen hoy?`
- `Compara el queso chanco con el mantecoso`
- `Que queso me conviene para fundir?`
- `Ya, dejame una propuesta para avanzar`
- `Quiero hablar con una persona`
- `Ya quiero avanzar con el queso`

