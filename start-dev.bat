@echo off
echo Iniciando Ruta del Nido - Dev...
start "Backend" cmd /k "cd /d k:\desarrollos\1_ruta\backend && npm run dev"
start "Frontend" cmd /k "cd /d k:\desarrollos\1_ruta && npm run dev"
echo Servidores iniciados.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3002
