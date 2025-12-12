#!/bin/bash

echo "🧪 Probando conexión con el servidor..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo "📍 URL del servidor: $BASE_URL"
echo ""

# Test 1: Verificar que el servidor está corriendo
echo "1️⃣ Verificando que el servidor está corriendo..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Servidor está respondiendo${NC}"
else
    echo -e "${RED}❌ Servidor no está respondiendo. ¿Está corriendo 'npm run dev'?${NC}"
    exit 1
fi
echo ""

# Test 2: Obtener configuración de Odoo
echo "2️⃣ Obteniendo configuración de Odoo..."
CONFIG_RESPONSE=$(curl -s "$BASE_URL/api/odoo-config")
if echo "$CONFIG_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Configuración obtenida exitosamente${NC}"
    echo "$CONFIG_RESPONSE" | jq '.' 2>/dev/null || echo "$CONFIG_RESPONSE"
else
    echo -e "${YELLOW}⚠️ Respuesta inesperada:${NC}"
    echo "$CONFIG_RESPONSE"
fi
echo ""

# Test 3: Probar conexión con Odoo
echo "3️⃣ Probando conexión con Odoo..."
TEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/test-odoo" \
    -H "Content-Type: application/json")
if echo "$TEST_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Conexión con Odoo exitosa${NC}"
    echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"
else
    echo -e "${YELLOW}⚠️ Respuesta de prueba:${NC}"
    echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Abre tu navegador en: $BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"



