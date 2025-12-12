#!/bin/bash

# 🔐 Script de Prueba de Autenticación con Odoo
# Este script ayuda a diagnosticar problemas de autenticación

echo "🔍 Diagnóstico de Autenticación con Odoo"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Leer variables de entorno si existen
if [ -f .env ]; then
    echo -e "${BLUE}📋 Cargando configuración desde .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No se encontró archivo .env, usando valores por defecto${NC}"
fi

ODOO_URL=${ODOO_URL:-"https://fexs.mx"}
ODOO_DB=${ODOO_DB:-"Productiva"}

echo ""
echo -e "${BLUE}Configuración actual:${NC}"
echo "  ODOO_URL: $ODOO_URL"
echo "  ODOO_DB: $ODOO_DB"
echo ""

# Solicitar credenciales
read -p "Ingresa el email/usuario de Odoo: " USER_LOGIN
read -sp "Ingresa la contraseña: " USER_PASSWORD
echo ""

if [ -z "$USER_LOGIN" ] || [ -z "$USER_PASSWORD" ]; then
    echo -e "${RED}❌ Usuario y contraseña son requeridos${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 Intentando autenticación...${NC}"
echo ""

# Realizar prueba de autenticación
RESPONSE=$(curl -s -X POST "$ODOO_URL/web/session/authenticate" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\": \"call\",
    \"params\": {
      \"db\": \"$ODOO_DB\",
      \"login\": \"$USER_LOGIN\",
      \"password\": \"$USER_PASSWORD\"
    },
    \"id\": 1
  }")

# Verificar respuesta
if echo "$RESPONSE" | grep -q '"error"'; then
    echo -e "${RED}❌ Error de autenticación:${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Error desconocido")
    
    echo ""
    echo -e "${YELLOW}💡 Posibles soluciones:${NC}"
    
    if echo "$ERROR_MSG" | grep -qi "wrong\|invalid\|incorrect"; then
        echo "  1. Verifica que el usuario y contraseña sean correctos"
        echo "  2. El usuario puede estar en otra base de datos"
        echo "  3. El formato del login puede ser diferente (email vs username)"
    elif echo "$ERROR_MSG" | grep -qi "database\|db"; then
        echo "  1. Verifica que la base de datos '$ODOO_DB' sea correcta"
        echo "  2. El usuario puede estar en otra base de datos"
        echo "  3. Verifica el nombre de la base de datos en Odoo"
    else
        echo "  1. Verifica la conectividad con $ODOO_URL"
        echo "  2. Verifica que el servidor Odoo esté disponible"
        echo "  3. Verifica la configuración de red/firewall"
    fi
    
    exit 1
elif echo "$RESPONSE" | grep -q '"result"'; then
    echo -e "${GREEN}✅ Autenticación exitosa!${NC}"
    echo ""
    echo "Información del usuario:"
    echo "$RESPONSE" | jq '.result | {uid, name, username, db, company_id}' 2>/dev/null || echo "$RESPONSE"
    exit 0
else
    echo -e "${RED}❌ Respuesta inesperada:${NC}"
    echo "$RESPONSE"
    exit 1
fi

