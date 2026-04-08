# QA Handoff - Sales Assistant P5 Final

Fecha: 2026-04-07
Modulo: `sales-assistant`
Objetivo: validar el cierre actual de `P5`, centrado en pre-cierre, gating de datos faltantes y handoff humano enriquecido hacia WhatsApp.

## 1. Alcance

- handoff con `handoffDetails`
- resumen corto valido para schema y util para humano
- gating suave antes del handoff si faltan datos clave
- paso directo a humano si el usuario lo pide explicitamente
- mensaje de WhatsApp enriquecido con contexto comercial

## 2. Precondiciones

- repo en `C:/dev/1_ruta`
- frontend y backend arriba
- `VITE_ENABLE_SALES_ASSISTANT=true`
- widget visible en home publica

## 3. Comandos

Backend:

```powershell
cd C:\dev\1_ruta\backend
npm test
npm run dev
```

Frontend:

```powershell
cd C:\dev\1_ruta
npm run test:ci
npm run dev
```

## 4. Casos manuales prioritarios

### Caso A: Handoff enriquecido con ubicacion

Mensaje:

- `Todavia no estoy seguro, pero si me ordenas una propuesta para Providencia puedo avanzar`

Esperado:

- no cae en fallback
- arma contexto con interes, uso, propuesta y temperatura
- detecta `Providencia` como ubicacion
- si faltan mas datos, pide completar antes del cierre

### Caso B: Gating suave antes del humano

Mensaje:

- `Ya quiero avanzar con el queso`

Esperado:

- se queda en `preclose`
- pide datos faltantes como comuna/uso/urgencia
- quick replies incluyen:
  - `Te doy esos datos`
  - `Quiero seguir igual`

### Caso C: Solicitud explicita de humano

Mensajes:

- `Quiero hablar con una persona`
- `Sigamos por WhatsApp`

Esperado:

- pasa a handoff sin bloquear por falta de datos
- genera mensaje de WhatsApp con:
  - canal
  - interes
  - uso
  - ubicacion si existe
  - urgencia si existe
  - propuesta
  - bundle si existe
  - temperatura
  - motivo de derivacion
  - ultimo mensaje del cliente
  - siguiente paso sugerido

### Caso D: Pre-cierre fuerte

Mensaje:

- `Ya, dejame una propuesta para avanzar`

Esperado:

- mensaje de pre-cierre con resumen
- quick replies claras:
  - `Si, quiero esa propuesta`
  - `Ajusta la propuesta` o equivalente
- no fallback defensivo

## 5. Criterios de aceptacion

- no hay `500/502` en `/api/ai/sales/message`
- no hay fallback defensivo en handoff o pre-cierre
- el gating pide datos faltantes cuando corresponde
- la solicitud explicita de humano no queda bloqueada
- el mensaje de WhatsApp llega con contexto comercial util para cierre

## 6. Evidencia esperada

- capturas del widget antes del handoff
- texto final enviado a WhatsApp
- notas de aprobacion/fallo por caso
- consola/red limpia en el flujo principal
