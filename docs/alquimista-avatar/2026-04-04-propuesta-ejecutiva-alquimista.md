# Propuesta Ejecutiva Integral - Proyecto El Alquimista

Fecha: 2026-04-04
Estado: Propuesta para revision
Gate de implementacion: no ejecutar frontend hasta aprobacion explicita del usuario con `VAMOS`

## 1. Objetivo general

Convertir El Alquimista en una experiencia premium, clara, memorable y mantenible dentro de Ruta del Nido.

El proyecto debe:

- reforzar la identidad del personaje
- explicar con claridad como funciona
- conectar productos reales con recetas reales
- elevar el valor percibido de la IA
- mejorar conversion sin transformar al Alquimista en un chatbot vendedor
- quedar modular para futuras intervenciones rapidas y seguras

## 2. Vision del sistema

El Alquimista no debe seguir viendose como una sola pantalla grande. Debe ordenarse como un sistema de experiencia compuesto por bloques con responsabilidades claras:

1. identidad y narrativa
2. recorrido publico del Alquimista
3. ritual de acceso exclusivo
4. modulo IA de generacion de recetas
5. galeria curada de recetas creadas por usuarios y administradores
6. operacion editorial y mantenimiento

La meta es que podamos intervenir una parte sin romper las otras.

## 3. Problema actual a resolver

Hoy la experiencia del Alquimista ya tiene una base visual potente, pero mezcla demasiadas cosas en una misma superficie:

- storytelling
- acceso
- instrucciones
- generacion IA
- conversion
- fallback

Eso vuelve mas dificil:

- entender el flujo rapido
- mantener el codigo con seguridad
- crecer con nuevas funciones
- intervenir la experiencia por segmentos

## 4. Resultado esperado

Al terminar esta intervencion, El Alquimista debe lograr esto:

- el usuario entiende en segundos que hace y como usarlo
- el avatar se vuelve la cara clara de la experiencia
- el acceso con codigo se siente ritualico, premium y entendible
- la generacion de recetas se percibe util, real y alineada con los productos
- aparece una nueva prueba social curada con recetas reales publicadas manualmente
- la experiencia queda ordenada en bloques aislados

## 5. Requerimientos desplegados

### 5.1 Identidad visual del personaje

- el avatar debe ser el centro de identidad del recorrido
- la direccion visual debe ser calida, organica, artesanal y cinematografica
- no debe sentirse SaaS, gaming ni sci-fi
- debe haber consistencia entre hero, ritual, panel IA y cierre

### 5.2 Flujo de uso

El usuario debe entender este flujo sin esfuerzo:

1. comprar productos Ruta del Nido
2. ingresar el codigo
3. describir lo que tiene en casa
4. recibir una receta inspirada en sus ingredientes y productos reales

### 5.3 Ritual de acceso

- mantener `ExclusiveAccess` como componente inteligente
- conservar `validateLogic` como logica inyectada
- no acoplar UI con base de datos o fetch directo interno
- respetar la estetica del ritual del fogon
- corregir incoherencias visuales que contradicen la spec local

### 5.4 Modulo IA

- mantener el backend y el modulo `alchemist` desacoplados del frontend
- seguir validando entradas y salidas
- mantener fallback seguro
- mejorar la presentacion del resultado y su claridad

### 5.5 Nueva seccion: recetas creadas por El Alquimista

Esta nueva seccion sera una galeria curada, no una publicacion libre.

Regla operativa:

- el usuario envia su plato por WhatsApp o Instagram
- Ruta del Nido filtra manualmente la foto
- luego un administrador publica manualmente el contenido
- la publicacion se hace completando campos y usando una URL de imagen ya validada
- la logica editorial debe parecerse a la de productos

Objetivo:

- mostrar prueba social real y curada
- reforzar la utilidad del Alquimista
- inspirar nuevas consultas y compras
- quedar como segmento independiente y rapido de intervenir

### 5.6 Operacion y mantenimiento

- la experiencia debe sobrevivir aunque falle la IA
- la experiencia debe sobrevivir aunque no existan recetas curadas publicadas
- la nueva galeria debe poder editarse sin tocar el corazon del Alquimista
- el sistema debe quedar preparado para mejoras futuras por bloque

## 6. Arquitectura recomendada

## 6.1 Capa de experiencia publica

Bloques visuales y narrativos de la ruta `/alquimista`.

Incluye:

- hero del personaje
- explicacion del flujo
- ritual de acceso
- panel IA
- galeria de recetas curadas
- cierre final

## 6.2 Capa funcional

Maneja:

- desbloqueo por codigo
- consulta del usuario
- estados de espera
- resultado de receta
- error y fallback

## 6.3 Capa de servicios

Maneja:

- validacion de acceso
- generacion de recetas
- contratos de datos
- dataset de recetas curadas
- reglas editoriales de publicacion

## 7. Estructura propuesta de la ruta `/alquimista`

La experiencia del Alquimista deberia quedar ordenada en esta secuencia:

1. Hero del personaje
   - avatar
   - presentacion del Alquimista
   - atmosfera visual principal
   - CTA de entrada

2. Como funciona
   - compra productos
   - ingresa codigo
   - describe ingredientes
   - recibe receta

3. Universo del Alquimista
   - productos reales + cocina del usuario
   - promesa de valor
   - ejemplos concretos

4. Ritual de acceso
   - segmento exclusivo y teatral
   - instrucciones inmediatas
   - validacion del codigo

5. Panel central IA
   - ingreso de ingredientes
   - loading
   - receta generada
   - fallback a WhatsApp

6. Recetas creadas por El Alquimista
   - fotos de platos reales curados
   - descripcion
   - ingredientes
   - autor o tipo de autor
   - CTA para enviar plato por WhatsApp o Instagram

7. Cierre
   - llamada final a usar el Alquimista o pedir productos

## 8. Nueva seccion: recetas creadas por El Alquimista

## 8.1 Proposito

Crear una galeria curada de platos reales inspirados o creados desde la experiencia del Alquimista.

No sera una red social ni una subida abierta.

Sera una seccion:

- premium
- editorial
- controlada
- facil de operar
- facil de intervenir

## 8.2 Regla de publicacion

El usuario no publica directo en la web.

Flujo:

1. usuario envia foto y contexto por WhatsApp o Instagram
2. Ruta del Nido revisa si la imagen y el plato son publicables
3. un administrador prepara la entrada
4. se cargan manualmente los campos
5. se publica con URL de imagen ya validada

## 8.3 Contrato final de receta publicada

Campos obligatorios y cerrados para esta etapa:

- `id` numero entero unico
- `title` string no vacio
- `description` string no vacio
- `ingredients` arreglo de strings no vacios
- `image` string con URL o ruta valida de imagen
- `authorName` string no vacio
- `authorType` enum: `usuario | admin`
- `sourceChannel` enum: `whatsapp | instagram | interno`
- `published` boolean
- `featured` boolean
- `sortOrder` numero entero para orden editorial

Reglas de publicacion:

- no se publica sin todos los campos obligatorios
- no se publica con enums fuera de contrato
- no se publica con ingredientes vacios
- solo recetas con `published=true` se muestran en la web

## 8.4 Comportamiento publico

- mostrar solo recetas publicadas
- permitir destacar algunas
- soportar estado vacio elegante
- ofrecer CTA para enviar platos por WhatsApp e Instagram
- no depender del modulo IA para renderizar

## 8.5 Criterio tecnico

Esta seccion debe construirse como bloque aislado para que en el futuro podamos:

- cambiar su layout sin tocar el ritual
- cambiar el dataset sin tocar el modulo IA
- apagarla temporalmente sin romper la ruta
- moverla de posicion sin refactor complejo

## 9. Fases del proyecto

## Fase A0 - Alineacion del proyecto completo

Objetivo:
dejar congelado el alcance total del Alquimista antes de tocar frontend.

Incluye:

- validar vision completa
- validar prioridades
- validar que entra y que no entra
- validar nueva seccion curada

Entregables:

- propuesta aprobada
- prioridades cerradas
- criterios de exito cerrados

## Fase A1 - Sistema visual del avatar

Objetivo:
definir como vive el avatar en todo el recorrido.

Incluye:

- hero art direction
- reglas de escala y posicion
- paleta
- glow
- comportamiento motion

Entregables:

- sistema visual del personaje
- reglas de uso del avatar
- lineamientos visuales base

## Fase A2 - Narrativa y conversion

Objetivo:
hacer que el Alquimista se entienda rapido y venda valor sin sonar agresivo.

Incluye:

- copy del hero
- copy del flujo de uso
- copy de valor
- CTA principales y secundarios
- explicacion de utilidad real

Entregables:

- copy maestro por bloque
- microcopy de onboarding
- CTA finales

## Fase A3 - Reestructuracion de la ruta del Alquimista

Objetivo:
dividir el recorrido en segmentos mas mantenibles.

Incluye:

- orden de secciones
- separacion por componentes
- reduccion de mezcla entre narrativa y funcionalidad

Entregables:

- mapa de componentes
- secuencia definitiva de secciones
- base para intervencion modular

## Fase A4 - Ritual de acceso

Objetivo:
dejar el acceso exclusivo completamente alineado con su spec visual y tecnica.

Incluye:

- revisar estados internos
- revisar animaciones
- corregir inconsistencias visuales
- reforzar claridad del acceso

Entregables:

- `ExclusiveAccess` consistente
- mejor feedback de error, espera y exito
- ritual mas claro y mas premium

## Fase A5 - Panel central del modulo IA

Objetivo:
mejorar la experiencia de consulta, resultado y fallback.

Incluye:

- claridad del input
- mejor lectura del resultado
- mejor jerarquia de receta
- fallback mas elegante
- puente mas claro a WhatsApp

Entregables:

- panel IA refinado
- mejor UX de estados
- mejor legibilidad de recetas

## Fase A6 - Galeria curada de recetas creadas por El Alquimista

Objetivo:
crear la nueva seccion editorial de platos publicados manualmente.

Incluye:

- estructura del bloque
- cards o layout editorial
- datos publicables
- CTA de envio de plato
- estado vacio

Entregables:

- seccion nueva integrada
- componente aislado
- narrativa editorial coherente

## Fase A7 - Operacion editorial y datos

Objetivo:
dejar lista la forma segura y rapida de publicar nuevas recetas curadas.

Incluye:

- definir contrato de datos
- decidir fuente de datos inicial
- alinear con la logica tipo catalogo
- dejar procedimiento manual de alta y edicion

Entregables:

- modelo editorial de recetas
- flujo manual de publicacion
- base para mantenimiento futuro

## Fase A8 - QA integral del Alquimista

Objetivo:
validar que toda la experiencia funciona y se sostiene.

Incluye:

- mobile
- desktop
- accesibilidad basica
- errores visuales
- empty states
- fallos de IA

Entregables:

- checklist QA
- hallazgos corregidos
- evidencia visual y tecnica

## Fase A9 - Readiness y despliegue

Objetivo:
dejar el Alquimista listo para incorporarse al release general del proyecto.

Incluye:

- validacion final de contenido
- validacion de enlaces y CTAs
- validacion de rutas y fallbacks
- evaluacion de riesgos residuales

Entregables:

- recomendacion de pase
- lista de riesgos residuales
- checklist final del modulo

## 10. Despliegue del requerimiento por area

## 10.1 Frontend

Debe cubrir:

- nueva estructura de la ruta
- nueva jerarquia visual
- ritual corregido
- panel IA refinado
- nueva galeria curada

Archivos probablemente impactados:

- `src/App.jsx`
- `src/components/AlchemistViewAnimated.jsx`
- `src/components/AlchemistView.jsx`
- `src/components/ExclusiveAccess.jsx`
- nuevos componentes dedicados del Alquimista
- `src/index.css`

## 10.2 Backend

Debe cubrir:

- mantener el modulo chef y sus contratos
- exponer datos de recetas curadas si se hace dinamico
- validar estructura si se publica desde backend

Archivos probablemente impactados en fase dinamica:

- `backend/src/modules/ai/ai.routes.js`
- nuevo modulo editorial o similar al catalogo
- servicios y rutas especificas para recetas curadas

## 10.3 Datos y operacion

Debe cubrir:

- ingreso manual de contenido
- criterio de publicacion
- orden y destacado
- URL de imagen validada

## 10.4 Contenido

Debe cubrir:

- voz del personaje
- claridad del flujo
- utilidad real del sistema
- tono premium artesanal

## 11. Alcance recomendado de la primera intervencion

Para mantener el trabajo controlado, reversible y rapido, recomiendo que la primera intervencion implemente:

- reorden del recorrido del Alquimista
- ajuste de narrativa principal
- mejora del ritual de acceso
- mejora del panel IA
- nueva seccion de recetas curadas con fuente inicial simple

Y deje para despues:

- automatizacion compleja de carga
- uploads publicos
- panel administrativo completo
- features sociales

## 12. Criterios de exito

Esta propuesta se considera bien ejecutada cuando:

- el usuario entiende rapidamente que es El Alquimista
- el flujo completo queda claro
- el acceso se siente exclusivo y usable
- la receta generada se siente valiosa y mejor presentada
- la nueva galeria refuerza confianza y deseo de uso
- la experiencia queda dividida en segmentos claros
- futuras intervenciones pueden realizarse por bloque

## 13. Riesgos a controlar

- sobrecargar visualmente la pagina
- mezclar demasiado codigo en archivos ya grandes
- hacer que el personaje pierda claridad por exceso de narrativa
- convertir la nueva galeria en una operacion pesada
- automatizar demasiado pronto algo que hoy conviene operar manualmente

## 14. Decision recomendada

La recomendacion es avanzar con una primera implementacion modular, centrada en experiencia, claridad y estructura, con la nueva galeria curada incluida desde el inicio como bloque independiente.

Eso nos permite:

- mejorar mucho la percepcion del Alquimista
- sumar prueba social real
- preparar una base sana para crecer
- y no quedar atrapados en una sola pantalla monolitica

## 15. Gate para comenzar

La implementacion solo debe comenzar cuando el usuario revise esta propuesta y autorice con una confirmacion explicita.

Confirmacion esperada:

`VAMOS`
