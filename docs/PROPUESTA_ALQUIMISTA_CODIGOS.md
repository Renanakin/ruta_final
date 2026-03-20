# Propuesta Alquimista Con Codigos Unicos

Fecha de referencia: 2026-03-19

## Objetivo

Encerrar el Alquimista del Nido a un beneficio exclusivo para clientes que compraron productos Ruta del Nido.

El acceso se habilita mediante un codigo unico por compra, ingresado manualmente por un operador despues de validar el pago.

## Alcance funcional

El sistema propuesto debe permitir:

- generar un codigo unico por compra
- asociar el codigo al email del cliente
- asociar el codigo a los productos comprados de Ruta del Nido
- enviar un correo automatico con el codigo y un enlace directo al alquimista
- permitir un solo uso de activacion por codigo
- permitir hasta 3 consultas por dia
- mantener vigencia de 7 dias desde la emision
- bloquear una segunda conexion si el codigo ya esta en uso

## Regla principal del alquimista

El alquimista solo debe generar recetas si existe al menos 1 producto de Ruta del Nido asociado al codigo.

Las recetas:

- deben usar los productos comprados de Ruta del Nido
- deben usar los ingredientes declarados por el usuario
- pueden asumir solo estos basicos implicitos:
  - aceite normal o de oliva
  - sal
  - pimienta
- no deben agregar ingredientes externos no declarados

## Flujo del operador

1. El operador valida el pago del producto.
2. El operador entra a un panel interno pequeno.
3. Ingresa el correo del cliente.
4. Selecciona los productos Ruta del Nido comprados.
5. El sistema genera el codigo unico.
6. El sistema guarda el codigo.
7. El sistema envia el correo al cliente.
8. El sistema muestra el codigo generado en una lista de codigos emitidos.

## Flujo del cliente

1. El cliente recibe el correo.
2. El correo agradece la compra.
3. El correo explica brevemente el beneficio.
4. El correo entrega el codigo.
5. El correo incluye un enlace directo a `/alquimista`.
6. El cliente ingresa el codigo.
7. Si el codigo es valido y no esta en uso:
   - el sistema lo activa
   - el alquimista saluda al usuario
   - el alquimista pregunta que otros ingredientes tiene
8. El cliente entrega sus ingredientes.
9. El alquimista muestra el proceso de generacion.
10. El alquimista devuelve una receta completamente explicada.

## Mensaje de bienvenida propuesto

Mensaje sugerido al entrar:

> Bienvenido al Alquimista del Nido. Ya registramos tu acceso por compra de productos Ruta del Nido. Cuentame que ingredientes tienes en casa y creare una receta usando tus productos y lo que ya tienes disponible.

## Reglas de acceso

### Vigencia

- el codigo dura 7 dias desde su emision

### Limite diario

- cada codigo puede hacer 3 consultas por dia

### Activacion unica

- el codigo puede ser activado solo una vez
- cuando una sesion lo activa, queda marcado como en uso
- si se intenta abrir desde una segunda sesion, se rechaza

Mensaje sugerido:

> Este codigo ya esta en uso y no permite una segunda conexion.

### Expiracion

Mensajes sugeridos:

- codigo expirado:
  > Este codigo ya expiro. Contacta a Ruta del Nido si necesitas ayuda.

- limite diario alcanzado:
  > Ya alcanzaste el limite diario de consultas para este codigo. Intenta nuevamente manana.

## Modelo de datos propuesto

### Tabla `alchemist_access_codes`

- `id`
- `code`
- `customer_email`
- `status`
- `issued_at`
- `expires_at`
- `activated_at`
- `last_used_at`
- `session_lock_id`
- `session_locked_at`
- `operator_note`

Estados sugeridos:

- `generated`
- `active`
- `in_use`
- `expired`
- `revoked`

### Tabla `alchemist_access_code_items`

- `id`
- `access_code_id`
- `product_id`
- `product_name`
- `quantity`

### Tabla `alchemist_recipe_queries`

- `id`
- `access_code_id`
- `query_text`
- `result_status`
- `created_at`

Estados sugeridos:

- `success`
- `fallback`
- `rejected`

## Panel interno minimo propuesto

### Pantalla de generacion

Campos:

- email del cliente
- selector de productos comprados
- cantidad por producto opcional
- nota del operador opcional

Acciones:

- generar codigo
- enviar correo
- guardar

### Pantalla de listado

Mostrar:

- codigo
- email
- productos asociados
- fecha de emision
- fecha de expiracion
- estado
- consultas usadas hoy

Acciones futuras posibles:

- reenviar correo
- revocar codigo
- ver historial de consultas

## Correo propuesto

Contenido sugerido:

- agradecimiento por la compra
- explicacion breve del beneficio
- codigo unico
- enlace directo al alquimista
- reglas:
  - 3 consultas por dia
  - vigencia de 7 dias
  - uso personal

Ejemplo de enfoque:

> Gracias por tu compra en Ruta del Nido. Como parte de tu experiencia, te damos acceso al Alquimista del Nido para crear recetas con los productos que compraste. Tu codigo es: XXXX-XXXX. Haz clic aqui para entrar al alquimista: [enlace]. Recuerda que tu acceso dura 7 dias y te permite hasta 3 consultas diarias.

## API propuesta

### Operador interno

- `POST /api/alchemist/access-codes`
  - crea codigo
  - guarda productos
  - envia correo

- `GET /api/alchemist/access-codes`
  - lista codigos generados

### Cliente alquimista

- `POST /api/ai/chef/verify`
  - valida codigo
  - verifica vigencia
  - verifica estado
  - activa sesion si corresponde

- `POST /api/ai/chef`
  - valida limite diario
  - valida que siga vigente
  - valida que haya al menos 1 producto Ruta del Nido asociado
  - construye receta usando:
    - productos comprados
    - ingredientes del usuario
    - basicos implicitos

## UX del alquimista

La logica visual actual se mantiene.

Cambios propuestos:

- antes de la consulta, mostrar saludo de bienvenida
- durante la generacion, mantener el estado visual actual
- en la receta final, reforzar:
  - que ingredientes usaron los productos comprados
  - que ingredientes puso el usuario
  - que no se agregaron ingredientes externos

## Criterios de aceptacion

La propuesta se considera implementada cuando:

- el operador puede generar un codigo desde una interfaz minima
- el sistema guarda el codigo con email y productos asociados
- el correo sale automaticamente con enlace y codigo
- el cliente puede activar el acceso una sola vez
- una segunda conexion queda bloqueada
- el limite de 3 consultas diarias funciona
- la vigencia de 7 dias funciona
- el alquimista solo genera recetas si hay al menos 1 producto Ruta del Nido asociado
- las recetas solo usan productos comprados, ingredientes declarados y basicos implicitos

## Estado

Esta propuesta esta documentada, pero no implementada todavia.

Sirve como base para un siguiente ciclo de trabajo enfocado en:

- persistencia de codigos
- panel interno minimo
- envio de correo
- reglas de acceso y uso
