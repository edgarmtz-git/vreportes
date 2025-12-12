# 🚀 Guía de Configuración - VReportes

Esta guía te ayudará a configurar el proyecto VReportes de forma segura.

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Acceso a servidor Odoo 16
- (Opcional) Acceso a base de datos PostgreSQL de Odoo

## ⚙️ Configuración Inicial

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

**IMPORTANTE:** Nunca subas el archivo `.env` al repositorio.

1. Copia el archivo de ejemplo:
   ```bash
   cp odoo-config.example.env .env
   ```

2. Edita el archivo `.env` con tus credenciales reales:
   ```bash
   nano .env  # o usa tu editor preferido
   ```

3. Completa las siguientes variables:

   ```env
   # URL de tu servidor Odoo
   ODOO_URL=https://tu-servidor-odoo.com
   
   # Nombre de la base de datos
   ODOO_DB=nombre_base_datos
   
   # Credenciales de PostgreSQL (opcional)
   DB_HOST=tu-host-postgresql
   DB_PORT=5432
   DB_NAME=nombre_base_datos
   DB_USER=usuario_postgresql
   DB_PASSWORD=tu_password_seguro
   
   # Genera una clave secreta segura para JWT
   # Puedes usar: openssl rand -base64 32
   JWT_SECRET=tu-clave-secreta-jwt-super-segura-y-unica
   
   # Credenciales de prueba (solo para desarrollo)
   TEST_USER=usuario_prueba@ejemplo.com
   TEST_PASSWORD=password_prueba_seguro
   
   # Puerto del servidor
   PORT=3001
   
   # Entorno
   NODE_ENV=development
   ```

### 4. Generar JWT Secret

Para generar una clave secreta segura para JWT:

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como valor de `JWT_SECRET` en tu archivo `.env`.

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Modo Producción

```bash
npm run build
npm start
```

## 🔒 Seguridad

### Checklist Antes de Subir a GitHub

- [ ] ✅ El archivo `.env` está en `.gitignore`
- [ ] ✅ No hay credenciales hardcodeadas en el código
- [ ] ✅ Los archivos de prueba no contienen credenciales reales
- [ ] ✅ Has revisado `SECURITY.md` para más información

### Verificar que no hay credenciales expuestas

```bash
# Verificar archivos .env
git status | grep -E "\.env$|\.env\."

# Buscar credenciales hardcodeadas
grep -r "password.*=" --include="*.ts" --include="*.js" | grep -v "process.env"
```

## 📚 Documentación Adicional

- [Manual Técnico](./MANUAL_TECNICO.md) - Documentación técnica completa
- [Política de Seguridad](./SECURITY.md) - Guía de seguridad
- [README Principal](./README.md) - Información general del proyecto

## 🆘 Solución de Problemas

### Error: "Cannot find module"

```bash
npm install
```

### Error: "Environment variables not found"

Verifica que el archivo `.env` existe y contiene todas las variables necesarias.

### Error de conexión con Odoo

1. Verifica que `ODOO_URL` sea correcta
2. Verifica que las credenciales en `TEST_USER` y `TEST_PASSWORD` sean válidas
3. Verifica la conectividad de red al servidor Odoo

## 📞 Soporte

Para problemas o preguntas, consulta la documentación o crea un issue en el repositorio.

---

**Última actualización:** Enero 2025


