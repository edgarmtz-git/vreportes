# 🚀 Despliegue en Vercel - Reportes Varcus

## 📋 Preparación Completa

### ✅ Archivos de Configuración Creados

1. **`vercel.json`** - Configuración principal de Vercel
2. **`.vercelignore`** - Archivos a ignorar en el despliegue
3. **Scripts actualizados** en `package.json`

### 🔧 Configuración de Vercel

El proyecto está configurado como una aplicación **Full-Stack** con:
- **Frontend**: React + Vite (servido como estático)
- **Backend**: Express + TypeScript (servidor Node.js)
- **API Routes**: `/api/*` dirigidas al servidor
- **Static Files**: Todo lo demás servido desde el cliente

## 🚀 Pasos para Desplegar

### 1. Instalar Vercel CLI (Recomendado)

```bash
npm i -g vercel
```

### 2. Login en Vercel

```bash
vercel login
```

### 3. Desplegar desde Git

#### Opción A: Desde Terminal
```bash
# En el directorio del proyecto
vercel --prod
```

#### Opción B: Desde Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Importa el proyecto
4. Vercel detectará automáticamente la configuración

### 4. Configurar Variables de Entorno

En el dashboard de Vercel, agrega estas variables:

```
ODOO_URL=https://tu-servidor-odoo.com
ODOO_DB=nombre_base_datos
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_postgresql
DB_PASSWORD=tu_password_seguro_aqui
TEST_USER=usuario_prueba@ejemplo.com
TEST_PASSWORD=password_prueba_seguro
NODE_ENV=production
PORT=3001
```

## 🎯 Estructura del Despliegue

### Rutas Configuradas
- **`/api/*`** → Servidor Express (backend)
- **`/*`** → Cliente React (frontend)

### Build Process
1. **Frontend**: Vite build → archivos estáticos
2. **Backend**: TypeScript compilado → función serverless

## 🔍 Verificación Post-Despliegue

### 1. Probar Endpoints
```bash
# Login
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"tu-usuario@ejemplo.com","password":"tu-password"}'

# Logout
curl -X POST https://tu-app.vercel.app/api/auth/logout \
  -H 'Content-Type: application/json'
```

### 2. Probar Frontend
- Visita la URL de tu app
- Debería mostrar el login
- Después del login → dashboard
- Logout debería funcionar correctamente

## 🛠️ Extensiones Recomendadas para Cursor

### Vercel Extension
```bash
# Instalar desde VS Code Marketplace
# Buscar: "Vercel"
# Publisher: Vercel Inc.
```

### Funcionalidades de la Extensión
- ✅ Deploy directo desde Cursor
- ✅ Ver logs en tiempo real
- ✅ Gestionar variables de entorno
- ✅ Ver métricas de rendimiento
- ✅ Rollback de deployments

## 🚨 Troubleshooting

### Problemas Comunes

1. **Build Fails**
   ```bash
   # Verificar dependencias
   npm install
   npm run build:vercel
   ```

2. **API No Responde**
   - Verificar variables de entorno
   - Revisar logs en Vercel dashboard

3. **Frontend No Carga**
   - Verificar configuración de rutas en `vercel.json`
   - Revisar build output

### Logs y Debugging
```bash
# Ver logs en tiempo real
vercel logs

# Ver logs específicos
vercel logs --follow
```

## 📊 Monitoreo

### Métricas Disponibles
- ✅ **Performance**: Tiempo de respuesta
- ✅ **Errors**: Logs de errores
- ✅ **Usage**: Uso de funciones serverless
- ✅ **Analytics**: Visitas y comportamiento

## 🔄 Actualizaciones Automáticas

### Git Integration
- **Push a main** → Deploy automático
- **Pull Requests** → Preview deployments
- **Branch protection** → Deploy solo desde main

## 🎉 ¡Listo para Desplegar!

Tu proyecto está completamente preparado para Vercel:

1. ✅ **Configuración completa**
2. ✅ **Scripts optimizados**
3. ✅ **Variables de entorno documentadas**
4. ✅ **Troubleshooting guide**

### Próximos Pasos
1. Instalar Vercel CLI
2. Hacer login
3. Desplegar con `vercel --prod`
4. Configurar variables de entorno
5. ¡Disfrutar tu app en producción! 🚀
