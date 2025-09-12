# 🚀 Próximos Pasos - Resolución del Problema de Autenticación Odoo

## 📋 Resumen del Problema

**Estado Actual:** El dashboard de facturación funciona correctamente con datos de prueba, pero falla al obtener datos reales de Odoo para el modelo `account.move` (facturas), mientras que funciona perfectamente para `account.payment` (pagos).

**Problema Identificado:** 
- ✅ Autenticación exitosa con Odoo
- ✅ Obtención de datos de facturas (3, 52, 10, 15, 4 registros)
- ❌ Error en el conteo de registros (`search_count` o segunda consulta)
- ✅ Sistema de autenticación unificado implementado

---

## 🎯 Tareas para Hoy

### 1. 🔍 **Investigar el Error Específico de Odoo**

**Prioridad:** ALTA
**Tiempo estimado:** 30-45 minutos

#### Acciones:
- [ ] **Revisar logs detallados de Odoo** en el servidor
- [ ] **Verificar permisos específicos** del usuario `soporte.tecnico@varcus.com.mx` para `account.move`
- [ ] **Probar consulta directa** en Odoo usando la misma consulta que falla
- [ ] **Verificar configuración de acceso** para el modelo `account.move`

#### Comandos útiles:
```bash
# Verificar logs de Odoo
tail -f /var/log/odoo/odoo.log

# Probar consulta directa en Odoo
curl -X POST https://fexs.mx/web/dataset/call_kw \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "model": "account.move",
      "method": "search_count",
      "args": [[["move_type", "in", ["out_invoice", "out_refund"]]]]
    }
  }'
```

---

### 2. 🔧 **Implementar Solución Alternativa**

**Prioridad:** ALTA
**Tiempo estimado:** 20-30 minutos

#### Opciones a probar:

##### Opción A: Usar `search_read` para contar
```typescript
// En lugar de search_count, usar search_read con limit alto
const countResponse = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
  jsonrpc: '2.0',
  method: 'call',
  params: {
    model: 'account.move',
    method: 'search_read',
    args: [searchFilters],
    kwargs: {
      fields: ['id'],
      limit: 10000 // Límite alto para contar
    }
  }
});
```

##### Opción B: Simplificar la consulta de conteo
```typescript
// Usar solo los filtros básicos para contar
const countFilters = [
  ['move_type', 'in', ['out_invoice', 'out_refund']],
  ['invoice_date', '>=', filters.dateFrom],
  ['invoice_date', '<=', filters.dateTo]
];
```

##### Opción C: Omitir el conteo temporalmente
```typescript
// Retornar datos sin paginación exacta
return {
  data: invoices,
  pagination: {
    page,
    pageSize,
    totalRecords: invoices.length, // Aproximación
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }
};
```

---

### 3. 🧪 **Probar con Diferentes Usuarios**

**Prioridad:** MEDIA
**Tiempo estimado:** 15-20 minutos

#### Acciones:
- [ ] **Probar con usuario administrador** de Odoo
- [ ] **Verificar credenciales** de otros usuarios con permisos completos
- [ ] **Probar con usuario del sistema** si es necesario

#### Configuración de prueba:
```bash
# Variables de entorno para probar
export TEST_USER="admin@fexs.mx"
export TEST_PASSWORD="admin_password"
```

---

### 4. 🔍 **Debugging Avanzado**

**Prioridad:** MEDIA
**Tiempo estimado:** 25-35 minutos

#### Implementar logging detallado:
```typescript
// Agregar al método getInvoiceData
console.log('🔍 Debug - Filtros exactos:', JSON.stringify(searchFilters));
console.log('🔍 Debug - Contexto:', JSON.stringify({
  'uid': user.uid,
  'tz': 'America/Mexico_City',
  'lang': 'es_MX'
}));

// Log de respuesta completa
console.log('🔍 Debug - Respuesta Odoo:', JSON.stringify(queryData, null, 2));
```

#### Verificar diferencias entre modelos:
```typescript
// Comparar consultas exitosas vs fallidas
const paymentQuery = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
  // Consulta de pagos que funciona
});

const invoiceQuery = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
  // Consulta de facturas que falla
});
```

---

### 5. 🚀 **Implementar Solución Definitiva**

**Prioridad:** ALTA
**Tiempo estimado:** 30-45 minutos

#### Una vez identificado el problema:

##### Si es problema de permisos:
- [ ] **Configurar permisos** en Odoo para el usuario
- [ ] **Verificar grupos de usuario** y sus accesos
- [ ] **Actualizar configuración** de seguridad

##### Si es problema de consulta:
- [ ] **Ajustar filtros** de búsqueda
- [ ] **Modificar método** de conteo
- [ ] **Optimizar consulta** para mejor rendimiento

##### Si es problema de sesión:
- [ ] **Mejorar manejo** de cookies
- [ ] **Implementar renovación** automática de sesión
- [ ] **Agregar retry logic** para requests fallidos

---

## 📊 Plan de Pruebas

### Pruebas a Realizar:
- [ ] **Prueba 1:** Consulta básica de `account.move`
- [ ] **Prueba 2:** Conteo de registros con `search_count`
- [ ] **Prueba 3:** Conteo alternativo con `search_read`
- [ ] **Prueba 4:** Diferentes rangos de fechas
- [ ] **Prueba 5:** Diferentes estados de factura
- [ ] **Prueba 6:** Paginación completa

### Criterios de Éxito:
- ✅ **Datos reales** de Odoo en lugar de datos de prueba
- ✅ **Paginación correcta** con conteo exacto
- ✅ **Filtros funcionando** correctamente
- ✅ **Rendimiento aceptable** (< 2 segundos por consulta)

---

## 🛠️ Herramientas de Debugging

### Logs a Monitorear:
```bash
# Logs del servidor Node.js
tail -f server.log

# Logs de Odoo
tail -f /var/log/odoo/odoo.log

# Logs de red
tcpdump -i any port 3001
```

### Comandos de Prueba:
```bash
# Probar API de facturas
curl -X POST http://localhost:3001/api/reports/invoices \
  -H "Content-Type: application/json" \
  -d '{"dateFrom":"2025-09-01","dateTo":"2025-09-12","page":1,"pageSize":5}'

# Probar API de pagos (que funciona)
curl -X POST http://localhost:3001/api/reports/daily-payments \
  -H "Content-Type: application/json" \
  -d '{"dateFrom":"2025-09-01","dateTo":"2025-09-12"}'
```

---

## 📝 Notas Importantes

### Lo que ya funciona:
- ✅ **Sistema de autenticación unificado**
- ✅ **Dashboard frontend completo**
- ✅ **API de pagos funcionando**
- ✅ **Datos de prueba como fallback**
- ✅ **Paginación y filtros**

### Lo que necesita resolución:
- ❌ **Consulta de conteo** para facturas
- ❌ **Datos reales** de Odoo para facturas
- ❌ **Paginación exacta** para facturas

---

## 🎯 Objetivo Final

**Al final del día:** Dashboard de facturación funcionando completamente con datos reales de Odoo, manteniendo la funcionalidad actual de datos de prueba como fallback.

**Métricas de éxito:**
- ⏱️ **Tiempo de respuesta:** < 2 segundos
- 📊 **Datos reales:** 100% de las consultas exitosas
- 🔄 **Fallback:** Datos de prueba cuando Odoo falla
- 🎨 **UX:** Sin cambios en la interfaz de usuario

---

## 📞 Contacto de Emergencia

Si se requiere acceso adicional a Odoo o configuración del servidor:
- **Administrador Odoo:** [Contacto]
- **Servidor:** https://fexs.mx
- **Usuario actual:** soporte.tecnico@varcus.com.mx

---

*Documento generado el: $(date)*
*Última actualización: $(date)*
