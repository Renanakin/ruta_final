# Guía de Reversión (Rollback)

Si algo falla o quieres volver al estado exacto antes de estos cambios, sigue estos pasos:

## 1. Archivos de Configuración (Docker)
He creado copias de seguridad de los archivos de Docker. Para restaurarlos:
1.  Borra el nuevo `Dockerfile`: `rm Dockerfile`
2.  Restaura el anterior: `mv Dockerfile.bak Dockerfile`
3.  Borra el nuevo `docker-compose.yml`: `rm docker-compose.yml`
4.  Restaura el anterior: `mv docker-compose.yml.bak docker-compose.yml`

## 2. Código Fuente (Frontend)
Para revertir los cambios en los componentes y constantes, usa Git:
```powershell
git checkout src/components/CatalogSection.jsx
git checkout src/lib/constants.js
git checkout backend/sync_db.js
```

## 3. Base de Datos
Si necesitas limpiar la base de datos de los productos actualizados, simplemente borra el archivo `backend/database.sqlite` ( Docker lo volverá a crear vacío si es necesario, o puedes usar tu copia de seguridad previa si la tienes).

## 4. Limpieza de Docker
Para asegurarte de que no queden rastros de las imágenes nuevas:
```powershell
docker compose down --rmi all
```

**Nota:** Si ejecutaste `git restore .` recientemente (como se ve en tu terminal), es posible que ya hayas revertido parte del código. Asegúrate de revisar el estado con `git status`.
