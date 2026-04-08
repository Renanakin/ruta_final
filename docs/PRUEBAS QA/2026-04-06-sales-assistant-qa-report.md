# QA Report - Sales Assistant

Fecha: 2026-04-06
Modulo: `sales-assistant`
Ejecutado por: `GitHub Copilot / GPT-5.4`
Fuente base: `docs/PRUEBAS QA/2026-04-06-sales-assistant-qa-handoff.md`
Estado general: `qa parcial con bloqueos severos`

## 1. Resumen ejecutivo

Se ejecuto la validacion automatizada y una pasada manual del widget del vendedor IA en la home.

Resultado consolidado:

- automatizacion base en verde
- flujo manual parcialmente operativo
- existen fallos severos que bloquean categoria, comparacion y cierre hacia handoff humano
- no se cumple el criterio de aceptacion de no tener errores visibles en consola durante el flujo principal

## 2. Evidencia automatizada

Backend:

- comando ejecutado: `cd C:/dev/1_ruta/backend && npm test`
- resultado: `OK`

Frontend:

- comando ejecutado: `cd C:/dev/1_ruta && npm run test:ci`
- resultado: `OK`

Observacion:

- la automatizacion actual no detecta los fallos manuales observados en el flujo real del widget

## 3. Entorno usado para la prueba manual

- frontend: `http://localhost:5173`
- backend: `http://127.0.0.1:3004`
- flag activo: `VITE_ENABLE_SALES_ASSISTANT=true`
- superficie validada: home publica fuera de `/alquimista`

## 4. Casos ejecutados y resultado

### Caso A: Apertura del widget

- resultado: `aprobado`
- detalle: el widget abre correctamente en home y queda visible para interaccion manual

### Caso B: Precio visible por regla

- mensaje probado: `Cual es el precio del huevo blanco extra`
- resultado: `aprobado`
- comportamiento observado: responde con precio visible, recomienda el producto correcto y ofrece quick replies coherentes

### Caso C: Disponibilidad / coming soon

- mensaje probado: `Se puede pedir el costillar ahumado`
- resultado: `aprobado con observacion`
- comportamiento observado: indica que no esta disponible para venta directa y propone alternativa o persona
- observacion: sigue mostrando CTA de producto sugerido aunque el item no esta disponible para cierre directo

### Caso D: Categoria

- mensaje probado: `Que quesos tienen hoy?`
- resultado: `fallido`
- comportamiento observado: el frontend cae al fallback `No pude preparar una recomendacion ahora mismo...`
- efecto usuario: la pregunta cerrada deja de ser deterministica y se degrada a handoff genrico

### Caso E: Comparacion

- mensaje probado: `Compara el queso chanco con el mantecoso`
- resultado: `fallido`
- comportamiento observado: vuelve a caer al fallback en vez de responder comparacion visible con datos de catalogo

### Caso F: Pre-cierre

- mensaje probado: `Ya, dejame una propuesta para avanzar`
- resultado: `aprobado`
- comportamiento observado: reutiliza el producto consultado previamente y deja CTA comercial claro

### Caso G: Handoff humano desde pre-cierre

- accion probada: quick reply `Si, quiero ese pedido`
- resultado: `fallido`
- comportamiento observado: el flujo no llega a handoff util; cae otra vez al fallback de contingencia

## 5. Hallazgos para desarrollo

### Hallazgo 1 - Severidad alta

Titulo: respuesta deterministica excede el maximo permitido de `message`

Reproduccion:

1. abrir home
2. abrir widget
3. enviar `Que quesos tienen hoy?`

Resultado esperado:

- respuesta deterministica de catalogo
- lista de quesos disponibles
- quick replies coherentes

Resultado real:

- fallback en frontend
- error `500` en backend

Evidencia tecnica:

- el backend registra `Too big: expected string to have <=480 characters`
- el parseo falla en `backend/alchemist/src/sales/sales.service.js`
- el limite esta definido en `backend/alchemist/src/sales/sales.schemas.js`

Impacto:

- rompe preguntas cerradas de categoria
- rompe comparaciones largas
- invalida parte central de `P3`

### Hallazgo 2 - Severidad alta

Titulo: el flujo de handoff generado puede devolver `quickReplies` vacio y se invalida

Reproduccion:

1. abrir widget
2. consultar `Cual es el precio del huevo blanco extra`
3. enviar `Ya, dejame una propuesta para avanzar`
4. pulsar `Si, quiero ese pedido`

Resultado esperado:

- paso a handoff humano
- resumen comercial util para WhatsApp

Resultado real:

- warning de respuesta invalida del proveedor
- el flujo cae al fallback general

Evidencia tecnica:

- el backend registra `Too small: expected array to have >=1 items`
- la respuesta generativa llega con `quickReplies: []`
- el esquema exige al menos una quick reply en `backend/alchemist/src/sales/sales.schemas.js`

Impacto:

- bloquea cierre comercial asistido
- el usuario queda atrapado en una salida defensiva en vez de pasar al humano

### Hallazgo 3 - Severidad media

Titulo: el handoff fallback no garantiza contexto comercial suficiente

Reproduccion:

1. provocar cualquier fallback del widget
2. pulsar `Continuar con una persona`

Resultado esperado:

- mensaje de WhatsApp con interes, uso, propuesta y ultimo mensaje

Resultado real:

- el fallback usa un resumen generico
- no queda garantizado el contexto de cierre definido por QA

Impacto:

- el equipo humano recibe menos contexto del esperado
- baja la utilidad real del handoff cuando el flujo no logra cerrar bien

## 6. Estado frente a criterios de aceptacion

- continuidad de sesion: `parcialmente cumplido`
- preguntas cerradas frecuentes sin depender del LLM: `no cumplido`
- suite automatica `>= 90%`: `cumplido`
- pre-cierre entendible: `cumplido`
- handoff humano con contexto util: `no cumplido`
- sin errores visibles en consola durante el flujo principal: `no cumplido`

## 7. Prioridad sugerida de correccion

1. limitar o compactar mensajes deterministas para que nunca excedan el maximo del esquema
2. garantizar quick replies validas en cualquier respuesta con `nextStep=handoff` o `nextStep=preclose`
3. reforzar el resumen de WhatsApp para que conserve contexto util incluso en fallback
4. revalidar categoria, comparacion y cierre manual despues del fix

## 8. Casos minimos a re-ejecutar despues de la solucion

- `Que quesos tienen hoy?`
- `Compara el queso chanco con el mantecoso`
- `Comparalos para fundir`
- `Cual es el precio del huevo blanco extra`
- `Ya, dejame una propuesta para avanzar`
- quick reply `Si, quiero ese pedido`
- `Se puede pedir el costillar ahumado`

## 9. Criterio para marcar re-test como aprobado

- sin errores `500` o `502` en el endpoint `/api/ai/sales/message`
- sin fallback defensivo en preguntas cerradas de categoria y comparacion
- handoff humano con mensaje util para cierre
- quick replies siempre presentes cuando el flujo exige siguiente paso

## 10. Siguiente paso operativo

Desarrollo debe corregir los hallazgos de severidad alta y avisar cuando el modulo este listo para re-test.
Despues de esa correccion, se debe volver a ejecutar este mismo set de pruebas manuales y contrastarlo contra este reporte.