# Veredicto Final - Sales Assistant

Fecha: 2026-04-07
Modulo: `sales-assistant`
Estado evaluado: posterior a `P6` y `P7`

## Resumen ejecutivo

El vendedor quedo en un estado fuerte para piloto controlado y operacion gradual en produccion.

No lo clasificaria como "release total sin supervision", pero si como:

- listo para piloto real con control por cohorte
- listo para observabilidad y seguimiento desde CRM
- listo para handoff humano util

## Resultado de pruebas

### Set base del vendedor

- archivo: `backend/tests/sales.behavior-report.test.js`
- resultado: `9/9 PASS`
- precision observada: `100%`

Cobertura principal:

- precio visible
- disponibilidad `coming_soon`
- listado por categoria
- detalle de producto
- recomendacion por uso
- comparacion con contexto
- recomendacion generativa
- objecion generativa
- pre-cierre con handoff estructurado

### Set de borde

- archivo: `backend/tests/sales.edge-report.test.js`
- resultado: `6/6 PASS`

Cobertura principal:

- pronombres ambiguos con contexto
- comparacion solo con referencias contextuales
- consulta fuera de catalogo
- logistica fuerte
- pedido abierto contextual
- handoff humano explicito

### Suite backend completa

- resultado final: `57/57 PASS`

## Fortalezas

- buen uso del contexto corto para referencias como `ese` o `esos dos`
- comparacion deterministica clara y comercialmente util
- respuestas de catalogo resueltas sin depender del modelo en casos cerrados
- handoff humano mucho mas util que al inicio
- observabilidad real por intent, fuente, fallback, handoff y latencia
- piloto controlado operable desde CRM con kill switch y rollout por cohorte

## Debilidades residuales

- la parte generativa sigue validada con mocks controlados, no con variabilidad real del proveedor en trafico vivo
- algunas clasificaciones de `detectedIntent` siguen siendo funcionales pero no siempre semanticamente perfectas
- la calidad final del cierre comercial todavia debe observarse con clientes reales, sobre todo en objeciones complejas

## Riesgos operativos

- si `VITE_ENABLE_SALES_ASSISTANT=false`, el CRM no puede abrir el piloto
- abrir `page_scope=all` con rollout alto demasiado pronto puede esconder problemas que hoy solo vemos en simulacion
- la tasa de fallback y la latencia deben observarse antes de ampliar el rollout

## Recomendacion operativa

Configuracion inicial sugerida para produccion:

- `enabled = on`
- `rollout_percentage = 10`
- `page_scope = product_only`
- `allowlist_enabled = off`
- `qa_force_enabled = on`

Secuencia sugerida:

1. `QA only`
2. `10% producto`
3. revisar metricas y trazas por 24-48h
4. `25% producto`
5. escalar solo si fallback, handoff y latencia siguen sanos

## Veredicto

El vendedor esta:

- apto para piloto real controlado
- no recomendado aun para apertura total sin monitoreo
- suficientemente estable para generar evidencia comercial real
