# Skill: Desarrollo del Sales Assistant

Este componente representa una segunda IA distinta del chef del Alquimista.

## Objetivo del skill

Mantener el asistente de ventas como un modulo aislado, reemplazable y facil de evolucionar sin tocar el resto de la web.

## Reglas obligatorias

- No mezclar logica del chef con logica de ventas.
- No acoplar el asistente a componentes del Alquimista de recetas.
- El proveedor o endpoint debe tocarse desde este modulo primero.
- La respuesta del backend debe consumirse como contrato estructurado, no como texto libre sin forma.
- No inventar precios, stock o productos en frontend.

## Responsabilidades del modulo

- abrir/cerrar la experiencia
- mantener memoria corta local
- enviar contexto de pagina y producto
- renderizar quick replies
- mostrar productos sugeridos
- derivar a humano cuando corresponda

## Anti-patrones

- convertirlo en popup invasivo
- usar lenguaje agresivo de venta
- hardcodear logica comercial fuera del modulo
- acoplar cambios de proveedor a `App.jsx`

## Checklist de cambios

- revisar `salesAssistantProvider.js`
- revisar contratos esperados desde `/api/ai/sales/message`
- revisar `C:/dev/1_ruta/alchemist/src/sales/sales.playbook.js`
- verificar fallback si la IA falla
- verificar mobile
- verificar handoff a WhatsApp

## Agentes recomendados para cierre a version final

- `planner`: corta fases y define criterios de salida
- `architect`: diseña intents, memoria y reglas
- `executor`: implementa
- `test-engineer`: prueba conversaciones y regresion
- `code-reviewer`: revisa estabilidad y riesgos
- `verifier`: valida cierre real

Opcionales:

- `dependency-expert`
- `security-reviewer`

## Skills recomendadas para esta linea de trabajo

- `playwright`
- `code-review`
- `note`
- `plan`

## Documento de control de fase

- `C:/dev/1_ruta/docs/sales-assistant/2026-04-05-fase-actual-y-cierre-vendedor.md`
