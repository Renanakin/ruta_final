# QA Handoff - Sales Assistant

Fecha: 2026-04-06
Modulo: `sales-assistant`
Responsable tecnico: `codex/sales-assistant-p2-p3`
Objetivo: validar el vendedor IA web despues del cierre de `P2`, el avance fuerte de `P3` y los primeros bloques de `P4`.

## 1. Alcance

- quick replies con `intent + payload`
- memoria corta por sesion
- continuidad de producto, categoria y comparacion
- respuestas deterministicas de catalogo
- bundles y pre-cierre generativo reforzado
- handoff a WhatsApp con resumen comercial mas util

## 2. Precondiciones

- repo actualizado en la rama del trabajo
- backend y frontend levantan sin errores
- variable `VITE_ENABLE_SALES_ASSISTANT=true`
- catalogo accesible desde backend
- widget visible fuera de `/alquimista`

## 3. Entorno

- Repo: `C:/dev/1_ruta`
- Rama sugerida: `codex/sales-assistant-p2-p3`
- Backend:
  - `cd C:/dev/1_ruta/backend`
  - `npm install`
  - `npm test`
  - `npm run start` o `npm run dev`
- Frontend:
  - `cd C:/dev/1_ruta`
  - `npm install`
  - `npm run test:ci`
  - `npm run dev`

## 4. Evidencia automatica ya disponible

- `backend npm test` en verde
- `npm run test:ci` en verde
- suite de evaluacion conversacional con umbral `>= 90%`
  Archivo: `C:/dev/1_ruta/backend/tests/sales.conversation-eval.test.js`
  Resultado esperado actual: `100%`

## 5. Casos de prueba manual

### Caso 1: Apertura y memoria corta

1. abrir home
2. esperar o abrir manualmente el widget
3. preguntar por un producto visible
4. navegar a otro producto
5. usar referencias como `ese`, `el otro`, `comparalos`

Resultado esperado:

- el widget abre sin errores
- recuerda contexto durante la sesion
- las referencias ambiguas usan el contexto reciente

### Caso 2: Precio visible por regla

Mensajes sugeridos:

- `Cual es el precio?`
- `Quiero el precio del huevo blanco extra`
- `Cual es el valor del queso chanco`

Resultado esperado:

- responde sin inventar
- en quesos aclara que el valor es referencial por `1/4 kg`
- ofrece quick replies coherentes

### Caso 3: Disponibilidad y coming soon

Mensajes sugeridos:

- `Esta disponible la longaniza de Capitan Pastene?`
- `Se puede pedir el costillar ahumado?`

Resultado esperado:

- marca `lanzamiento proximo` o equivalente
- no la ofrece como disponible
- propone handoff humano cuando corresponde

### Caso 4: Categoria y uso

Mensajes sugeridos:

- `Que quesos tienen hoy?`
- `Que me conviene en embutidos para asado?`
- `Que queso me conviene para fundir?`
- `Este queso me sirve para tabla?`

Resultado esperado:

- lista opciones de categoria
- prioriza mejor segun uso
- diferencia entre chanco y mantecoso de forma visible
- no cae a respuesta generica si el caso es cerrado

### Caso 5: Comparacion

Mensajes sugeridos:

- `Compara el queso chanco con el mantecoso`
- `Comparalos para fundir`
- `Que diferencia hay entre estos dos?`

Resultado esperado:

- compara precio visible, formato, origen, hechos de familia y uso visible
- cuando son de la misma familia, explica mejor la diferencia
- mantiene `comparedProductIds` en la sesion

### Caso 6: Objecion generativa

Mensajes sugeridos:

- `No se si vale la pena llevar queso ahora`
- `No quiero gastar tanto`
- `No estoy seguro todavia`

Resultado esperado:

- valida la duda
- propone siguiente paso concreto
- evita tono robotico
- no deja la conversacion muerta

### Caso 7: Pre-cierre

Mensajes sugeridos:

- `Ya, dejame una propuesta para avanzar`
- `Arma algo simple para desayuno`

Resultado esperado:

- resume la propuesta
- deja CTA claro para seguir por WhatsApp
- quick replies utilies, no genericas

### Caso 8: Handoff humano

Mensajes sugeridos:

- `Quiero hablar con una persona`
- `Sigamos por WhatsApp`
- `Ya quiero cerrar`

Resultado esperado:

- abre WhatsApp
- el mensaje contiene interes, uso, propuesta y ultimo mensaje
- el resumen se siente util para cierre humano

## 6. Criterios de aceptacion

- el vendedor mantiene continuidad de sesion
- las preguntas cerradas frecuentes no dependen del LLM
- la suite automatica conserva `>= 90%` de acierto
- el pre-cierre deja una propuesta entendible
- el handoff humano llega con contexto util
- no se observan errores visibles en consola durante el flujo principal

## 7. Riesgos conocidos

- matching textual todavia heuristico en algunas referencias ambiguas
- la calidad generativa depende del proveedor si el caso no entra a `P3`
- el handoff sigue consumiendose como string en frontend, aunque backend ya arma detalle estructurado

## 8. Evidencia esperada

- capturas del widget en al menos:
  - recomendacion por uso
  - comparacion
  - pre-cierre
  - handoff
- notas de casos aprobados/fallidos
- porcentaje de la suite automatica
- si hay hallazgos: lista corta con severidad y reproduccion
