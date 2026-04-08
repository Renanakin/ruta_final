# Propuesta de trabajo para comenzar

## Objetivo de arranque

Comenzar con un primer sprint corto que capture el mayor impacto en conversion sin abrir todavia una reestructuracion visual completa.

## Enfoque recomendado

Partir por copy y jerarquia comercial antes de tocar componentes mas complejos. Esto permite validar el nuevo mensaje con bajo riesgo, medir respuesta y luego iterar sobre UI, prueba social distribuida y experiencia guiada.

## Sprint 1 sugerido

Duracion recomendada:

- 3 a 5 dias habiles

Alcance:

- hero
- propuesta de valor
- CTA principales
- urgencia creible
- cierre final

Entregables:

- nueva version del hero con 3 variantes
- banco de CTA primario y secundario
- microcopys de urgencia para hero, destacados y suscripcion
- nuevo bloque de propuesta de valor contra retail
- cierre final con 2 alternativas

Metricas a mirar:

- clic en CTA principal
- clic en WhatsApp
- scroll hasta destacados
- scroll hasta cierre
- tasa de contacto

## Sprint 2 sugerido

Alcance:

- beneficios por categoria
- microprueba social en puntos de decision
- bloque de suscripcion
- confianza logistica

Entregables:

- copy por categoria
- snippets de prueba social distribuidos
- mejoras de suscripcion con cupos y continuidad
- bloque logistico con cobertura y coordinacion

Metricas a mirar:

- clic en destacados
- scroll hasta suscripcion
- clic en CTA de suscripcion
- clic en CTA cercanos a testimonios

## Sprint 3 sugerido

Alcance:

- reposicionamiento de El Alquimista
- recetas espaciales conectadas al catalogo
- refinamiento visual y de interaccion

Entregables:

- promesa clara del bloque El Alquimista
- CTA especifico de descubrimiento
- estructura de recetas destacadas
- criterios para medir interaccion con la experiencia

Metricas a mirar:

- interaccion con El Alquimista
- clic desde recetas a productos
- tiempo de permanencia en el bloque

## Orden practico de ejecucion

1. Auditar el copy actual de la home por bloque.
2. Mapear donde ya existen CTA, testimonios, stock y mensajes logisticos.
3. Redactar la primera propuesta de hero, valor, urgencia y cierre.
4. Implementar cambios solo en texto y jerarquia visual basica.
5. Medir y revisar resultados iniciales.
6. Abrir la segunda iteracion con categorias, prueba social y suscripcion.
7. Dejar El Alquimista para una iteracion dedicada, ya con una promesa clara.

## Requerimientos para comenzar bien

- confirmar stock o disponibilidad semanal real que pueda comunicarse
- confirmar cobertura exacta o forma de coordinacion por WhatsApp
- validar si existe base real para hablar de recompra, familias atendidas o volumen de clientes
- definir si la suscripcion tiene cupos, lista de espera o frecuencia fija
- confirmar que El Alquimista ya tiene o tendra recetas enlazables con productos reales

## Propuesta concreta de arranque para este repo

Primero trabajar la home actual en sus bloques mas cercanos a conversion:

- `HeroSection`
- `ValuesSection`
- `CatalogSection`
- `SubscriptionSection`
- `SocialProof`
- `Footer`

Secuencia recomendada en codigo:

1. extraer el copy actual por bloque
2. reemplazar hero, propuesta de valor y cierre
3. insertar microprueba social cerca de CTA
4. reforzar urgencia y logistica donde ya exista soporte visual
5. revisar mobile para asegurar legibilidad y ritmo

## Criterio de exito del arranque

El trabajo inicial esta bien encaminado si, sin rehacer toda la web:

- el hero responde que vende, por que conviene y como pedir
- el sitio contrasta mejor con el supermercado
- la compra por WhatsApp se siente mas clara y confiable
- la urgencia se percibe honesta
- El Alquimista queda reservado para una segunda capa de valor, no como cierre comercial
