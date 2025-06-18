# SAE Associations - Guía de Setup

Sistema de gestión de asociaciones y voluntarios desarrollado con React + Flask.

## Setup Rápido

### **Para GitHub Codespace**

1. **Configurar Backend:**

   ```bash
   pipenv install
   pipenv run init && pipenv run migrate && pipenv run upgrade

   # ⚠️ IMPORTANTE: Configurar FLASK_DEBUG para desarrollo
   export FLASK_DEBUG=1
   pipenv run start
   ```

2. **Configurar Frontend:**

   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**

   ```bash
   # Copiar archivo de ejemplo
   cp .env.example .env

   # Actualizar con la URL real del codespace
   # Después de ejecutar 'pipenv run start', copia la URL que aparece
   echo "VITE_BACKEND_URL=https://[tu-codespace]-3001.app.github.dev" > .env
   ```

4. **Ejecutar Frontend:**
   ```bash
   npm run dev
   ```

### **Para Desarrollo Local**

1. **Backend:**

   ```bash
   pipenv install
   pipenv run init && pipenv run migrate && pipenv run upgrade

   # ⚠️ IMPORTANTE: Configurar FLASK_DEBUG para desarrollo
   export FLASK_DEBUG=1
   pipenv run start  # Ejecuta en http://localhost:3001
   ```

2. **Frontend:**
   ```bash
   npm install
   cp .env.example .env  # VITE_BACKEND_URL ya está configurado para localhost
   npm run dev  # Ejecuta en http://localhost:3000
   ```

## 🔧 Comandos Útiles

### **Base de Datos**

```bash
# Crear usuarios de prueba
pipenv run flask insert-test-users 3

# Resetear migraciones (si hay problemas)
pipenv run downgrade
pipenv run upgrade
```

### **Desarrollo**

```bash
# Backend con auto-reload
export FLASK_DEBUG=1  # ⚠️ CRÍTICO para desarrollo
pipenv run start

# Frontend con hot-reload
npm run dev

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── api/                 # Backend Flask
│   ├── controllers/     # Lógica de controladores
│   ├── models/         # Modelos de base de datos
│   ├── routes/         # Rutas de la API
│   ├── services/       # Lógica de negocio
│   └── schemas/        # Validaciones
├── front/              # Frontend React
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── hooks/         # Custom hooks (useGlobalReducer)
│   └── services/      # Servicios de API
└── app.py             # Punto de entrada Flask
```

## 🌐 URLs del Proyecto

### **Local:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend Sitemap: http://localhost:3001/

### **Codespace:**

- Frontend: https://[codespace]-3000.app.github.dev
- Backend API: https://[codespace]-3001.app.github.dev
- Backend Sitemap: https://[codespace]-3001.app.github.dev/

## 🔑 Funcionalidades Implementadas

- ✅ Registro de usuarios (voluntarios)
- ✅ Registro de asociaciones
- ✅ Login con JWT
- ✅ Validaciones de formularios
- ✅ Manejo de errores user-friendly
- ✅ Estado global con useReducer
- ✅ Diseño responsive con Bootstrap

## 🛠️ Tecnologías

**Backend:**

- Flask + SQLAlchemy
- JWT para autenticación
- Alembic para migraciones

**Frontend:**

- React 18 + Vite
- React Router v6
- Bootstrap 5 + Bootstrap Icons
- Estado global con useReducer

## ⚠️ Troubleshooting

### **🚨 PROBLEMA MÁS COMÚN: Sitemap no visible en Codespace**

**Síntoma:** Al ir a la URL del backend solo aparece una página en blanco o el frontend de React, no el sitemap de rutas de la API.

**Causa:** Flask está ejecutándose en modo producción en lugar de desarrollo.

**Solución:**

```bash
# 1. Detener Flask si está ejecutándose (Ctrl+C)
# 2. Configurar variable de entorno
export FLASK_DEBUG=1

# 3. Reiniciar Flask
pipenv run start
```

**Explicación:** Sin `FLASK_DEBUG=1`, Flask determina automáticamente que está en producción y sirve el frontend de React en lugar de mostrar el sitemap de la API.

### **Error de conexión Frontend ↔ Backend**

Verificar que `VITE_BACKEND_URL` en `.env` coincida con la URL real del backend.

### **Error de CORS**

Asegurar que el backend esté ejecutándose y que la URL sea correcta.

### **Error de base de datos**

```bash
pipenv run downgrade
pipenv run upgrade
```

### **Múltiples procesos Flask ejecutándose**

```bash
# Encontrar procesos Flask
ps aux | grep flask

# Terminar procesos específicos
kill [PID]

# O terminar todos los procesos Python
pkill -f python
```
