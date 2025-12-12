# 📊 VReportes - Sistema de Reportes Varcus

Sistema de reportes y análisis financiero integrado con Odoo 16 para visualización de facturas, pagos y cotizaciones.

## 🚀 Características

- **Dashboard de Facturación**: Visualización completa de facturas con filtros avanzados
- **Informe de Pagos Diarios**: Análisis de ingresos con estado de REP (Recibo Electrónico de Pago)
- **Dashboard de Cotizaciones**: Seguimiento de cotizaciones (aceptadas, rechazadas, pendientes)
- **Integración con Odoo**: Conexión directa con Odoo 16 mediante API JSON-RPC
- **Autenticación**: Sistema de login/logout con Odoo
- **Gráficos Interactivos**: Visualizaciones con Recharts
- **Responsive Design**: Interfaz adaptable a diferentes dispositivos

## 🛠️ Stack Tecnológico

### Frontend
- React 18.3
- TypeScript
- Vite
- React Router DOM
- TailwindCSS + shadcn/ui
- Recharts

### Backend
- Node.js + Express.js
- TypeScript
- Odoo JSON-RPC API Client

### Integración
- Odoo 16 (ERP)
- PostgreSQL (Base de datos de Odoo)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Acceso a servidor Odoo 16
- Credenciales de Odoo

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/vreportes.git
cd vreportes
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp odoo-config.example.env .env
```

Edita `.env` con tus credenciales:

```env
ODOO_URL=https://tu-servidor-odoo.com
ODOO_DB=nombre_base_datos
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=nombre_base_datos
DB_USER=usuario_postgresql
DB_PASSWORD=tu_password_seguro
TEST_USER=usuario_prueba@ejemplo.com
TEST_PASSWORD=password_prueba_seguro
NODE_ENV=development
PORT=3001
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## 📚 Documentación

- [Manual Técnico](./MANUAL_TECNICO.md) - Documentación completa de implementación
- [Guía de Seguridad](./SECURITY.md) - Políticas y mejores prácticas de seguridad
- [Guía de Despliegue](./DEPLOYMENT.md) - Instrucciones para desplegar en producción
- [Checklist Pre-Deploy](./PRE_COMMIT_CHECKLIST.md) - Lista de verificación antes de commit

## 🔐 Seguridad

**IMPORTANTE**: Nunca subas archivos `.env` o credenciales al repositorio.

- ✅ Usa variables de entorno para todas las credenciales
- ✅ Revisa `.gitignore` antes de hacer commit
- ✅ Ejecuta `./check-security.sh` antes de hacer push
- ✅ Lee [SECURITY.md](./SECURITY.md) para más información

## 🚀 Despliegue en Vercel

### Configuración Rápida

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Login y Desplegar**
```bash
vercel login
vercel --prod
```

3. **Configurar Variables de Entorno**
   - Ve al dashboard de Vercel
   - Agrega las variables de entorno desde `.env`
   - **NUNCA** uses credenciales de producción en archivos de documentación

Ver [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) para más detalles.

## 📁 Estructura del Proyecto

```
vreportes/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── lib/           # Utilidades y helpers
│   └── vite.config.js     # Configuración de Vite
├── server/                 # Backend Express
│   ├── lib/
│   │   └── odooService.ts # Servicio de integración con Odoo
│   ├── routes.ts          # Rutas de la API
│   └── index.ts           # Punto de entrada del servidor
├── api/                   # Funciones serverless (Vercel)
├── vercel.json            # Configuración de Vercel
├── .gitignore            # Archivos ignorados por Git
└── package.json          # Dependencias y scripts
```

## 🧪 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build de producción
- `npm run build:client` - Build solo del cliente
- `npm run start` - Inicia servidor de producción
- `npm run check` - Verifica tipos de TypeScript
- `./check-security.sh` - Verifica seguridad antes de commit

## 📊 Módulos Principales

### Dashboard de Facturación
- Visualización de facturas con filtros por fecha y estado
- Estadísticas de facturas pagadas vs pendientes
- Top 10 clientes y vendedores
- Método de pago (PUE/PPD)

### Informe de Pagos Diarios
- Análisis de ingresos diarios
- Estado de REP (generado/no generado)
- Gráficos de tendencias
- Agrupación por diario contable

### Dashboard de Cotizaciones
- Seguimiento de cotizaciones por estado
- Análisis de oportunidades (aceptadas/rechazadas/pendientes)
- Gráficos de distribución por cantidad y montos
- Métricas de conversión

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE.md](./LICENSE.md) para más detalles.

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la [documentación técnica](./MANUAL_TECNICO.md)
- Consulta el [checklist de troubleshooting](./PRE_COMMIT_CHECKLIST.md)
- Abre un issue en GitHub

## 🔄 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial de cambios.

---

**Desarrollado para Varcus** 🚀
