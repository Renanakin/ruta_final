---
name: Exclusive Access Ritual (Alchemist Component)
description: Directrices AAA de diseño y arquitectura para el componente inteligente de acceso para El Alquimista en Ruta del Nido.
---

# Skill: Mantenimiento y Diseño del Exclusive Access (Ritual del Fogón)

Este skill define las reglas obligatorias para agentes IA y desarrolladores al modificar o expandir el componente `ExclusiveAccess` dentro del proyecto "Ruta del Nido". 

El componente ha dejado de ser un formulario estándar web y ahora se asimila a un **"Ritual de Acceso del Fogón"** (Experiencia estética de "Lujo Orgánico Cinematográfico").

## 1. Patrón Arquitectónico Fundamental (Obligatorio)
*   **Es un componente INTELIGENTE (Stateful):** El componente `ExclusiveAccess` DEBE manejar sus propios estados internos (`idle`, `focus`, `validating`, `error`, `success`) utilizando *React Hook State*. No alterar ni forzar al contenedor padre a controlar qué digita el usuario en todo momento.
*   **Delegación de Lógica Asíncrona:** La búsqueda y el _check_ real se inyecta desde el contenedor padre u orquestador global usando la prop `validateLogic()`. No hacer fetch o queries a Supabase o DB directamente en el código de interfaz.
*   **Orquestación Total Ceremional:** Se emplea `framer-motion` para los efectos teatrales (*glassmorphism*, partículas o bruma simulada). Respeta siempre los `setTimeout()` que dan holgura temporal a las transiciones para finalizar de renderizarse antes de cerrar la pantalla.

## 2. Restricciones Visuales de Marca (Lujo Orgánico)
Al aplicar o modificar JSX / Tailwind, tienes prohibido hacer lo siguiente:
*   ❌ **NO usar tonos rojos saturados para fallos/errores:** NUNCA usar (`text-red-500`, `bg-red-500`, `border-red-500`). El color rojo estándar destruye el "Lujo" del concepto.
    *   ✅ **OBLIGATORIO:** USA tonos de la familia orgánica oscura tierra/cobre (`text-amber-800`, `bg-amber-900`, `border-amber-700/50`, o similares) para alertar de un fallo.
*   ❌ **NO usar geometrías agresivas ni rectángulos sin radio:** Los inputs y cards puramente rígidos o minimalismos fríos de corporaciones SaaS están censurados.
    *   ✅ **OBLIGATORIO:** Transmitir "lo orgánico" y suave mediante *glassmorphism* (`backdrop-blur-xl bg-white/70`), sombras proyectadas grandes y muy difusas, y abusar de redondeos prominentes (`rounded-2xl`, `rounded-3xl` o superiores).
*   ❌ **NO usar azul eléctrico o neón para Focus Indicators:**
    *   ✅ **OBLIGATORIO:** El halo de foco debe evocar calor o brillo cálido "Dorado Yema" (por ejemplo `ring-amber-400/20` o `border-amber-400`).

## 3. Coreografía de Framer Motion
Cuando modifiques el área de animación, debe alinearse a esto:
- **Idle (Reposo):** Las luces traseras (glows virtuales formados por `div` borrosos) respiran lentamente, simulando calor lento (`repeat: Infinity`, `duration: 3` a `6`).
- **Focus:** Halo dorado focalizado rápido (`duration: 0.3`).
- **Validating:** Filtro de desenfoque leve (`filter: blur(2px)`) en toda la macroestructura UI interior; el botón señala de inmediato visualmente la espera, para evitar falsas sensaciones de cuelgue en la red del usuario.
- **Error:** Rechazo sobrio. Sustituir *shake alerts* kilométricos de validación moderna por una vibración corta (X: derecha, izquierda), terminando rápidamente y devolviendo el estado a reposo sin congelar al usuario.
- **Success:** Escalamiento en zoom (`scale: 1.1`), fuerte desenfoque de opacidad cero. Falso *fade out* general bloqueando clicks adicionales hacia el DOM mientras se le confirma al padre mediante la función prop.

## 4. Checklist para el Agente Reparador (IA)
Cuando un humano instruya "arregla x bug en el Alquimista Access Component", asegúrate de:
1. Revisar si la *prop* `validateLogic` se llama en el Handler y previene bloqueos por *catch* silenciosos en `Promise` no resueltas.
2. Confirmar que ninguna regla de Tailwind que integres choque con los `style` in-line generados internamente por los *motion.div* de Framer.
3. No extraer el `useState` de validación hacia `AlchemistView` justificándote en limpiar JSX; la arquitectura "Smart" tiene fines de orquestación de render.

> *La esencia central del Alquimista consiste en enaltecer elementos cotidianos transformándolos en experiencias inolvidables. La UX de este componente debe ser suave, mágica e impecable.*
