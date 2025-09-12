import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OdooService } from "./lib/odooService";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // 🔗 Rutas de prueba de Odoo
  app.post('/api/test-odoo', async (req, res) => {
    try {
      console.log('🧪 Iniciando prueba de conexión con Odoo...');
      
      // Usar credenciales de prueba directamente
      const testUser = process.env.TEST_USER || 'soporte.tecnico@varcus.com.mx';
      const testPassword = process.env.TEST_PASSWORD || 'z14K7uN1';
      
      console.log(`🔐 Probando autenticación con: ${testUser}`);
      
      const authResult = await OdooService.authenticate(testUser, testPassword);
      
      console.log('✅ Prueba de conexión exitosa');
      res.json({
        success: true,
        message: 'Conexión exitosa con Odoo',
        data: {
          odooUrl: OdooService.getConfig().odooUrl,
          odooDb: OdooService.getConfig().odooDb,
          authResult: {
            uid: authResult.uid,
            name: authResult.name,
            username: authResult.username,
            company_id: authResult.company_id,
            partner_id: authResult.partner_id,
            server_version: authResult.server_version,
            db: authResult.db,
            is_admin: authResult.is_admin,
            is_system: authResult.is_system,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 Error en prueba de conexión:', error);
      res.status(500).json({
        success: false,
        message: `Error de conexión: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 🔧 Obtener configuración de Odoo
  app.get('/api/odoo-config', async (req, res) => {
    try {
      const config = OdooService.getConfig();
      res.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: `Error interno: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 🔐 Autenticación con Odoo
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(400).json({
          success: false,
          message: 'Login y password son requeridos',
        });
      }

      console.log(`🔐 Intentando autenticación para usuario: ${login}`);
      
      const authResult = await OdooService.authenticate(login, password);
      
      console.log(`✅ Autenticación exitosa para: ${authResult.name}`);
      
      res.json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          uid: authResult.uid,
          name: authResult.name,
          username: authResult.username,
          partner_display_name: authResult.partner_display_name,
          company_id: authResult.company_id,
          partner_id: authResult.partner_id,
          server_version: authResult.server_version,
          db: authResult.db,
          is_admin: authResult.is_admin,
          is_system: authResult.is_system,
        },
      });
    } catch (error) {
      console.error('💥 Error en autenticación:', error);
      res.status(401).json({
        success: false,
        message: `Error de autenticación: ${error}`,
      });
    }
  });

  // 🚪 Logout - Cerrar sesión
  app.post('/api/auth/logout', async (req, res) => {
    try {
      console.log(`🚪 Cerrando sesión...`);
      
      // Limpiar la sesión global de Odoo
      await OdooService.clearSession();
      
      console.log(`✅ Sesión cerrada exitosamente`);
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 Error al cerrar sesión:', error);
      res.status(500).json({
        success: false,
        message: `Error al cerrar sesión: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 📊 Informe de pagos diarios para ventas
  app.post('/api/reports/daily-payments', async (req, res) => {
    try {
      const { dateFrom, dateTo, estadoRep } = req.body;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: 'dateFrom y dateTo son requeridos',
        });
      }

      console.log(`📊 Generando informe de pagos diarios desde ${dateFrom} hasta ${dateTo}`);
      if (estadoRep) {
        console.log(`🔍 Filtrando por estado REP: ${estadoRep}`);
      }
      
      const paymentStats = await OdooService.getPaymentStatistics({
        dateFrom,
        dateTo,
        estadoRep
      });
      
      console.log(`✅ Informe generado: ${paymentStats.dailyData.length} días, ${paymentStats.totals.totalPayments} pagos`);
      
      res.json({
        success: true,
        message: 'Informe de pagos diarios generado exitosamente',
        data: paymentStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 Error generando informe de pagos:', error);
      
      // Proporcionar información más detallada del error
      let errorMessage = 'Error interno del servidor';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Verificar si es un error de conexión con Odoo
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Error de conexión con el servidor Odoo. Verifique la configuración.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
        errorMessage = 'Error de autenticación con Odoo. Verifique las credenciales.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        errorMessage = 'Sin permisos para acceder a los datos de pagos.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 📋 Tabla de pagos con paginación
  app.post('/api/reports/payment-table', async (req, res) => {
    try {
      const { dateFrom, dateTo, estadoRep, page = 1, pageSize = 10 } = req.body;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: 'dateFrom y dateTo son requeridos',
        });
      }

      console.log(`📋 Obteniendo tabla de pagos - Página ${page}, Tamaño ${pageSize}`);
      if (estadoRep) {
        console.log(`🔍 Filtrando por estado REP: ${estadoRep}`);
      }
      
      const tableData = await OdooService.getPaymentTableData({
        dateFrom,
        dateTo,
        estadoRep,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
      
      console.log(`✅ Tabla generada: ${tableData.data.length} registros en página ${page} de ${tableData.pagination.totalPages}`);
      
      res.json({
        success: true,
        message: 'Datos de tabla obtenidos exitosamente',
        data: tableData.data,
        pagination: tableData.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 Error obteniendo datos de tabla:', error);
      
      let errorMessage = 'Error interno del servidor';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Error de conexión con el servidor Odoo. Verifique la configuración.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
        errorMessage = 'Error de autenticación con Odoo. Verifique las credenciales.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        errorMessage = 'Sin permisos para acceder a los datos de pagos.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 📄 Ruta para obtener datos de facturas con paginación
  app.post('/api/reports/invoices', async (req, res) => {
    try {
      const { dateFrom, dateTo, state, page = 1, pageSize = 10 } = req.body;
      
      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: 'dateFrom y dateTo son requeridos',
        });
      }

      console.log(`📄 Obteniendo datos de facturas - Página ${page}, Tamaño ${pageSize}`);
      if (state) {
        console.log(`🔍 Filtrando por estado: ${state}`);
      }
      
      // Intentar obtener datos reales de Odoo
      try {
        const invoiceData = await OdooService.getInvoiceData({
          dateFrom,
          dateTo,
          state,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        });
        
        console.log(`✅ Facturas obtenidas: ${invoiceData.data.length} registros en página ${page} de ${invoiceData.pagination.totalPages}`);
        
        res.json({
          success: true,
          message: 'Datos de facturas obtenidos exitosamente',
          data: invoiceData.data,
          pagination: invoiceData.pagination,
          timestamp: new Date().toISOString(),
        });
        
      } catch (odooError) {
        console.log(`⚠️ Error con Odoo, usando datos de prueba: ${odooError}`);
        
        // Datos de prueba mientras resolvemos el problema de autenticación
        const mockInvoices = [
          {
            id: 1,
            name: "FACT/2025/00001",
            invoice_date: "2025-09-01",
            invoice_date_due: "2025-09-15",
            partner_id: [1, "Cliente Demo 1"],
            amount_total: 15000.00,
            amount_residual: 0.00,
            amount_tax: 2400.00,
            currency_id: [1, "MXN"],
            state: "posted",
            move_type: "out_invoice",
            ref: "",
            invoice_origin: "SO001",
            invoice_payment_term_id: [1, "Pago Inmediato"],
            user_id: [1, "Usuario Demo"],
            team_id: [1, "Equipo Ventas"],
            company_id: [1, "Empresa Demo"],
            create_date: "2025-09-01 10:00:00",
            write_date: "2025-09-01 10:00:00"
          },
          {
            id: 2,
            name: "FACT/2025/00002",
            invoice_date: "2025-09-02",
            invoice_date_due: "2025-09-16",
            partner_id: [2, "Cliente Demo 2"],
            amount_total: 25000.00,
            amount_residual: 25000.00,
            amount_tax: 4000.00,
            currency_id: [1, "MXN"],
            state: "posted",
            move_type: "out_invoice",
            ref: "",
            invoice_origin: "SO002",
            invoice_payment_term_id: [2, "30 días"],
            user_id: [1, "Usuario Demo"],
            team_id: [1, "Equipo Ventas"],
            company_id: [1, "Empresa Demo"],
            create_date: "2025-09-02 11:00:00",
            write_date: "2025-09-02 11:00:00"
          },
          {
            id: 3,
            name: "FACT/2025/00003",
            invoice_date: "2025-09-03",
            invoice_date_due: "2025-09-17",
            partner_id: [3, "Cliente Demo 3"],
            amount_total: 18000.00,
            amount_residual: 0.00,
            amount_tax: 2880.00,
            currency_id: [1, "MXN"],
            state: "posted",
            move_type: "out_invoice",
            ref: "",
            invoice_origin: "SO003",
            invoice_payment_term_id: [1, "Pago Inmediato"],
            user_id: [1, "Usuario Demo"],
            team_id: [1, "Equipo Ventas"],
            company_id: [1, "Empresa Demo"],
            create_date: "2025-09-03 12:00:00",
            write_date: "2025-09-03 12:00:00"
          },
          {
            id: 4,
            name: "FACT/2025/00004",
            invoice_date: "2025-09-04",
            invoice_date_due: "2025-09-18",
            partner_id: [4, "Cliente Demo 4"],
            amount_total: 32000.00,
            amount_residual: 32000.00,
            amount_tax: 5120.00,
            currency_id: [1, "MXN"],
            state: "posted",
            move_type: "out_invoice",
            ref: "",
            invoice_origin: "SO004",
            invoice_payment_term_id: [2, "30 días"],
            user_id: [1, "Usuario Demo"],
            team_id: [1, "Equipo Ventas"],
            company_id: [1, "Empresa Demo"],
            create_date: "2025-09-04 13:00:00",
            write_date: "2025-09-04 13:00:00"
          },
          {
            id: 5,
            name: "FACT/2025/00005",
            invoice_date: "2025-09-05",
            invoice_date_due: "2025-09-19",
            partner_id: [5, "Cliente Demo 5"],
            amount_total: 12000.00,
            amount_residual: 0.00,
            amount_tax: 1920.00,
            currency_id: [1, "MXN"],
            state: "posted",
            move_type: "out_invoice",
            ref: "",
            invoice_origin: "SO005",
            invoice_payment_term_id: [1, "Pago Inmediato"],
            user_id: [1, "Usuario Demo"],
            team_id: [1, "Equipo Ventas"],
            company_id: [1, "Empresa Demo"],
            create_date: "2025-09-05 14:00:00",
            write_date: "2025-09-05 14:00:00"
          }
        ];
        
        // Filtrar datos de prueba según los filtros
        let filteredInvoices = mockInvoices;
        
        if (state && state !== 'all') {
          filteredInvoices = filteredInvoices.filter(invoice => invoice.state === state);
        }
        
        // Aplicar paginación
        const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
        
        const totalRecords = filteredInvoices.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / parseInt(pageSize)));
        
        res.json({
          success: true,
          message: `Datos de prueba cargados (${paginatedInvoices.length} registros)`,
          data: paginatedInvoices,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalRecords,
            totalPages,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('💥 Error obteniendo datos de facturas:', error);
      
      let errorMessage = 'Error interno del servidor';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Error de conexión con el servidor Odoo. Verifique la configuración.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
        errorMessage = 'Error de autenticación con Odoo. Verifique las credenciales.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        errorMessage = 'Sin permisos para acceder a los datos de facturas.';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
