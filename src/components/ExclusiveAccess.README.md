# ExclusiveAccess (Smart Component)

Componente inteligente de acceso exclusivo para la experiencia del Alquimista dentro la web principal de Ruta del Nido. Refactorizado bajo el concepto estético de **"Ritual de Acceso del Fogón"**.

## Objetivo y Concepto Visual

`ExclusiveAccess` renderiza la antesala ceremonial de desbloqueo del Alquimista. Debe sentirse cálida, premium, orgánica y silenciosamente teatral. Se aleja por completo de un "login corporativo" o una tarjeta "SaaS".

El módulo comunica:
- **Origen:** Productos reales, campo, cocina viva.
- **Exclusividad:** Acceso reservado sin lenguaje frío.
- **Transformación:** Activa un proceso de alquimia culinaria.

## Componente Inteligente (Arquitectura)

A diferencia de versiones anteriores, este componente es **Inteligente (Stateful)**. Gestiona su propia coreografía de animaciones (`framer-motion`), la validación asíncrona del código y todos sus estados de error/carga internamente.

El padre (`AlchemistView`) no coordina micro-interacciones. Solo inyecta la lógica de validación e intercepta el estado de éxito.

### API (Props)

| Prop | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `validateLogic` | `(code: string) => Promise<boolean>` | sí | Función asíncrona inyectada por el contenedor que verifica si el código es válido. |
| `onUnlockSuccess` | `() => void` | sí | Handler que se ejecuta *después* de que termina la animación ceremonial de apertura. |

## Capas Visuales (z-index)

1. **Capa 0 (Atmosférica):** Fondo con imagen suave y desenfocada (cocina, madera, bruma).
2. **Capa 1 (Sistema Vivo - Glow):** Partículas sutiles y respiración de luz (`framer-motion`), simulando calor.
3. **Capa 2 (El Altar - Card Principal):** Glassmorphism cálido (`backdrop-blur-xl bg-white/70`). Bordes orgánicos, sombras profundas.
4. **Capa 3 (Interacción):** Input de código interactivo, textos serif/sans legibles y botón de validación elegante.

## Estados Interactivos Internos

- **🟢 Reposo (`idle`):** Bruma tenue y glow imperceptible. Composición estable.
- **🟡 Foco (`focus`):** El borde del input y el sistema de glow despiertan con un halo cálido (dorado-yema).
- **⏳ Validación (`validating`):** Llamada asíncrona. Elementos difuminados temporalmente, destello palpitante rápido, y el input se bloquea.
- **🚫 Error (`error`):** Rechazo elegante. Se descarta el rojo agresivo por un tono **tierra/cobre oscuro**. Se ejecuta una pequeña vibración (shake) horizontal.
- **✅ Éxito (`success`):** Apertura ceremonial. El componente se difumina suavemente antes de lanzar `onUnlockSuccess`.

## Criterios de Diseño (Tokens)

- **Tipografía:** Serif expresiva para titulares y Sans-serif limpia con *tracking* amplio (espaciado de letras) para el código de acceso.
- **Color Base:** Crema, hueso, y el color principal corporativo (Verde Profundo).
- **Color Acento:** Dorado-Yema cálido (foco, interacción, chispas).
- **Color Error:** Cobre oxidado o ámbar oscuro (Premium, no ruidoso).
- **Formas:** Abandona bordes cuadrados o afilados; uso agresivo de `rounded-2xl` y `rounded-3xl` combinados con sombras difusas.

## Reglas y Riesgos a Evitar

1. **Riesgo Visual:** Que se vea demasiado tecnológico (Sci-Fi / Gaming).
   *Regla:* El *motion* debe ser orgánico y lánguido. Las transiciones no deben ser bruscas ni usar colores neones luminosos.
2. **Riesgo de Claridad:** Que las animaciones interfieran con la legibilidad y accesibilidad (contraste).
   *Regla:* El contenedor central siempre debe usar un fondo translúcido (`bg-white/70`, `backdrop-blur-xl`) para asegurar que el texto destaque en contraste AAA, independientemente de qué imagen o textura haya detrás.
3. **Riesgo Estructural:** Acoplamiento excesivo entre el UI y la BD.
   *Regla:* El flujo a Base de Datos no vive directamente en JSX; la función asíncrona validación DEBE ser pasada siempre a través de la prop `validateLogic`.

## Checklist de Implementación y Mantenimiento

- [ ] Soporte completo responsivo para móviles y desktop verificado en simulador o *dev-tools*.
- [ ] La tecla `Enter` en el teclado continúa disparando la validación del formulario.
- [ ] El estado de `error` debe poder revertirse automáticamente a `idle` (reposo) cuando el usuario escribe nuevamente.
- [ ] Los tiempos de retardo (`setTimeout`) de éxito respetan la animación antes de llamar `onUnlockSuccess`.
- [ ] NO TIENE CLASES ROJAS (`text-red-500`, `bg-red-500`, `border-red-500` eliminados). Todo mensaje de emergencia recae sobre la escala `amber-800` o `amber-900`.