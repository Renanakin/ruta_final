# Propuesta de Desarrollo - Vendedor IA OSS para Ruta del Nido

Fecha: 2026-04-05
Fuente base analizada: `C:/Users/HackBook/Downloads/Solución definitiva 100% open source para estabilizar un asistente comercial de ventas para rutadeln.docx`
Estado: propuesta para decision

## 1. Objetivo de este documento

Traducir el documento recibido a una propuesta de desarrollo realista para Ruta del Nido, considerando:

- el estado actual del proyecto
- la arquitectura ya existente
- la necesidad de estabilizar primero lo esencial
- la posibilidad de evolucionar a una solucion OSS mas robusta

Este documento no implementa nada. Sirve para evaluar si conviene ejecutar la solucion y bajo que secuencia.

## 2. Resumen del documento analizado

El documento propone una solucion "definitiva" 100% open source para estabilizar un asistente comercial.

La tesis central del documento es correcta:

- el asistente no debe depender solo del LLM
- lo determinista debe separarse de lo generativo
- el catalogo debe ser una fuente canonica
- el cierre humano debe mantenerse
- el sistema debe tener estado, observabilidad y handoff controlado

La propuesta del documento se apoya en una pila OSS mas grande:

- Chatwoot Community como canal + inbox humano
- Rasa como motor conversacional / estado / pruebas E2E
- Medusa o Saleor como fuente formal de comercio
- Mistral / Mixtral + vLLM o llama.cpp para LLM OSS self-hosted
- Qdrant + embeddings para RAG opcional
- OpenTelemetry + Prometheus + Jaeger para observabilidad

## 3. Diagnostico frente al proyecto actual

## 3.1 Lo que ya existe hoy

Ruta del Nido ya tiene:

- frontend React/Vite
- backend Node/Express
- modulo `alchemist`
- catalogo y datos en SQLite
- endpoint de IA del chef
- una primera version del vendedor IA

Eso cambia la evaluacion:

- no partimos desde cero
- ya existe un esqueleto de vendedor
- ya hay una base operativa
- el siguiente paso no es necesariamente "meter toda la plataforma OSS"

## 3.2 Lo valioso del documento

El documento aporta cinco ideas muy correctas:

1. separar respuestas de catalogo de respuestas generativas
2. usar fuente canonica de productos
3. mantener handoff humano como cierre
4. registrar estado y observabilidad
5. construir estabilidad por capas, no por prompt

## 3.3 Lo que no recomiendo adoptar de inmediato

No recomiendo como siguiente paso inmediato:

- migrar ya a Chatwoot
- migrar ya a Rasa
- implantar ya Medusa o Saleor
- montar ya un stack LLM self-hosted OSS completo

Motivo:

eso aumentaria mucho alcance, costo, complejidad y tiempo antes de validar si el vendedor funciona bien comercialmente en Ruta del Nido.

## 4. Decision tecnica recomendada

### Recomendacion principal

Adoptar el documento como **arquitectura objetivo** y no como **primer sprint**.

### Estrategia correcta

Trabajar en dos niveles:

- **Nivel A: estabilizacion inmediata sobre la arquitectura actual**
- **Nivel B: evolucion OSS por etapas si el vendedor demuestra valor**

## 5. Arquitectura objetivo

La arquitectura objetivo inspirada en el documento seria:

1. canal web conversacional
2. motor de intents y estado
3. catalogo y politicas como fuente de verdad
4. razonamiento generativo acotado
5. pre-cierre comercial
6. handoff humano
7. observabilidad completa

## 6. Arquitectura recomendada para Ruta del Nido

## 6.1 Etapa actual recomendada

Mantener:

- frontend React/Vite
- backend Express
- SQLite
- modulo `alchemist`

Agregar:

- intent router
- state manager corto
- motor deterministico de catalogo
- vendedor IA mas robusto
- handoff a WhatsApp estructurado
- trazabilidad comercial

## 6.2 Etapa futura opcional

Si el vendedor se valida y crece, entonces evaluar:

- Chatwoot para inbox humano
- Rasa para intents, estado y pruebas
- Medusa o Saleor para formalizar comercio
- LLM OSS self-hosted

## 7. Propuesta de desarrollo por fases

## Fase P0 - Congelamiento funcional del vendedor

Objetivo:
definir que hace y que no hace el vendedor.

Incluye:

- intents oficiales
- categorias de preguntas
- condiciones de handoff
- nivel de autonomia permitido
- mensajes que nunca debe inventar

Entregables:

- documento de alcance funcional
- tabla de intents oficial
- matriz de restricciones comerciales

Duracion estimada:
2 a 4 dias

## Fase P1 - Estabilizacion del catalogo como fuente canonica

Objetivo:
garantizar que el vendedor consulte una fuente comercial consistente.

Incluye:

- normalizacion del estado comercial
- producto disponible vs proximo
- precios visibles vs referenciales
- metadata comercial util

Entregables:

- snapshot de catalogo comercial
- reglas de disponibilidad
- validaciones de integridad

Duracion estimada:
3 a 5 dias

## Fase P2 - Intent router + memoria corta

Objetivo:
evitar que quick replies y preguntas simples dependan completamente de IA.

Incluye:

- intents para botones
- parseo de texto libre
- estado conversacional corto
- continuidad entre mensajes

Entregables:

- intent resolver
- state store de sesion
- continuidad de tema, categoria y comparacion

Duracion estimada:
4 a 7 dias

## Fase P3 - Motor deterministico de respuestas cerradas

Objetivo:
resolver sin LLM todas las consultas que no requieren razonamiento generativo.

Incluye:

- productos disponibles
- tipos de queso
- precios visibles
- diferencias entre opciones
- productos proximos
- respuestas basadas en reglas de uso

Entregables:

- catalog answer engine
- comparador de productos
- respuestas por categoria

Duracion estimada:
5 a 8 dias

## Fase P4 - Motor generativo comercial

Objetivo:
usar la IA solo donde realmente aporta valor.

Incluye:

- recomendacion consultiva
- venta cruzada
- upsell
- bundles
- manejo de objeciones
- pre-cierre

Entregables:

- prompt comercial final
- respuesta estructurada de ventas
- degradacion elegante si falla el modelo

Duracion estimada:
4 a 7 dias

## Fase P5 - Handoff humano estructurado

Objetivo:
dejar ventas listas para cierre humano.

Incluye:

- resumen de pre-pedido
- derivacion a WhatsApp
- payload de handoff
- lead temperature

Entregables:

- resumen estructurado
- derivacion clara
- datos minimos para cierre

Duracion estimada:
2 a 4 dias

## Fase P6 - Observabilidad y QA conversacional

Objetivo:
medir confiabilidad y conversion.

Incluye:

- logs por intent
- source quick reply / texto libre
- tasa de fallback
- tasa de handoff
- suite de pruebas conversacionales

Entregables:

- dashboard minimo
- matriz de casos QA
- indicadores de estabilidad

Duracion estimada:
4 a 6 dias

## Fase P7 - Piloto controlado

Objetivo:
activar en produccion o preproduccion con control.

Incluye:

- feature flag
- segmento de trafico acotado
- monitoreo
- retroalimentacion comercial

Entregables:

- rollout controlado
- reporte de resultados
- decision de escalar o pausar

Duracion estimada:
1 a 2 semanas

## 8. Alcance de la primera entrega recomendada

La primera entrega no deberia intentar toda la plataforma del documento.

Debe incluir:

- catalogo comercial estabilizado
- intents + quick replies estructuradas
- memoria corta
- respuestas deterministicas
- IA para recomendacion y objeciones
- handoff humano
- logs basicos

No deberia incluir aun:

- Chatwoot
- Rasa
- Medusa/Saleor
- Qdrant
- Mistral self-hosted
- observabilidad enterprise completa

## 9. Beneficios esperados

Si se ejecuta esta propuesta por fases, el vendedor deberia:

- dejar de fallar en botones frecuentes
- responder preguntas cerradas con mas consistencia
- mantener continuidad en comparaciones
- reducir fallbacks inutiles
- dejar leads mejor ordenados
- mejorar conversion a contacto humano

## 10. Riesgos del camino recomendado

### Riesgo 1

Que el equipo quiera meter toda la solucion OSS de una sola vez.

Impacto:

- se alarga el tiempo
- se dispersa el foco
- se retrasa validacion real

Mitigacion:

- separar arquitectura objetivo de roadmap inmediato

### Riesgo 2

Que se intente resolver todo con prompt.

Impacto:

- el sistema sigue siendo fragil

Mitigacion:

- priorizar intents, reglas, estado y fallback

### Riesgo 3

Que el catalogo siga inconsistene.

Impacto:

- el vendedor seguira contradiciendose

Mitigacion:

- fase de normalizacion comercial obligatoria

## 11. Costos y complejidad

### Camino recomendado

Costo:
medio

Complejidad:
media

Tiempo:
3 a 6 semanas para dejar un vendedor mucho mas estable

### Camino OSS total inmediato

Costo:
alto

Complejidad:
alta

Tiempo:
8 a 16 semanas segun madurez del catalogo, infraestructura y equipo

## 12. Recomendacion final

La recomendacion es:

1. tomar el documento recibido como vision correcta de largo plazo
2. no implantar todavia toda la pila OSS propuesta
3. ejecutar primero una estabilizacion seria sobre la arquitectura actual
4. medir resultados reales
5. solo despues decidir si vale la pena escalar a Chatwoot/Rasa/commerce OSS formal

## 13. Decision sugerida

Si el objetivo es **usar pronto** al vendedor y mejorar conversion sin abrir un proyecto demasiado grande:

- **sí recomiendo ejecutar esta propuesta**
- pero en su version **faseada e incremental**

Si el objetivo fuera transformar de inmediato todo el stack conversacional/comercial:

- **no lo recomiendo como siguiente paso inmediato**

## 14. Siguiente paso si se aprueba

Si se aprueba esta propuesta, el siguiente documento a producir deberia ser:

- tabla exacta de intents
- esquema de estado de sesion
- arbol de decision `reglas -> IA -> fallback -> humano`
- payloads backend/frontend
- plan de implementacion por sprint
