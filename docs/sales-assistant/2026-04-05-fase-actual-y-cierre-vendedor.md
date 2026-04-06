# Estado Actual y Ruta de Cierre - Vendedor IA

Fecha: 2026-04-05
Modulo: `sales-assistant`
Estado general: MVP funcional serio, no final

## 1. Fase actual

El vendedor se encuentra aproximadamente en este estado:

- `P0` cerrado
- `P1` cerrado
- `P2` no cerrado
- `P3` no cerrado
- `P4` parcial
- `P5` parcial
- `P6` no iniciado
- `P7` no iniciado

## 2. Que ya esta resuelto

### `P0` - Congelamiento funcional

Ya existe:

- rol del vendedor definido
- restricciones comerciales definidas
- separacion entre IA de recetas e IA de ventas
- handoff humano como regla

### `P1` - Catalogo comercial estabilizado

Ya existe:

- consulta real a catalogo desde BD
- verificacion comercial previa al uso de IA
- manejo de `coming_soon`
- tratamiento especial para productos con precio referencial

### `P4` parcial - Motor generativo comercial

Ya existe:

- dominio `sales` separado dentro de `alchemist`
- prompt y schemas propios
- endpoint `/api/ai/sales/message`
- integracion real con Gemini en modo prueba

### `P5` parcial - Handoff humano

Ya existe:

- derivacion a WhatsApp
- resumen base de handoff
- activacion visible del vendedor en la web

## 3. Que falta para que sea final

## `P2` - Intent router y memoria corta

Falta:

- quick replies con `intent + payload`
- memoria corta por sesion
- referencia contextual entre mensajes
- continuidad de categoria, producto y comparacion

Sin esto:

- los botones pueden fallar
- el vendedor pierde contexto
- referencias como "ellos" o "ese" no son robustas

## `P3` - Motor deterministico de respuestas cerradas

Falta:

- responder por reglas preguntas de catalogo
- comparador de productos
- respuestas cerradas por categoria
- respuestas de precio visible, diferencias y disponibilidad sin LLM

Sin esto:

- hay demasiada dependencia del modelo
- aumentan los fallbacks innecesarios

## `P4` - Cierre de la parte generativa

Falta:

- objeciones mejor trabajadas
- bundles consistentes
- pre-cierre mas fuerte
- menos variabilidad en respuestas

## `P5` - Cierre del handoff humano

Falta:

- resumen estructurado mas completo
- levantar comuna, contexto de uso y nivel de interes
- temperatura del lead realmente util para cierre

## `P6` - Observabilidad y QA conversacional

Falta:

- logs por intent
- trazabilidad de fallback
- tasa de handoff
- suite de pruebas conversacionales
- dashboard minimo

## `P7` - Piloto controlado

Falta:

- rollout de prueba controlado
- observacion con trafico real
- ajustes segun comportamiento comercial

## 4. Definicion de "final"

El vendedor puede considerarse final cuando cumpla lo siguiente:

- quick replies sin fallos de interpretacion
- preguntas de catalogo resueltas por reglas en la mayoria de los casos
- continuidad entre mensajes
- fallback duro muy reducido
- derivacion solo cuando agrega valor real
- resumen comercial util para cierre humano
- metricas y trazabilidad activas
- piloto real superado sin errores criticos

## 5. Orden de cierre recomendado

Orden recomendado para pasar de MVP a version final:

1. cerrar `P2`
2. cerrar `P3`
3. cerrar `P4`
4. cerrar `P5`
5. ejecutar `P6`
6. liberar `P7`

## 6. Agentes recomendados para ejecutar el cierre

### Secuencia sugerida

- `planner`
  - define cortes, alcance por sprint y criterio de cierre

- `architect`
  - disena intents, estado, arbol de decision y separacion reglas/IA

- `executor`
  - implementa motor deterministico, memoria, contratos y UI

- `test-engineer`
  - arma la suite conversacional y pruebas de regresion

- `code-reviewer`
  - revisa riesgos de comportamiento, regresion y consistencia

- `verifier`
  - valida que la fase realmente cumpla los criterios

### Especialistas opcionales

- `dependency-expert`
  - si se evalua evolucion a Rasa, Chatwoot, Medusa o Saleor

- `security-reviewer`
  - si se abre a produccion o se tocan datos sensibles

## 7. Habilidades recomendadas

Para ejecutar correctamente el cierre, se recomienda priorizar:

- `playwright`
  - para QA real del widget y flujos conversacionales en navegador

- `code-review`
  - para revisar regresiones y riesgos de comportamiento

- `note`
  - para registrar hallazgos y decisiones durante iteracion

- `plan`
  - si se quiere formalizar el cierre en sprint o etapas operativas

## 8. Decision operativa sugerida

No se recomienda llamar "final" al vendedor en su estado actual.

Si la decision es avanzar, lo correcto es tratarlo como:

- MVP funcional serio
- listo para fase de estabilizacion avanzada
- no listo aun para considerarlo cerrado definitivamente

## 9. Siguiente documento recomendado

Si se aprueba el cierre del vendedor, el siguiente documento a producir deberia ser:

- tabla de intents
- estado de sesion
- arbol de decision
- payloads frontend/backend
- plan por sprint
