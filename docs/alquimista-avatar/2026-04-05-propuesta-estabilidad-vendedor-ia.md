# Propuesta Ejecutiva - Estabilidad del Vendedor IA

Fecha: 2026-04-05
Estado: Documento operativo para equipo tecnico y de producto
Scope: estabilizacion del asistente comercial "El Alquimista Vendedor"

## 1. Resumen ejecutivo

El problema actual del vendedor IA no es solo de prompt ni solo de interfaz.

La evidencia observada muestra tres fallas de base:

- respuestas validas que terminan en fallback
- perdida de continuidad conversacional entre mensajes consecutivos
- quick replies tratadas como texto libre en vez de intents controlados

Conclusión:

El vendedor aun no opera como motor comercial confiable. Para usarlo en serio, debe pasar de una arquitectura demasiado dependiente del modelo a una arquitectura conversacional hibrida:

- deterministica para catalogo, estado y continuidad
- generativa para recomendacion, objeciones y pre-cierre

## 2. Sintoma observado

Casos reportados:

- botones prehechos fallan al responder
- algunas consultas directas simples si responden
- otras consultas simples caen en fallback duro
- referencias conversacionales como "ellos" pierden contexto
- el sistema deriva antes de tiempo a humano en vez de intentar resolver

Ejemplos representativos:

- `Ayudame a elegir` -> fallback
- `Quesos` despues de una comparacion -> fallback
- `que productos tienen` -> responde
- `que valor tienen los quesos y que tipo tienen` -> responde
- `y que precio tiene el queso y que tipos tienen` -> fallback
- `¿Cual es la diferencia entre ellos?` -> pierde referencia si no mantiene tema

## 3. Diagnostico

### 3.1 Quick replies sin contrato fuerte

Los botones parecen viajar como texto libre y no como accion semantica estructurada.

Riesgo:

- el modelo debe interpretar algo que el sistema ya deberia saber
- aumenta variabilidad
- baja confiabilidad

### 3.2 Ausencia de memoria corta real

El sistema no sostiene de forma robusta:

- categoria activa
- producto mencionado
- comparacion en curso
- contexto de uso
- intencion comercial

Riesgo:

- el usuario hace una pregunta referencial y el asistente no sabe a que se refiere

### 3.3 Dependencia excesiva de IA para consultas cerradas

Preguntas que deberian resolverse por reglas hoy dependen demasiado del modelo:

- que productos hay
- que quesos hay
- cual es la diferencia
- cual es el precio visible
- que esta disponible
- que esta proximo

Riesgo:

- fallbacks innecesarios
- mas latencia
- mas error
- mas costo

### 3.4 Fallback demasiado agresivo

El sistema cae rapido al mensaje:

> No pude preparar una recomendacion ahora mismo...

En vez de:

1. responder por reglas
2. pedir aclaracion util
3. reintentar con contexto
4. derivar

### 3.5 Falta de observabilidad conversacional

Hoy no queda suficientemente trazado:

- si la entrada vino de quick reply o texto
- que intent se detecto
- que tema estaba activo
- si respondio reglas o IA
- por que cayo en fallback

## 4. Propuesta de solucion

Se propone migrar el vendedor a una arquitectura conversacional hibrida.

## 4.1 Principio

No todo debe pasar por la IA.

La IA debe usarse donde agrega valor:

- recomendacion
- venta cruzada
- manejo de objeciones
- pre-cierre
- tono consultivo

Las preguntas cerradas deben resolverse con logica controlada del sistema.

## 4.2 Capas propuestas

### Capa 1 - Intent Resolver

Convierte input a una intencion estructurada.

Fuentes:

- quick replies
- texto libre

Salida ejemplo:

```json
{
  "intent": "ask_cheese_comparison",
  "source": "quick_reply",
  "confidence": 0.98
}
```

### Capa 2 - Conversation State

Memoria corta por sesion.

Debe persistir al menos:

- `activeCategory`
- `activeProducts`
- `lastComparedProducts`
- `currentNeed`
- `leadTemperature`
- `lastIntent`
- `pendingQuestion`

### Capa 3 - Catalog Answer Engine

Motor deterministico para preguntas de catalogo.

Debe resolver sin LLM:

- productos vigentes
- precios visibles
- diferencias entre categorias
- comparaciones cerradas
- estado comercial (`available`, `coming_soon`, `unavailable`)

### Capa 4 - Sales Reasoning Engine

Solo entra cuando la consulta necesita razonamiento comercial.

Casos:

- "que me recomiendas"
- "arma algo para desayuno"
- "quiero algo rico pero facil"
- "esta caro"
- "que me conviene para una reunion"

### Capa 5 - Fallback Orchestrator

Maneja salida progresiva:

1. resolver por reglas
2. pedir aclaracion
3. reintentar con contexto
4. derivar a humano

## 5. Quick replies: nuevo modelo obligatorio

Cada boton debe enviar una accion estructurada.

No debe viajar solo como texto visible.

### Propuesta de forma

```json
{
  "label": "Quesos",
  "intent": "ask_category",
  "payload": {
    "category": "quesos"
  }
}
```

### Beneficio

- elimina ambiguedad
- mejora continuidad
- reduce dependencia del modelo
- permite telemetria real

## 6. Memoria corta recomendada

Estado minimo de sesion:

```json
{
  "sessionId": "uuid",
  "activeCategory": "quesos",
  "activeProducts": ["Queso Chanco de Lican Ray", "Queso Mantecoso de Pua (Horma)"],
  "lastComparedProducts": ["Queso Chanco de Lican Ray", "Queso Mantecoso de Pua (Horma)"],
  "currentNeed": "tabla",
  "leadTemperature": "tibio",
  "lastIntent": "ask_cheese_catalog",
  "pendingQuestion": null
}
```

### Regla clave

Si el usuario pregunta:

- "cual es la diferencia entre ellos"

El sistema debe mirar primero el estado antes de llamar a IA.

## 7. Preguntas que deben salir por reglas

Estas preguntas no deberian depender del modelo:

- que productos tienen
- que quesos tienen
- que precio tienen
- cuales estan proximos
- cual es la diferencia entre los dos quesos
- que producto sirve para desayuno
- que producto sirve para reunion

### Reglas concretas

- Desayuno -> huevos, luego queso como complemento
- Tabla / aperitivo -> quesos, luego longaniza si aplica
- Practicidad semanal -> salmon, camaron, surtido, huevos
- Asado / reunion -> longaniza, costillares si no estan proximos

## 8. IA solo donde agrega valor

La IA debe intervenir en:

- recomendacion personalizada
- construccion de bundles
- manejo de objeciones
- pre-cierre comercial
- derivacion elegante

No debe ser la primera linea para contestar preguntas estructuradas de catalogo.

## 9. Fallback progresivo

Se propone reemplazar el fallback unico por una escalera de recuperacion.

### Nivel 1

Resolver por reglas del catalogo.

### Nivel 2

Pedir aclaracion minima.

Ejemplo:

> Te refieres a los quesos o a otra categoria?

### Nivel 3

Reintento con contexto reforzado.

### Nivel 4

Derivacion a humano.

### Regla

No derivar directamente si la pregunta era cerrada y respondible desde sistema.

## 10. Observabilidad recomendada

Por cada turno registrar:

- `session_id`
- `input_text`
- `source` (`quick_reply` | `free_text`)
- `intent_detected`
- `intent_confidence`
- `active_category_before`
- `active_category_after`
- `resolved_by` (`rules` | `llm` | `fallback`)
- `fallback_reason`
- `handoff_triggered`
- `lead_temperature`

## 11. Fases de implementacion

## Fase V0 - Auditoria de fallos

Objetivo:
clasificar el 100% de fallos observados.

Entregables:

- matriz de errores por caso
- top consultas con fallback
- quick replies rotas detectadas

## Fase V1 - Contrato de intents

Objetivo:
dejar todos los botones como acciones estructuradas.

Entregables:

- tabla oficial de intents
- payload por quick reply
- parser base de texto libre

## Fase V2 - Estado conversacional

Objetivo:
dar continuidad real entre mensajes.

Entregables:

- store de sesion
- memoria corta
- reglas de referencia contextual

## Fase V3 - Motor deterministico de catalogo

Objetivo:
responder preguntas cerradas sin depender de IA.

Entregables:

- comparador de productos
- respuesta por categoria
- salida de precio visible y estado comercial

## Fase V4 - Integracion IA solo para venta consultiva

Objetivo:
usar IA para lo que si requiere inteligencia comercial.

Entregables:

- recomendacion guiada
- bundles
- objeciones
- pre-cierre

## Fase V5 - Fallback escalonado

Objetivo:
reducir derivaciones y fallbacks inutiles.

Entregables:

- arbol de recuperacion
- mensajes de aclaracion
- derivacion tardia y justificada

## Fase V6 - QA conversacional

Objetivo:
garantizar confiabilidad antes de usarlo en serio.

Entregables:

- suite de escenarios
- aprobacion por casos de negocio
- reporte de tasa de recuperacion

## 12. Criterios de aceptacion

La solucion se considera lista cuando:

- las quick replies no fallan por interpretacion
- preguntas de catalogo responden por reglas en la mayoria de los casos
- referencias como "ellos" o "ese" conservan contexto
- el fallback duro baja de forma visible
- la derivacion ocurre solo cuando realmente agrega valor
- el equipo puede ver por que fallo cada interaccion

## 13. Entrega recomendada al equipo

Se recomienda que el equipo tome este documento junto a:

- tabla de intents oficiales
- esquema de estado de sesion
- arbol de decision `reglas -> IA -> fallback -> humano`
- suite de QA conversacional
- dashboard minimo de observabilidad

## 14. Conclusion

El vendedor no debe depender del modelo para entender todo.

La forma correcta de estabilizarlo es:

- menos interpretacion libre
- mas sistema
- mas memoria corta
- mas reglas para catalogo
- IA solo para vender mejor

Ese enfoque reduce fallos, mejora continuidad y deja una base mucho mas util para conversion real.
