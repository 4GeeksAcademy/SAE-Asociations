## Configuración para Codespace

1. Ejecutar backend: `pipenv run start`
2. Ver el puerto asignado en la pestaña PORTS
3. Crear archivo .env:
   ```bash
   echo "VITE_BACKEND_URL=https://[tu-codespace]-[puerto].app.github.dev" > .env
   ```
4. Ejecutar frontend: `npm run dev`