# Entorno de Prueba: Animaciones del Alquimista (Framer Motion)

## ¿Qué se realizó?
Se instaló la librería `framer-motion` en el frontend para crear animaciones fluidas y avanzadas controladas por GPU, ideal para la presentación de resultados del Alquimista (Títulos, Ingredientes escalonados, Tips 3D).

Para no afectar la versión en producción directamente, se implementó lo siguiente:
1. **Nuevo componente:** Se creó una copia exacta de `<AlchemistView />` llamada `src/components/AlchemistViewAnimated.jsx`. En ese nuevo archivo se configuraron los componentes `<motion.div>` y `<motion.li>` para lograr la variante animada de entrega de resultados y tips rotatorios.
2. **Selector Interactivo en App:** Se agregó un botón flotante en `App.jsx` (*bottom-right*) que solo es visible cuando estás en el recuadro del Alquimista. Permite cambiar al instante entre "V1 Clásica" y "V2 Animada" usando el estado `useAlchemistV2`.
3. **Dependencias:** Se agregó `framer-motion` al `package.json` del frontend.

## ¿Cómo deshacer los cambios?

Si la versión animada no convence o genera problemas, este es el flujo para deshacer por completo este entorno de prueba y regresar a la normalidad:

1.  **En `src/App.jsx`:**
    *   Eliminar el import: `import AlchemistViewAnimated from './components/AlchemistViewAnimated';`.
    *   Eliminar el estado `const [useAlchemistV2, setUseAlchemistV2] = useState(false);`.
    *   Eliminar el código del interruptor flotante en el JSX:
        ```jsx
        <div className="fixed bottom-6 right-6 z-50 flex bg-white rounded-full p-1 shadow-2xl border border-stone-200">
          ... botones ...
        </div>
        ```
    *   Cambiar la rendarización condicional de:
        ```jsx
        {useAlchemistV2 ? <AlchemistViewAnimated ... /> : <AlchemistView ... />}
        ```
        A simplemente:
        ```jsx
        <AlchemistView ... />
        ```
2.  **Eliminar Archivos:**
    *   Borrar el archivo `src/components/AlchemistViewAnimated.jsx`.
    *   Borrar este archivo de documentación `docs/ALCHEMIST_ANIMATION_TEST.md`.
3.  **Remover Dependencia:**
    *   Ejecutar `npm uninstall framer-motion`.
4.  **Reconstruir:**
    *   Reconstruir el contenedor ejecutando: `docker compose up --build -d frontend`.
    
---
**Nota para la consolidación:**
Si la nueva versión animada *sí se aprueba*, los pasos son a la inversa:
1. Borramos el `AlchemistView.jsx` antiguo.
2. Renombramos `AlchemistViewAnimated.jsx` a `AlchemistView.jsx`.
3. Eliminamos el interruptor en `App.jsx` y dejamos solo la llamada a `<AlchemistView />`.
