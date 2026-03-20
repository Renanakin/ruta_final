# Estado Actual

Fecha de referencia: 2026-03-19

## Estado general

El proyecto quedo funcional en su alcance actual:

- frontend publico operativo
- backend publico operativo
- alquimista operativo
- CRM fuera de la experiencia publica
- deploy documentado para VPS

## Validacion funcional

Se valido:

- acceso a la web local
- bloqueo de `/crm`
- flujo de login del alquimista
- validacion de `CHEF_ACCESS_CODE`
- generacion real de recetas desde Gemini

URLs locales de referencia:

- frontend: `http://127.0.0.1:3200`
- alquimista: `http://127.0.0.1:3200/alquimista`
- health backend: `http://127.0.0.1:3001/api/health`

## Estado de trabajo

La base funcional debe considerarse estable.

El siguiente ciclo de trabajo queda orientado a:

- ajustes visuales
- pulido de UI
- mejoras de presentacion y experiencia

## Nota operativa sobre secretos

Durante las pruebas locales se habilitaron claves reales para validar el alquimista.

Al cerrar el ciclo de pruebas se debe:

- [x] eliminar claves reales de archivos locales (realizado 2026-03-19)
- [x] dejar archivos `example` solo con placeholders y resenas (realizado 2026-03-19)
- mover secretos definitivos al VPS o gestor de secretos
