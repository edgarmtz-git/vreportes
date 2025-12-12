# ✅ Checklist Pre-Commit - Seguridad

Usa esta lista antes de hacer commit y push a GitHub para asegurar que no se expone información sensible.

## 🔍 Verificación Rápida

Ejecuta el script de verificación:

```bash
./check-security.sh
```

## 📋 Checklist Manual

### Archivos y Configuración

- [ ] ✅ El archivo `.env` NO está en el repositorio
- [ ] ✅ El archivo `.env` está en `.gitignore`
- [ ] ✅ No hay archivos `.env.local`, `.env.production`, etc. en el repo
- [ ] ✅ El archivo `odoo-config.example.env` existe y NO contiene credenciales reales

### Código

- [ ] ✅ No hay contraseñas hardcodeadas en el código
- [ ] ✅ No hay tokens o API keys en el código
- [ ] ✅ Todas las credenciales usan `process.env`
- [ ] ✅ Los valores por defecto son solo para desarrollo local

### Archivos de Prueba

- [ ] ✅ `test-api.html` no contiene credenciales reales
- [ ] ✅ `test-routing.html` no contiene credenciales reales
- [ ] ✅ Archivos de prueba usan placeholders o variables de entorno

### Documentación

- [ ] ✅ `MANUAL_TECNICO.md` no contiene credenciales reales
- [ ] ✅ `README.md` y otros docs no contienen credenciales reales
- [ ] ✅ Los ejemplos usan valores de placeholder

### Archivos Sensibles

- [ ] ✅ No hay archivos `.key`, `.pem`, `.cert` en el repo
- [ ] ✅ No hay archivos `config.json` con credenciales
- [ ] ✅ No hay archivos `credentials.json`
- [ ] ✅ No hay carpetas `secrets/` o `.secrets/`

### Git

- [ ] ✅ Revisé `git status` y no hay archivos sensibles
- [ ] ✅ Revisé `git diff` y no hay credenciales en los cambios
- [ ] ✅ Si hay commits anteriores con credenciales, los eliminé del historial

## 🚨 Si Encontraste Problemas

### Si hay archivos .env en el repo:

```bash
# Eliminar del tracking
git rm --cached .env
git rm --cached .env.local

# Asegurar que están en .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### Si hay credenciales en commits anteriores:

```bash
# Usar git filter-branch o BFG Repo-Cleaner
# Ver SECURITY.md para más detalles
```

### Si hay credenciales hardcodeadas:

1. Reemplázalas con `process.env.VARIABLE_NAME`
2. Agrega la variable a `.env.example`
3. Documenta en `SECURITY.md` si es necesario

## 📚 Recursos

- [SECURITY.md](./SECURITY.md) - Política de seguridad completa
- [README_SETUP.md](./README_SETUP.md) - Guía de configuración
- [check-security.sh](./check-security.sh) - Script de verificación automática

---

**Recuerda:** Es mejor prevenir que lamentar. Si tienes dudas, NO hagas commit hasta estar seguro.


