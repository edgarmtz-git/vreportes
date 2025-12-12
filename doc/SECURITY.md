# 🔒 Política de Seguridad

Este documento describe las prácticas de seguridad para el proyecto VReportes.

## ⚠️ Información Sensible

**NUNCA** subas al repositorio los siguientes archivos o información:

- Archivos `.env` o cualquier archivo con credenciales
- Contraseñas, tokens o claves API
- Certificados SSL/TLS (`.pem`, `.key`, `.cert`)
- Credenciales de base de datos
- Credenciales de Odoo
- JWT secrets
- Cualquier información de producción

## 🔐 Variables de Entorno

El proyecto utiliza variables de entorno para configurar credenciales y configuraciones sensibles.

### Archivo `.env.example`

Este archivo contiene un template de las variables de entorno necesarias **sin valores reales**. 

**Para configurar el proyecto:**

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y completa con tus valores reales:
   ```bash
   nano .env  # o usa tu editor preferido
   ```

3. **NUNCA** subas el archivo `.env` al repositorio

### Variables Requeridas

- `ODOO_URL`: URL del servidor Odoo
- `ODOO_DB`: Nombre de la base de datos de Odoo
- `DB_HOST`: Host de PostgreSQL (opcional)
- `DB_PASSWORD`: Contraseña de PostgreSQL (opcional)
- `JWT_SECRET`: Clave secreta para JWT (generar una única y segura)
- `TEST_USER`: Usuario de prueba (solo desarrollo)
- `TEST_PASSWORD`: Contraseña de prueba (solo desarrollo)
- `PORT`: Puerto del servidor

## 🛡️ Buenas Prácticas

### 1. Credenciales en Código

**❌ NUNCA hagas esto:**
```typescript
const password = 'mi_password_secreto';
const apiKey = 'sk_live_1234567890';
```

**✅ SIEMPRE usa variables de entorno:**
```typescript
const password = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;
```

### 2. Valores por Defecto

Si necesitas valores por defecto para desarrollo, úsalos solo localmente:

```typescript
// ✅ Correcto: valor por defecto solo para desarrollo local
const testPassword = process.env.TEST_PASSWORD || 'dev_password_only';

// ❌ Incorrecto: credenciales de producción hardcodeadas
const password = 'production_password';
```

### 3. Archivos de Configuración

- ✅ `.env.example` - Template sin valores reales (puede subirse)
- ❌ `.env` - Archivo con valores reales (NUNCA subir)
- ❌ `config.json` - Si contiene credenciales, agregar a `.gitignore`

### 4. Archivos de Prueba

Los archivos de prueba (`test-api.html`, `test-server.sh`) no deben contener credenciales reales. Si necesitas valores de ejemplo, usa placeholders.

## 🔍 Verificación Antes de Commit

Antes de hacer commit, verifica:

```bash
# Verificar que no hay archivos .env
git status | grep -E "\.env$|\.env\."

# Verificar que no hay credenciales hardcodeadas
grep -r "password.*=" --include="*.ts" --include="*.js" --include="*.tsx" | grep -v "process.env"
grep -r "PASSWORD" --include="*.ts" --include="*.js" --include="*.tsx" | grep -v "process.env"
```

## 🚨 Si Expusiste Credenciales

Si accidentalmente subiste credenciales al repositorio:

1. **Inmediatamente** cambia todas las credenciales expuestas
2. Elimina el archivo del historial de Git:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch archivo-con-credenciales" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Fuerza el push (si ya se subió):
   ```bash
   git push origin --force --all
   ```
4. Notifica al equipo si es un repositorio compartido

## 📋 Checklist de Seguridad

Antes de hacer push a GitHub:

- [ ] No hay archivos `.env` en el repositorio
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Los archivos de prueba no contienen credenciales reales
- [ ] El `.gitignore` está actualizado y completo
- [ ] Las variables de entorno están documentadas en `.env.example`
- [ ] No hay tokens, API keys o secrets en el código
- [ ] Los archivos de documentación no contienen credenciales reales

## 🔐 Generación de Secrets Seguros

### JWT Secret
```bash
openssl rand -base64 32
```

### Password Seguro
```bash
openssl rand -base64 24
```

## 📞 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** crees un issue público
2. Contacta directamente al mantenedor del proyecto
3. Proporciona detalles de la vulnerabilidad de forma privada

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Última actualización:** Enero 2025


