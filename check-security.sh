#!/bin/bash

# 🔒 Script de Verificación de Seguridad
# Ejecuta este script antes de hacer commit para verificar que no hay información sensible

echo "🔍 Verificando seguridad del proyecto..."
echo ""

ERRORS=0
WARNINGS=0

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# 1. Verificar archivos .env
echo "1️⃣ Verificando archivos .env..."
if git ls-files | grep -E "\.env$|\.env\." | grep -v "\.example\.env" | grep -v "\.env\.example"; then
    echo -e "${RED}❌ ERROR: Archivos .env encontrados en el repositorio${NC}"
    git ls-files | grep -E "\.env$|\.env\." | grep -v "\.example\.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No hay archivos .env en el repositorio${NC}"
fi
echo ""

# 2. Verificar credenciales hardcodeadas
echo "2️⃣ Verificando credenciales hardcodeadas..."
if grep -r "password.*=.*['\"].*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "process.env" | grep -v "//" | grep -v "test" | grep -v "example"; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Posibles credenciales hardcodeadas encontradas${NC}"
    grep -r "password.*=.*['\"].*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "process.env" | grep -v "//" | grep -v "test" | grep -v "example"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No se encontraron credenciales hardcodeadas obvias${NC}"
fi
echo ""

# 3. Verificar archivos de configuración sensibles
echo "3️⃣ Verificando archivos de configuración sensibles..."
SENSITIVE_FILES=("config.json" "credentials.json" "secrets.json" "*.key" "*.pem" "*.cert")
for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files | grep -E "$file"; then
        echo -e "${RED}❌ ERROR: Archivo sensible encontrado: $file${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ No hay archivos de configuración sensibles${NC}"
fi
echo ""

# 4. Verificar que .gitignore incluye archivos sensibles
echo "4️⃣ Verificando .gitignore..."
if grep -q "\.env" .gitignore && grep -q "\.key" .gitignore && grep -q "\.pem" .gitignore; then
    echo -e "${GREEN}✅ .gitignore está configurado correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  ADVERTENCIA: .gitignore podría necesitar actualización${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 5. Verificar archivos de prueba con credenciales
echo "5️⃣ Verificando archivos de prueba..."
if grep -r "z14K7uN1\|soporte\.tecnico@varcus" --include="*.html" --include="*.md" | grep -v "example\|test\|placeholder"; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Archivos de prueba pueden contener credenciales reales${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Archivos de prueba están limpios${NC}"
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Verificación completada: Todo está seguro${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Verificación completada: $WARNINGS advertencia(s)${NC}"
    echo "Revisa las advertencias antes de hacer commit"
    exit 0
else
    echo -e "${RED}❌ Verificación fallida: $ERRORS error(es), $WARNINGS advertencia(s)${NC}"
    echo "Corrige los errores antes de hacer commit"
    exit 1
fi


