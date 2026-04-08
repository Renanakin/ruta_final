# Despliegue en VPS — Ruta del Nido

## Arquitectura

```
Internet
   │
   ▼
 Nginx (puerto 80/443 → HTTPS)
   │
   ├── rutadelnido.cl → Frontend (contenedor Docker, puerto 5174)
   └── api.rutadelnido.cl → Backend  (contenedor Docker, puerto 3003)
```

- **Frontend:** React + Vite, construido dentro de Docker, servido con Nginx interno
- **Backend:** Node.js + Express + SQLite, ejecutado dentro de Docker
- **Reverse proxy:** Nginx en el host (maneja SSL y redirige al Docker)
- **SSL:** Certbot (Let's Encrypt, renovación automática)

---

## Requisitos del VPS

- Ubuntu 22.04 o 24.04
- Mínimo 1 GB RAM / 1 vCPU
- Acceso SSH con usuario sudo
- Dominio apuntando al IP del VPS:
  - `rutadelnido.cl` → A → IP del VPS
  - `www.rutadelnido.cl` → A → IP del VPS
  - `api.rutadelnido.cl` → A → IP del VPS

> Reemplaza `rutadelnido.cl` por tu dominio real en todos los pasos.

---

## PASO 1 — Preparar el servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

---

## PASO 2 — Clonar el repositorio

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <URL_DE_TU_REPOSITORIO> ruta_del_nido
cd /var/www/ruta_del_nido
```

---

## PASO 3 — Crear el archivo de entorno del backend

Crea el archivo `backend/.env` con los valores de producción:

```bash
nano /var/www/ruta_del_nido/backend/.env
```

Contenido completo:

```env
NODE_ENV=production
PORT=3002
DEBUG_ERRORS=false
TRUST_PROXY=true
JSON_BODY_LIMIT=1mb

SQLITE_PATH=./database.sqlite

# Genera uno fuerte: openssl rand -base64 48
JWT_SECRET=REEMPLAZA_CON_CADENA_LARGA_Y_ALEATORIA
JWT_ISSUER=ruta-fresca-backend
JWT_AUDIENCE=ruta-fresca-clients
AUTH_JWT_EXPIRES=30d
AUTH_COOKIE_NAME=rdn_auth_token
AUTH_COOKIE_SAMESITE=Lax
CRM_JWT_EXPIRES=8h

CRM_LOGIN_EMAIL=admin@rutadelnido.cl
CRM_LOGIN_PASSWORD=REEMPLAZA_CON_PASSWORD_SEGURO
CRM_OPERATOR_EMAIL=operador@rutadelnido.cl
CRM_OPERATOR_PASSWORD=REEMPLAZA_CON_PASSWORD_SEGURO

CORS_ORIGINS=https://rutadelnido.cl,https://www.rutadelnido.cl
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=300

GEMINI_API_KEY=TU_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
ALCHEMIST_GEMINI_MODEL=gemini-2.5-flash
CHEF_ACCESS_CODE=TU_CHEF_ACCESS_CODE

RESEND_API_KEY=disabled
REPORT_EMAIL_FROM=noreply@rutadelnido.cl
APP_BASE_URL=https://rutadelnido.cl

LOG_LEVEL=info

ANALYTICS_GEO_MODE=mock
ANALYTICS_GEO_PROVIDER=ip-api
ANALYTICS_GEO_TIMEOUT_MS=3000
ANALYTICS_TRACK_INTERNAL=false
ANALYTICS_PAYLOAD_MAX_BYTES=4096
ANALYTICS_RETENTION_DAYS=180
ANALYTICS_RATE_LIMIT_WINDOW_MS=60000
ANALYTICS_RATE_LIMIT_MAX=120
# Genera uno: openssl rand -base64 24
ANALYTICS_IP_HASH_SALT=REEMPLAZA_CON_VALOR_ALEATORIO
```

---

## PASO 4 — Crear docker-compose.prod.yml

Este archivo **sobreescribe solo lo necesario** para producción sin tocar el `docker-compose.yml` original (que sirve para desarrollo local).

```bash
nano /var/www/ruta_del_nido/docker-compose.prod.yml
```

Contenido:

```yaml
services:
  frontend:
    build:
      args:
        - VITE_API_BASE_URL=https://api.rutadelnido.cl

  backend:
    volumes:
      - /var/www/ruta_del_nido/data/database.sqlite:/app/database.sqlite
```

Crear la carpeta de datos y copiar la base de datos:

```bash
mkdir -p /var/www/ruta_del_nido/data
cp /var/www/ruta_del_nido/backend/database.sqlite /var/www/ruta_del_nido/data/database.sqlite
```

---

## PASO 5 — Construir y levantar los contenedores

```bash
cd /var/www/ruta_del_nido

docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Verificar que estén corriendo:

```bash
docker ps
```

Deberías ver:
- `ruta-del-nido-frontend-1` → puerto `5174`
- `ruta-del-nido-backend-1` → puerto `3003`

Ver logs si algo falla:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## PASO 6 — Configurar Nginx como reverse proxy

```bash
sudo nano /etc/nginx/sites-available/rutadelnido
```

Contenido:

```nginx
# Frontend
server {
    server_name rutadelnido.cl www.rutadelnido.cl;

    location / {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    server_name api.rutadelnido.cl;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar y verificar:

```bash
sudo ln -s /etc/nginx/sites-available/rutadelnido /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## PASO 7 — Habilitar HTTPS con Certbot

```bash
sudo certbot --nginx -d rutadelnido.cl -d www.rutadelnido.cl -d api.rutadelnido.cl
```

Certbot modifica el Nginx automáticamente y configura la renovación automática del certificado.

Verificar renovación automática:

```bash
sudo certbot renew --dry-run
```

---

## PASO 8 — Inicio automático al reiniciar el VPS

Docker ya arranca solo con el sistema. El `restart: unless-stopped` en el `docker-compose.yml` garantiza que los contenedores se relancen automáticamente.

```bash
sudo systemctl enable docker
```

---

## PASO 9 — Smoke test

```bash
curl https://api.rutadelnido.cl/api/health
curl https://api.rutadelnido.cl/api/catalog
```

Validar manualmente en el navegador:

1. La web carga en `https://rutadelnido.cl`
2. El catálogo de productos aparece
3. El botón de WhatsApp funciona
4. El Alquimista responde recetas (usar el código de acceso)
5. `/crm` muestra acceso bloqueado

---

## Actualizaciones futuras

Cada vez que hagas cambios y quieras desplegar:

```bash
cd /var/www/ruta_del_nido

# Traer los últimos cambios
git pull

# Reconstruir y relanzar
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## Rollback de emergencia

Si algo falla tras una actualización:

```bash
# Volver al commit anterior
git log --oneline -5    # identificar el commit bueno
git checkout <COMMIT_HASH>

# Restaurar base de datos si fue afectada
cp /var/www/ruta_del_nido/data/database.sqlite.bak \
   /var/www/ruta_del_nido/data/database.sqlite

# Reconstruir
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Hacer backup antes de cada actualización:

```bash
cp /var/www/ruta_del_nido/data/database.sqlite \
   /var/www/ruta_del_nido/data/database.sqlite.bak
```

---

## Generar valores seguros

```bash
# JWT_SECRET (64 chars)
openssl rand -base64 48

# ANALYTICS_IP_HASH_SALT
openssl rand -base64 24

# Password CRM
openssl rand -base64 16
```
