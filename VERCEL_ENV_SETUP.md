# 🔐 Configuración de Variables de Entorno en Vercel

Este documento explica cómo configurar las variables de entorno necesarias para que la aplicación funcione correctamente en Vercel.

## 📋 Variables Requeridas

### ⚠️ CRÍTICAS (Deben estar configuradas)

1. **ODOO_URL**
   - Descripción: URL del servidor Odoo
   - Ejemplo: `https://fexs.mx`
   - **Requerida**: ✅ Sí

2. **ODOO_DB**
   - Descripción: Nombre de la base de datos de Odoo
   - Ejemplo: `Productiva`
   - **Requerida**: ✅ Sí

3. **JWT_SECRET**
   - Descripción: Clave secreta para firmar tokens JWT (autenticación)
   - Generación: `openssl rand -base64 32`
   - Ejemplo: `aB3xY9mN2pQ7rT5wV8zC1dF4gH6jK0lM3nP6sU9vW2`
   - **Requerida**: ✅ Sí (sin esto, la autenticación no funcionará)

### 🔧 Opcionales (pero recomendadas)

4. **DB_HOST**
   - Descripción: Host de PostgreSQL (si necesitas acceso directo a la BD)
   - Ejemplo: `98.80.84.181`
   - **Requerida**: ❌ No

5. **DB_PORT**
   - Descripción: Puerto de PostgreSQL
   - Valor por defecto: `5432`
   - **Requerida**: ❌ No

6. **DB_NAME**
   - Descripción: Nombre de la base de datos PostgreSQL
   - Ejemplo: `Productiva`
   - **Requerida**: ❌ No

7. **DB_USER**
   - Descripción: Usuario de PostgreSQL
   - Ejemplo: `odoo16`
   - **Requerida**: ❌ No

8. **DB_PASSWORD**
   - Descripción: Contraseña de PostgreSQL
   - **Requerida**: ❌ No

9. **TEST_USER**
   - Descripción: Usuario de prueba (solo para desarrollo)
   - Ejemplo: `soporte.tecnico@varcus.com.mx`
   - **Requerida**: ❌ No

10. **TEST_PASSWORD**
    - Descripción: Contraseña de prueba (solo para desarrollo)
    - **Requerida**: ❌ No

11. **NODE_ENV**
    - Descripción: Entorno de ejecución
    - Valor recomendado para Vercel: `production`
    - **Requerida**: ❌ No (Vercel lo configura automáticamente)

12. **PORT**
    - Descripción: Puerto del servidor
    - **Requerida**: ❌ No (Vercel lo configura automáticamente)

## 🚀 Cómo Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `vreportes`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable una por una:

   ```
   Nombre: ODOO_URL
   Valor: https://fexs.mx
   Entornos: Production, Preview, Development (marca todos)
   ```

   Repite para cada variable requerida.

5. **IMPORTANTE**: Después de agregar las variables, ve a **Deployments** y haz clic en **Redeploy** en el último deployment para aplicar los cambios.

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login en Vercel
vercel login

# Agregar variables de entorno
vercel env add ODOO_URL production
vercel env add ODOO_DB production
vercel env add JWT_SECRET production

# Para agregar a todos los entornos (production, preview, development)
vercel env add ODOO_URL
vercel env add ODOO_DB
vercel env add JWT_SECRET
```

## 🔑 Generar JWT_SECRET

Si no tienes un JWT_SECRET, genera uno seguro:

```bash
# En Linux/Mac
openssl rand -base64 32

# O usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y úsalo como valor de `JWT_SECRET` en Vercel.

## ✅ Verificación

Después de configurar las variables:

1. Haz un nuevo deployment en Vercel
2. Verifica que la aplicación carga correctamente
3. Intenta hacer login con credenciales de Odoo
4. Si hay errores, revisa los logs de Vercel:
   - Ve a **Deployments** → Selecciona el deployment → **Functions** → Revisa los logs

## 🐛 Troubleshooting

### Error: "Cannot read properties of null"
- **Causa**: Variables de entorno no configuradas o no aplicadas
- **Solución**: Verifica que todas las variables críticas estén configuradas y haz un redeploy

### Error de autenticación
- **Causa**: `JWT_SECRET` no configurado o `ODOO_URL`/`ODOO_DB` incorrectos
- **Solución**: Verifica que estas variables estén correctamente configuradas

### La aplicación carga pero no se conecta a Odoo
- **Causa**: `ODOO_URL` o `ODOO_DB` incorrectos
- **Solución**: Verifica que la URL y el nombre de la base de datos sean correctos

## 📝 Checklist de Configuración

- [ ] `ODOO_URL` configurada
- [ ] `ODOO_DB` configurada
- [ ] `JWT_SECRET` generada y configurada
- [ ] Variables aplicadas a todos los entornos (Production, Preview, Development)
- [ ] Nuevo deployment realizado después de agregar las variables
- [ ] Login funciona correctamente
- [ ] Dashboard carga datos de Odoo

## 🔒 Seguridad

- **NUNCA** compartas tus variables de entorno públicamente
- **NUNCA** las subas al repositorio Git
- Usa valores diferentes para `JWT_SECRET` en desarrollo y producción
- Rota `JWT_SECRET` periódicamente en producción

