# ✅ Checklist Pre-Deploy - VReportes

Este documento contiene una lista de verificación completa antes de desplegar el proyecto a GitHub y Vercel.

## 🔒 Seguridad

### Archivos Sensibles
- [ ] No hay archivos `.env` en el repositorio
- [ ] No hay archivos `.env.local`, `.env.production`, etc.
- [ ] No hay credenciales hardcodeadas en el código
- [ ] No hay tokens, API keys o secrets en el código
- [ ] Archivos de ejemplo (`.example.env`) no contienen credenciales reales
- [ ] Documentación no contiene credenciales reales

### Verificación de Seguridad
- [ ] Ejecutar `./check-security.sh` sin errores
- [ ] Revisar `.gitignore` está completo y actualizado
- [ ] Verificar que `.gitattributes` está configurado correctamente

## 📝 Documentación

- [ ] `README.md` está actualizado y completo
- [ ] `SECURITY.md` está presente y actualizado
- [ ] `MANUAL_TECNICO.md` está actualizado
- [ ] Archivos de documentación no contienen credenciales
- [ ] Variables de entorno están documentadas en `.env.example`

## 🏗️ Configuración del Proyecto

### Package.json
- [ ] Todas las dependencias están listadas
- [ ] Scripts están correctamente configurados
- [ ] Versiones de dependencias son compatibles
- [ ] No hay dependencias vulnerables conocidas

### TypeScript
- [ ] `npm run check` ejecuta sin errores
- [ ] No hay errores de TypeScript
- [ ] `tsconfig.json` está correctamente configurado

### Build
- [ ] `npm run build:client` ejecuta correctamente
- [ ] Build genera archivos en `dist/public/`
- [ ] No hay errores de compilación
- [ ] Archivos estáticos se generan correctamente

## 🚀 Configuración de Vercel

### vercel.json
- [ ] `vercel.json` está presente y correctamente configurado
- [ ] `buildCommand` apunta al comando correcto
- [ ] `outputDirectory` es correcto (`dist/public`)
- [ ] Rewrites están configurados para SPA
- [ ] Rutas de API están correctamente configuradas

### Variables de Entorno
- [ ] Lista de variables de entorno documentada
- [ ] `.env.example` contiene todas las variables necesarias
- [ ] Variables de producción están separadas de desarrollo

## 🧪 Testing

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Logout funciona correctamente
- [ ] Dashboard carga correctamente
- [ ] Filtros funcionan en todas las vistas
- [ ] Gráficos se renderizan correctamente
- [ ] Tablas muestran datos correctamente
- [ ] Paginación funciona en todas las tablas

### Integración con Odoo
- [ ] Conexión con Odoo funciona
- [ ] Autenticación con Odoo funciona
- [ ] Endpoints de API responden correctamente
- [ ] Manejo de errores está implementado

## 📦 Archivos y Estructura

### Archivos Necesarios
- [ ] `.gitignore` presente y completo
- [ ] `.gitattributes` presente
- [ ] `vercel.json` presente
- [ ] `package.json` presente y actualizado
- [ ] `tsconfig.json` presente
- [ ] `README.md` presente

### Archivos a Excluir
- [ ] `node_modules/` está en `.gitignore`
- [ ] `dist/` está en `.gitignore`
- [ ] `.env*` está en `.gitignore` (excepto `.example.env`)
- [ ] Archivos temporales están en `.gitignore`

## 🔍 Linting y Calidad de Código

- [ ] No hay errores de linting
- [ ] Código sigue las convenciones del proyecto
- [ ] No hay console.logs de debug en producción
- [ ] Manejo de errores está implementado

## 🌐 Configuración de GitHub

### Repositorio
- [ ] Repositorio está creado en GitHub
- [ ] Descripción del repositorio está actualizada
- [ ] Topics/tags están configurados
- [ ] README se muestra correctamente

### Protección de Ramas
- [ ] Rama `main` está protegida (recomendado)
- [ ] Requiere revisión antes de merge (recomendado)
- [ ] Requiere que los checks pasen (recomendado)

## 📊 Verificación Final

### Antes de Push
```bash
# 1. Verificar estado de Git
git status

# 2. Verificar seguridad
./check-security.sh

# 3. Verificar build
npm run build:client

# 4. Verificar TypeScript
npm run check

# 5. Ver archivos que se van a commitear
git diff --cached
```

### Después de Push a GitHub
- [ ] Código está en GitHub
- [ ] No hay archivos sensibles en el historial
- [ ] README se muestra correctamente
- [ ] Issues están configurados (opcional)

### Después de Deploy en Vercel
- [ ] Build en Vercel es exitoso
- [ ] Variables de entorno están configuradas
- [ ] Aplicación está accesible
- [ ] Login funciona en producción
- [ ] API endpoints funcionan
- [ ] Frontend carga correctamente

## 🚨 Si Algo Sale Mal

### Build Falla en Vercel
1. Revisar logs en Vercel dashboard
2. Verificar variables de entorno
3. Verificar que `buildCommand` es correcto
4. Verificar que `outputDirectory` existe después del build

### API No Responde
1. Verificar variables de entorno en Vercel
2. Verificar que Odoo está accesible
3. Revisar logs de Vercel
4. Verificar configuración de rewrites en `vercel.json`

### Frontend No Carga
1. Verificar configuración de rewrites
2. Verificar que build genera `index.html`
3. Verificar rutas en React Router
4. Revisar consola del navegador

## 📞 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Seguridad](./SECURITY.md)
- [Manual Técnico](./MANUAL_TECNICO.md)
- [Guía de Despliegue](./DEPLOYMENT.md)

---

**Última actualización:** Enero 2025

**Nota:** Completa este checklist antes de cada deploy a producción.

