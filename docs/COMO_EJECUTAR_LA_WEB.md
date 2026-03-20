# Como Ejecutar La Web Completa

Guia rapida para levantar el proyecto completo en local:

- frontend publico
- backend publico
- alquimista

Esta guia asume Windows con PowerShell, pero los comandos equivalentes funcionan igual en macOS o Linux.

## 1. Requisitos

- Node.js 20 recomendado
- npm disponible
- dependencias del repo instalables con `npm install`

Verificacion rapida:

```powershell
node --version
npm --version
```

## 2. Instalar dependencias

### Frontend

Desde la raiz del repo:

```powershell
npm install
```

### Backend

Desde `backend/`:

```powershell
cd backend
npm install
cd ..
```

## 3. Configurar variables del frontend

Crea un archivo local basado en [/.env.example](/C:/Users/HackBook/Documents/desarrollos/ruta_del_nido/.env.example).

Archivo recomendado:

- `/.env`

Contenido minimo:

```env
VITE_WHATSAPP_NUMBER=56993685089
VITE_API_BASE_URL=http://localhost:3001
VITE_GA_ID=
VITE_META_PIXEL_ID=
```

Notas:

- `VITE_GA_ID` y `VITE_META_PIXEL_ID` son opcionales
- si se dejan vacias, el build puede advertirlo pero la web funciona

## 4. Configurar variables del backend

Crea un archivo local basado en [backend/.env.example](/C:/Users/HackBook/Documents/desarrollos/ruta_del_nido/backend/.env.example).

Archivo recomendado:

- [backend/.env.local](/C:/Users/HackBook/Documents/desarrollos/ruta_del_nido/backend/.env.local)

Contenido minimo para la web publica:

```env
NODE_ENV=development
PORT=3001
DEBUG_ERRORS=false
TRUST_PROXY=false
JSON_BODY_LIMIT=1mb

SQLITE_PATH=./database.sqlite

JWT_SECRET=CAMBIA_ESTA_CADENA_POR_UNA_REAL_LARGA
JWT_ISSUER=ruta-fresca-backend
JWT_AUDIENCE=ruta-fresca-clients
AUTH_JWT_EXPIRES=30d
AUTH_COOKIE_NAME=rdn_auth_token
AUTH_COOKIE_SAMESITE=Lax

CORS_ORIGINS=http://localhost:5173,http://localhost:4173
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=300

APP_BASE_URL=http://localhost:5173
LOG_LEVEL=info
```

## 5. Variables extra para usar el alquimista

Si quieres recetas reales, agrega tambien:

```env
GEMINI_API_KEY=TU_API_KEY_REAL
CHEF_ACCESS_CODE=TU_CODIGO_REAL
ALCHEMIST_GEMINI_MODEL=gemini-2.5-flash
```

Notas:

- sin `GEMINI_API_KEY`, la UI puede abrir pero no generara recetas reales
- `CHEF_ACCESS_CODE` es un codigo definido por el equipo, no por Google

## 6. Levantar el backend

Desde `backend/`:

```powershell
cd backend
npm run dev
```

URL esperada:

- `http://localhost:3001`

Healthcheck:

- `http://localhost:3001/api/health`

## 7. Levantar el frontend

Desde la raiz del repo, en otra terminal:

```powershell
npm run dev
```

URL esperada por defecto:

- `http://localhost:5173`

## 8. Ejecutar la web completa

Con ambos procesos arriba:

- home: `http://localhost:5173`
- alquimista: `http://localhost:5173/alquimista`
- health backend: `http://localhost:3001/api/health`

## 9. Probar el alquimista

Flujo:

1. abrir `http://localhost:5173/alquimista`
2. ingresar `CHEF_ACCESS_CODE`
3. escribir una consulta como:

```text
Tengo huevos, cebolla y queso
```

4. enviar la consulta
5. esperar la receta estructurada

## 10. Validaciones recomendadas

### Frontend

```powershell
npm run test
npm run build
```

### Backend

```powershell
cd backend
npm test
```

## 11. Modo alternativo con puerto 3200

Si quieres levantar el frontend en `127.0.0.1:3200`:

```powershell
npm run dev -- --host 127.0.0.1 --port 3200
```

En ese caso, agrega tambien ese origen al backend:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:4173,http://localhost:3200,http://127.0.0.1:3200
```

Y actualiza el frontend:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 12. Problemas comunes

### El frontend abre, pero el alquimista no valida el codigo

Revisar:

- que el backend este corriendo
- que `CHEF_ACCESS_CODE` exista en `backend/.env.local`
- que `CORS_ORIGINS` incluya el origen real del frontend

### El alquimista valida el codigo, pero no devuelve receta

Revisar:

- que `GEMINI_API_KEY` exista
- que la API key sea valida
- que `ALCHEMIST_GEMINI_MODEL` sea soportado

### La web no mantiene la sesion

Revisar:

- que frontend y backend usen dominios coherentes
- que `APP_BASE_URL` y `CORS_ORIGINS` coincidan con el origen real

### El backend no levanta

Revisar:

- `JWT_SECRET`
- sintaxis del archivo `backend/.env.local`
- puerto `3001` libre

## 13. Cierre de pruebas

Al terminar las pruebas:

- detener backend y frontend
- eliminar claves reales de archivos locales de prueba
- dejar archivos `example` solo con placeholders
- mover secretos definitivos al entorno de despliegue
## 14. Ejecución con Docker (Recomendado para Producción/Distribución)

Si tienes Docker y Docker Desktop instalado, puedes levantar todo el proyecto con un solo comando sin preocuparte por las dependencias de Node.js locales.

### Pasos:

1.  **Asegúrate de tener Docker Desktop iniciado.**
2.  **Configura los archivos .env**: Copia los archivos `.env.example` a `.env` en la raíz y en `backend/.env`.
3.  **Ejecuta el comando**:
    ```powershell
    docker compose up --build -d
    ```
4.  **Acceso**:
    *   Frontend: [http://localhost:5174](http://localhost:5174)
    *   Backend: [http://localhost:3003](http://localhost:3003)

### Notas de Docker:
- El proyecto usa el nombre `ruta-del-nido` para evitar colisiones.
- La base de datos se persiste automáticamente en `backend/database.sqlite`.
- Para detener todo: `docker compose down`.
