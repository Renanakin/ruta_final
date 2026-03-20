# VPS Deployment Runbook

## Alcance

Este runbook sirve para subir el release publico actual:

- frontend publico
- backend publico
- SQLite como base actual
- CRM no expuesto al publico

## Arquitectura recomendada

- `tudominio.com` -> frontend estatico
- `www.tudominio.com` -> frontend estatico
- `api.tudominio.com` -> backend Express
- Nginx -> reverse proxy y TLS
- systemd -> proceso del backend

## Requisitos del servidor

- Ubuntu 22.04 o 24.04
- Node.js 20
- Nginx
- Certbot
- Git
- acceso sudo

## Variables necesarias

### Frontend

```env
VITE_API_BASE_URL=https://api.tudominio.com
VITE_WHATSAPP_NUMBER=569XXXXXXXX
VITE_GA_ID=
VITE_META_PIXEL_ID=
```

### Backend

```env
NODE_ENV=production
PORT=3001
DEBUG_ERRORS=false
JWT_SECRET=CAMBIA_ESTA_CADENA
CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com
APP_BASE_URL=https://tudominio.com
AUTH_COOKIE_NAME=rdn_auth_token
AUTH_COOKIE_SAMESITE=Lax
GEMINI_API_KEY=
ALCHEMIST_GEMINI_MODEL=gemini-2.5-flash
CHEF_ACCESS_CODE=
RESEND_API_KEY=
REPORT_EMAIL_FROM=noreply@tudominio.com
```

## Preparacion

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
```

## Obtener el repo

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <URL_DEL_REPO> ruta_del_nido
cd /var/www/ruta_del_nido
```

## Instalar y validar

### Frontend

```bash
cd /var/www/ruta_del_nido
npm install
npm run test
npm run build
```

### Backend

```bash
cd /var/www/ruta_del_nido/backend
npm install
npm test
```

## Backup previo de SQLite

Antes de publicar:

```bash
cp /var/www/ruta_del_nido/backend/database.sqlite /var/www/ruta_del_nido/backend/database.sqlite.bak
```

## systemd para backend

Crear `/etc/systemd/system/ruta-del-nido-backend.service`:

```ini
[Unit]
Description=Ruta del Nido Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/ruta_del_nido/backend
ExecStart=/usr/bin/node src/app.js
Restart=always
RestartSec=5
User=www-data
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ruta-del-nido-backend
sudo systemctl start ruta-del-nido-backend
sudo systemctl status ruta-del-nido-backend
```

## Nginx

Crear `/etc/nginx/sites-available/rutadelnido`:

```nginx
server {
    server_name tudominio.com www.tudominio.com;
    root /var/www/ruta_del_nido/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}

server {
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar:

```bash
sudo ln -s /etc/nginx/sites-available/rutadelnido /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## HTTPS

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com
```

## Smoke test

```bash
curl https://api.tudominio.com/api/health
curl https://api.tudominio.com/api/catalog
```

Validar manualmente:

1. home carga
2. login funciona
3. reset password funciona
4. carrito y checkout funcionan
5. `/crm` muestra acceso no disponible

## Rollback minimo

Si un release falla:

1. restaurar `backend/database.sqlite.bak`
2. volver al commit anterior
3. reconstruir frontend
4. reiniciar servicio backend
5. recargar Nginx

## Decision operativa

Para este release:

- usar Nginx + build manual para frontend
- usar systemd para backend
- no usar `docker-compose` como ruta principal
- no asumir migracion a Supabase
