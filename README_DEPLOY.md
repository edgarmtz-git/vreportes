# 🚀 Reportes Varcus - Despliegue en Vercel

## ⚡ Despliegue Rápido

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Login y Desplegar
```bash
vercel login
vercel --prod
```

### 3. Configurar Variables de Entorno
En el dashboard de Vercel, agrega:
```
ODOO_URL=https://fexs.mx
ODOO_DB=Productiva
DB_HOST=98.80.84.181
DB_PORT=5432
DB_NAME=Productiva
DB_USER=odoo16
DB_PASSWORD=tu_password
TEST_USER=soporte.tecnico@varcus.com.mx
TEST_PASSWORD=z14K7uN1
NODE_ENV=production
```

## 🔧 Extensiones Recomendadas para Cursor

### Vercel Extension
- **Nombre**: Vercel
- **Publisher**: Vercel Inc.
- **Funcionalidades**:
  - ✅ Deploy directo desde Cursor
  - ✅ Ver logs en tiempo real
  - ✅ Gestionar variables de entorno
  - ✅ Ver métricas de rendimiento

### Instalación
1. Abre Cursor
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "Vercel"
4. Instala la extensión oficial

## 📊 Estado del Proyecto

### ✅ Funcionalidades Implementadas
- **Autenticación**: Login/logout con Odoo
- **Dashboard**: Interfaz completa con sidebar
- **Rutas Protegidas**: Seguridad implementada
- **API**: Endpoints funcionando
- **Responsive**: Diseño adaptable

### ✅ Preparado para Producción
- **Build optimizado**: Vite + TypeScript
- **Configuración Vercel**: vercel.json configurado
- **Variables de entorno**: Documentadas
- **Scripts**: Optimizados para producción

## 🎯 URLs de Prueba

### Después del Despliegue
- **App Principal**: `https://tu-app.vercel.app`
- **Login**: `https://tu-app.vercel.app/` (redirige automáticamente)
- **Dashboard**: `https://tu-app.vercel.app/dashboard` (requiere login)
- **API**: `https://tu-app.vercel.app/api/auth/login`

### Credenciales de Prueba
```
Usuario: soporte.tecnico@varcus.com.mx
Contraseña: z14K7uN1
```

## 🔍 Verificación Post-Despliegue

### 1. Probar Login
```bash
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"soporte.tecnico@varcus.com.mx","password":"z14K7uN1"}'
```

### 2. Probar Logout
```bash
curl -X POST https://tu-app.vercel.app/api/auth/logout \
  -H 'Content-Type: application/json'
```

### 3. Verificar Frontend
- Visita la URL de tu app
- Debería mostrar el login
- Después del login → dashboard con sidebar
- Logout debería redirigir al login

## 🚨 Troubleshooting

### Build Fails
```bash
npm install
npm run build:vercel
```

### API No Responde
- Verificar variables de entorno en Vercel
- Revisar logs: `vercel logs`

### Frontend No Carga
- Verificar configuración en vercel.json
- Revisar build output

## 📈 Monitoreo

### Métricas Disponibles
- **Performance**: Tiempo de respuesta
- **Errors**: Logs de errores
- **Usage**: Uso de funciones serverless
- **Analytics**: Visitas y comportamiento

## 🔄 Actualizaciones

### Deploy Automático
- **Push a main** → Deploy automático
- **Pull Requests** → Preview deployments

### Deploy Manual
```bash
vercel --prod
```

## 🎉 ¡Listo!

Tu aplicación está completamente preparada para Vercel:

1. ✅ **Configuración completa**
2. ✅ **Build funcionando**
3. ✅ **Documentación completa**
4. ✅ **Scripts de verificación**

### Próximo Paso
```bash
vercel --prod
```

¡Y tu app estará en producción! 🚀
