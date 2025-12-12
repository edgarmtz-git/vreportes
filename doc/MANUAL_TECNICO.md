# Manual Técnico de Implementación
## Sistema de Facturación e Informe de Pagos - VReportes

**Versión:** 1.0.0  
**Fecha:** Enero 2025  
**Autor:** Documentación Técnica VReportes

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Sistema de Facturación](#sistema-de-facturación)
4. [Informe de Pagos Diarios](#informe-de-pagos-diarios)
5. [Integración con Odoo](#integración-con-odoo)
6. [APIs y Endpoints](#apis-y-endpoints)
7. [Estructura de Datos](#estructura-de-datos)
8. [Componentes Frontend](#componentes-frontend)
9. [Cálculos y Estadísticas](#cálculos-y-estadísticas)
10. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)

---

## Introducción

Este documento describe la implementación técnica de dos sistemas principales dentro de la plataforma VReportes:

1. **Sistema de Facturación**: Dashboard completo para visualización y análisis de facturas de venta
2. **Informe de Pagos Diarios**: Sistema de análisis de pagos con estado de REP (Recibo Electrónico de Pago)

Ambos sistemas se integran con **Odoo 16** mediante su API JSON-RPC y proporcionan visualizaciones en tiempo real de datos financieros.

---

## Arquitectura General

### Stack Tecnológico

**Backend:**
- Node.js + Express.js
- TypeScript
- Odoo JSON-RPC API Client

**Frontend:**
- React 18.3
- TypeScript
- Vite (Build Tool)
- React Router DOM
- Recharts (Gráficos)
- TailwindCSS + shadcn/ui

**Integración:**
- Odoo 16 (ERP)
- PostgreSQL (Base de datos de Odoo)

### Flujo de Datos General

```
Frontend (React) 
    ↓ HTTP Request
Backend API (Express)
    ↓ JSON-RPC
Odoo Service Layer
    ↓ HTTP Request
Odoo ERP (JSON-RPC API)
    ↓ Response
Backend Processing
    ↓ JSON Response
Frontend Rendering
```

---

## Sistema de Facturación

### Descripción General

El sistema de facturación permite visualizar, filtrar y analizar facturas de venta desde Odoo, proporcionando:

- Dashboard con estadísticas generales
- Tabla paginada de facturas
- Análisis comparativo (Pagadas vs No Pagadas)
- Top 10 Clientes y Vendedores
- Filtros por rango de fechas y estado

### Arquitectura del Sistema

#### 1. Backend - Endpoint Principal

**Ruta:** `POST /api/reports/invoices`

**Ubicación:** `server/routes.ts` (líneas 272-478)

**Parámetros de Entrada:**
```typescript
{
  dateFrom: string;      // Formato: YYYY-MM-DD
  dateTo: string;        // Formato: YYYY-MM-DD
  state?: string;        // 'draft' | 'posted' | 'cancel' | undefined
  page?: number;         // Número de página (default: 1)
  pageSize?: number;     // Registros por página (default: 10)
}
```

**Respuesta:**
```typescript
{
  success: boolean;
  message: string;
  data: InvoiceData[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}
```

#### 2. Servicio Odoo - Obtención de Datos

**Método:** `OdooService.getInvoiceData()`

**Ubicación:** `server/lib/odooService.ts` (líneas 599-721)

**Proceso de Implementación:**

1. **Autenticación:**
   ```typescript
   const user = await this.ensureAuthenticated();
   ```
   - Verifica sesión existente o autentica con credenciales de prueba
   - Mantiene cookies de sesión en `globalCookieJar`
   - Usuario por defecto: Configurado en `TEST_USER` (variable de entorno)

2. **Construcción de Filtros:**
   ```typescript
   const searchFilters = [
     ['move_type', 'in', ['out_invoice', 'out_refund']],
     ['invoice_date', '>=', filters.dateFrom],
     ['invoice_date', '<=', filters.dateTo],
     ...(filters.state ? [['state', '=', filters.state]] : [])
   ];
   ```

3. **Consulta a Odoo:**
   ```typescript
   model: 'account.move'
   method: 'search_read'
   fields: [
     'id', 'name', 'invoice_date', 'invoice_date_due', 'partner_id',
     'amount_total', 'amount_residual', 'amount_tax', 'currency_id',
     'state', 'move_type', 'ref', 'invoice_origin', 'invoice_payment_term_id',
     'user_id', 'team_id', 'company_id', 'create_date', 'write_date'
   ]
   ```

4. **Paginación:**
   - Usa `limit` y `offset` para paginación
   - Obtiene total de registros con segunda consulta (limitada a 1000)

#### 3. Frontend - Componente Principal

**Componente:** `InvoiceDashboard`

**Ubicación:** `client/src/components/dashboard/invoice-dashboard.tsx`

**Estados Principales:**
```typescript
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [state, setState] = useState<string>("all");
const [stats, setStats] = useState<InvoiceStats | null>(null);
const [invoices, setInvoices] = useState<InvoiceData[]>([]);
const [pagination, setPagination] = useState<PaginationInfo | null>(null);
```

**Flujo de Datos:**

1. Usuario selecciona rango de fechas y estado
2. `fetchInvoiceData()` se ejecuta:
   - Llama a `/api/reports/invoices` con `pageSize: 1000` para estadísticas
   - Calcula estadísticas locales:
     ```typescript
     const totalInvoices = allInvoices.length;
     const paidInvoices = allInvoices.filter(isPaid).length;
     const unpaidInvoices = totalInvoices - paidInvoices;
     const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.amount_total, 0);
     const paidAmount = allInvoices.filter(isPaid).reduce((sum, inv) => sum + inv.amount_total, 0);
     const unpaidAmount = totalAmount - paidAmount;
     ```
3. `fetchTableData()` carga tabla paginada
4. Componentes hijos reciben datos:
   - `InvoiceComparison` → Comparación visual
   - `TopPerformers` → Rankings

### Estructura de Datos

#### InvoiceData
```typescript
interface InvoiceData {
  id: number;
  name: string;                    // Número de factura (ej: FACT/2025/00001)
  invoice_date: string;             // Fecha de facturación
  invoice_date_due: string;         // Fecha de vencimiento
  partner_id: [number, string];     // [ID, Nombre del Cliente]
  amount_total: number;             // Monto total
  amount_residual: number;           // Saldo pendiente (0 = pagada)
  amount_tax: number;               // Impuestos
  currency_id: [number, string];    // [ID, Código de Moneda]
  state: string;                    // 'draft' | 'posted' | 'cancel'
  move_type: string;                // 'out_invoice' | 'out_refund'
  ref: string;                      // Referencia
  invoice_origin: string;           // Origen (ej: SO001)
  invoice_payment_term_id: [number, string];
  user_id: [number, string];        // [ID, Nombre del Vendedor]
  team_id: [number, string];        // [ID, Equipo de Ventas]
  company_id: [number, string];     // [ID, Empresa]
  create_date: string;
  write_date: string;
}
```

#### InvoiceStats
```typescript
interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  invoices: InvoiceData[];
}
```

### Cálculos y Lógica de Negocio

#### 1. Factura Pagada
```typescript
const isPaid = (invoice: InvoiceData) => {
  return invoice.amount_residual === 0;
};
```

**Lógica:** Una factura se considera pagada cuando `amount_residual` es igual a 0.

#### 2. Top 10 Vendedores

**Ubicación:** `client/src/components/dashboard/top-performers.tsx` (líneas 123-158)

**Algoritmo:**
```typescript
const calculateSalespersonStats = (): SalespersonStats[] => {
  const salespersonMap = new Map<number, SalespersonStats>();

  // Agrupar facturas por vendedor
  invoices.forEach(invoice => {
    const salespersonId = invoice.user_id[0];
    const salespersonName = invoice.user_id[1];
    
    if (!salespersonMap.has(salespersonId)) {
      salespersonMap.set(salespersonId, {
        salespersonId,
        salespersonName,
        paidInvoices: 0,
        totalAmount: 0,
        unpaidInvoices: 0,
        unpaidAmount: 0
      });
    }

    const stats = salespersonMap.get(salespersonId)!;
    stats.totalAmount += invoice.amount_total;
    
    if (isPaid(invoice)) {
      stats.paidInvoices++;
    } else {
      stats.unpaidInvoices++;
      stats.unpaidAmount += invoice.amount_residual;
    }
  });

  // Filtrar, ordenar y limitar
  return Array.from(salespersonMap.values())
    .filter(salesperson => salesperson.paidInvoices > 0)
    .sort((a, b) => b.paidInvoices - a.paidInvoices)
    .slice(0, 10);
};
```

**Criterio de Ordenamiento:** Cantidad de facturas pagadas (descendente)

**Filtro:** Solo vendedores con al menos 1 factura pagada

**Límite:** Top 10

**Rango de Datos:** Se basa en el rango de fechas seleccionado por el usuario en el dashboard. No hay rango por defecto; el usuario debe seleccionar manualmente las fechas antes de consultar.

#### 3. Top 10 Clientes

Similar al algoritmo de vendedores, pero agrupa por `partner_id` en lugar de `user_id`.

---

## Informe de Pagos Diarios

### Descripción General

El informe de pagos diarios analiza los pagos registrados en Odoo, agrupándolos por día y proporcionando:

- Estadísticas diarias de ingresos
- Análisis por estado REP (Recibo Electrónico de Pago)
- Desglose por diario (journal)
- Tabla paginada de pagos individuales
- Gráficos de tendencias (línea o barras)

### Arquitectura del Sistema

#### 1. Backend - Endpoint Principal

**Ruta:** `POST /api/reports/daily-payments`

**Ubicación:** `server/routes.ts` (líneas 145-204)

**Parámetros de Entrada:**
```typescript
{
  dateFrom: string;                    // Formato: YYYY-MM-DD
  dateTo: string;                      // Formato: YYYY-MM-DD
  estadoRep?: 'pago_no_enviado' | 'pago_correcto';  // Opcional
}
```

**Respuesta:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    dailyData: PaymentData[];
    journalData: JournalData[];
    totals: {
      totalAmount: number;
      totalPayments: number;
      totalRepNoGenerado: number;
      totalRepGenerado: number;
      totalAmountNoGenerado: number;
      totalAmountGenerado: number;
    };
    filters: {
      dateFrom: string;
      dateTo: string;
      estadoRep?: string;
    };
  };
  timestamp: string;
}
```

#### 2. Servicio Odoo - Obtención de Pagos

**Método:** `OdooService.getDailyPayments()`

**Ubicación:** `server/lib/odooService.ts` (líneas 359-490)

**Proceso de Implementación:**

1. **Autenticación:**
   - Similar al sistema de facturación
   - Usa cookie jar local para mantener sesión

2. **Consulta a Odoo:**
   ```typescript
   model: 'account.payment'
   method: 'search_read'
   filters: [
     ['state', '=', 'posted'],        // Solo pagos publicados
     ['date', '>=', filters.dateFrom],
     ['date', '<=', filters.dateTo],
     ...(filters.estadoRep ? [['estado_pago', '=', filters.estadoRep]] : [])
   ]
   fields: [
     'id', 'name', 'date', 'amount', 'currency_id', 
     'partner_id', 'journal_id',
     'estado_pago', 'state', 'ref', 'payment_type',
     'amount_company_currency_signed'
   ]
   limit: 1000
   ```

#### 3. Servicio Odoo - Cálculo de Estadísticas

**Método:** `OdooService.getPaymentStatistics()`

**Ubicación:** `server/lib/odooService.ts` (líneas 495-594)

**Algoritmo de Agrupación:**

1. **Agrupación por Día:**
   ```typescript
   const dailyStats = payments.reduce((acc, payment) => {
     const date = payment.date;
     if (!acc[date]) {
       acc[date] = {
         date,
         totalAmount: 0,
         paymentCount: 0,
         repNoGenerado: 0,
         repGenerado: 0,
         amountNoGenerado: 0,
         amountGenerado: 0
       };
     }
     
     acc[date].totalAmount += payment.amount;
     acc[date].paymentCount += 1;
     
     if (payment.estado_pago === 'pago_no_enviado') {
       acc[date].repNoGenerado += 1;
       acc[date].amountNoGenerado += payment.amount;
     } else if (payment.estado_pago === 'pago_correcto') {
       acc[date].repGenerado += 1;
       acc[date].amountGenerado += payment.amount;
     }
     
     return acc;
   }, {});
   ```

2. **Agrupación por Diario (Journal):**
   - Similar a la agrupación por día
   - Agrupa por `journal_id` en lugar de fecha
   - Ordena por monto total (descendente)

3. **Cálculo de Totales:**
   ```typescript
   const totals = {
     totalAmount: dailyArray.reduce((sum, day) => sum + day.totalAmount, 0),
     totalPayments: dailyArray.reduce((sum, day) => sum + day.paymentCount, 0),
     totalRepNoGenerado: dailyArray.reduce((sum, day) => sum + day.repNoGenerado, 0),
     totalRepGenerado: dailyArray.reduce((sum, day) => sum + day.repGenerado, 0),
     totalAmountNoGenerado: dailyArray.reduce((sum, day) => sum + day.amountNoGenerado, 0),
     totalAmountGenerado: dailyArray.reduce((sum, day) => sum + day.amountGenerado, 0)
   };
   ```

#### 4. Frontend - Componente Principal

**Componente:** `PaymentChart`

**Ubicación:** `client/src/components/dashboard/payment-chart.tsx`

**Estados Principales:**
```typescript
const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
const [estadoRep, setEstadoRep] = useState<string>('all');
const [data, setData] = useState<PaymentStats | null>(null);
const [chartType, setChartType] = useState<'line' | 'bar'>('line');
```

**Valores por Defecto:**
- `dateFrom`: 30 días atrás desde hoy
- `dateTo`: Fecha actual
- `estadoRep`: 'all' (todos los estados)

**Flujo de Datos:**

1. Usuario selecciona rango de fechas y estado REP
2. `fetchPaymentData()` llama a `/api/reports/daily-payments`
3. Datos recibidos se procesan para gráficos:
   - Gráfico diario (línea o barras)
   - Gráfico por diario (barras)
   - Tarjetas de resumen
4. `fetchTableData()` carga tabla paginada de pagos individuales

### Estructura de Datos

#### PaymentData (Datos Diarios)
```typescript
interface PaymentData {
  date: string;                      // Fecha (YYYY-MM-DD)
  totalAmount: number;               // Monto total del día
  paymentCount: number;              // Cantidad de pagos
  repNoGenerado: number;             // Pagos sin REP generado
  repGenerado: number;               // Pagos con REP generado
  amountNoGenerado: number;          // Monto sin REP
  amountGenerado: number;            // Monto con REP
}
```

#### PaymentTableData (Pago Individual)
```typescript
interface PaymentTableData {
  id: number;
  name: string;                      // Número de pago
  date: string;                      // Fecha del pago
  amount: number;                    // Monto
  currency_id: [number, string];      // Moneda
  partner_id: [number, string];     // Cliente
  journal_id: [number, string];     // Diario
  estado_pago: string;               // Estado REP
  state: string;                     // Estado del pago
  ref: string;                       // Referencia
  payment_type: string;              // Tipo de pago
  amount_company_currency_signed: number;
}
```

### Estados REP

Los pagos pueden tener los siguientes estados REP:

- `pago_no_enviado`: REP no generado
- `pago_correcto`: REP generado correctamente
- `problemas_factura`: Problemas con el pago
- `solicitud_cancelar`: Cancelación en proceso
- `cancelar_rechazo`: Cancelación rechazada
- `factura_cancelada`: REP cancelado

---

## Integración con Odoo

### Autenticación

**Método:** `OdooService.ensureAuthenticated()`

**Ubicación:** `server/lib/odooService.ts` (líneas 98-168)

**Proceso:**

1. Verifica si existe sesión válida
2. Si no existe o expiró, autentica:
   ```typescript
   POST /web/session/authenticate
   {
     jsonrpc: '2.0',
     method: 'call',
     params: {
       db: 'nombre_base_datos',
       login: 'usuario@ejemplo.com',
       password: 'password_seguro'
     }
   }
   ```
3. Guarda cookies de sesión en `globalCookieJar`
4. Mantiene usuario actual en `currentUser`

**Gestión de Sesión:**
- Cookies se reutilizan entre llamadas
- Sesión se renueva automáticamente si expira
- Flag `isRenewingSession` evita bucles infinitos

### Modelos de Odoo Utilizados

#### 1. account.move (Facturas)
- **Campos principales:** `invoice_date`, `amount_total`, `amount_residual`, `state`, `user_id`, `partner_id`
- **Filtros comunes:** `move_type`, `invoice_date`, `state`

#### 2. account.payment (Pagos)
- **Campos principales:** `date`, `amount`, `estado_pago`, `journal_id`, `partner_id`
- **Filtros comunes:** `state`, `date`, `estado_pago`

### Formato de Consultas JSON-RPC

**Estructura General:**
```typescript
{
  jsonrpc: '2.0',
  method: 'call',
  params: {
    model: 'account.move',
    method: 'search_read',
    args: [filters],
    kwargs: {
      fields: [...],
      order: '...',
      limit: 100,
      offset: 0
    },
    context: {
      uid: user.uid,
      tz: 'America/Mexico_City',
      lang: 'es_MX'
    }
  },
  id: Math.floor(Math.random() * 1000000)
}
```

---

## APIs y Endpoints

### Endpoints Disponibles

#### 1. Autenticación

**POST** `/api/auth/login`
- Autentica usuario con Odoo
- Retorna información del usuario autenticado

**POST** `/api/auth/logout`
- Cierra sesión y limpia cookies

#### 2. Facturación

**POST** `/api/reports/invoices`
- Obtiene facturas con paginación
- Parámetros: `dateFrom`, `dateTo`, `state`, `page`, `pageSize`

#### 3. Pagos

**POST** `/api/reports/daily-payments`
- Obtiene estadísticas de pagos diarios
- Parámetros: `dateFrom`, `dateTo`, `estadoRep`

**POST** `/api/reports/payment-table`
- Obtiene tabla paginada de pagos individuales
- Parámetros: `dateFrom`, `dateTo`, `estadoRep`, `page`, `pageSize`

#### 4. Configuración

**GET** `/api/odoo-config`
- Retorna configuración actual de Odoo

**POST** `/api/test-odoo`
- Prueba conexión con Odoo

---

## Componentes Frontend

### Sistema de Facturación

#### InvoiceDashboard
- **Ruta:** `/dashboard`
- **Componentes hijos:**
  - `InvoiceComparison`: Comparación visual pagadas vs no pagadas
  - `TopPerformers`: Rankings de clientes y vendedores
  - Tabla de facturas con paginación

#### TopPerformers
- Muestra Top 10 Clientes y Top 10 Vendedores
- Gráficos de barras para Top 5
- Tablas con rankings y badges

### Informe de Pagos

#### PaymentChart
- **Ruta:** `/payment-report`
- Gráficos interactivos (línea/barras)
- Tarjetas de resumen
- Tabla paginada de pagos
- Filtros por fecha y estado REP

---

## Cálculos y Estadísticas

### Facturación

#### Estadísticas Generales
```typescript
totalInvoices = invoices.length
paidInvoices = invoices.filter(inv => inv.amount_residual === 0).length
unpaidInvoices = totalInvoices - paidInvoices
totalAmount = sum(invoices.amount_total)
paidAmount = sum(paidInvoices.amount_total)
unpaidAmount = totalAmount - paidAmount
```

#### Top Vendedores
- Agrupa por `user_id`
- Cuenta facturas pagadas por vendedor
- Ordena por cantidad de facturas pagadas (desc)
- Limita a 10

#### Top Clientes
- Agrupa por `partner_id`
- Similar algoritmo a vendedores

### Pagos

#### Estadísticas Diarias
- Agrupa pagos por fecha
- Suma montos por día
- Cuenta pagos por estado REP
- Calcula totales generales

#### Estadísticas por Diario
- Agrupa pagos por `journal_id`
- Similar a estadísticas diarias
- Ordena por monto total (desc)

---

## Configuración y Variables de Entorno

### Variables Requeridas

```env
# Odoo Configuration
ODOO_URL=https://fexs.mx
ODOO_DB=Productiva

# Database Configuration (Opcional - para acceso directo)
DB_HOST=98.80.84.181
DB_PORT=5432
DB_NAME=Productiva
DB_USER=odoo16
DB_PASSWORD=tu_password_seguro

# Test Credentials (solo para desarrollo)
TEST_USER=usuario_prueba@ejemplo.com
TEST_PASSWORD=password_prueba_seguro

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Ubicación de Configuración

- **Backend:** `server/lib/odooService.ts` (líneas 38-44)
- **Variables de entorno:** `.env` (raíz del proyecto)

---

## Consideraciones Técnicas

### Manejo de Errores

1. **Errores de Conexión:**
   - Timeout: Mensaje específico al usuario
   - ECONNREFUSED: Servidor fuera de línea
   - Invalid credentials: Credenciales incorrectas

2. **Errores de Odoo:**
   - Se capturan y retornan mensajes descriptivos
   - Logs detallados en consola del servidor

### Optimizaciones

1. **Paginación:**
   - Límite de 1000 registros para conteo total
   - Paginación en frontend para tablas grandes

2. **Caché de Sesión:**
   - Cookies reutilizadas entre llamadas
   - Renovación automática de sesión

3. **Consultas Optimizadas:**
   - Campos específicos solicitados
   - Filtros aplicados en Odoo
   - Ordenamiento en servidor

### Limitaciones

1. **Límite de Registros:**
   - Máximo 1000 registros por consulta de conteo
   - Paginación requerida para grandes volúmenes

2. **Sesión Global:**
   - Una sesión compartida para todas las consultas
   - Puede causar problemas en entornos multi-usuario

---

## Ejemplos de Uso

### Obtener Facturas del Mes Actual

```typescript
const response = await fetch('/api/reports/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dateFrom: '2025-01-01',
    dateTo: '2025-01-31',
    state: 'posted',
    page: 1,
    pageSize: 50
  })
});

const data = await response.json();
```

### Obtener Estadísticas de Pagos

```typescript
const response = await fetch('/api/reports/daily-payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dateFrom: '2025-01-01',
    dateTo: '2025-01-31',
    estadoRep: 'pago_no_enviado'
  })
});

const data = await response.json();
```

---

## Mantenimiento y Extensión

### Agregar Nuevos Filtros

1. **Backend:**
   - Agregar parámetro en endpoint
   - Actualizar filtros en `OdooService`
   - Validar entrada

2. **Frontend:**
   - Agregar control de filtro en UI
   - Actualizar estado del componente
   - Incluir en request

### Agregar Nuevas Estadísticas

1. **Backend:**
   - Calcular en `getPaymentStatistics()` o similar
   - Agregar a objeto de respuesta

2. **Frontend:**
   - Crear componente de visualización
   - Integrar en dashboard

---

## Conclusión

Este manual técnico proporciona una guía completa para entender, mantener y extender los sistemas de facturación e informe de pagos de VReportes. Para preguntas o mejoras, consultar el código fuente y la documentación de Odoo JSON-RPC API.

---

**Última actualización:** Enero 2025  
**Versión del documento:** 1.0.0

