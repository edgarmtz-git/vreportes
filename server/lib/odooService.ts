interface OdooUser {
  uid: number;
  name: string;
  login: string;
  email: string;
  groups_id: number[];
  partner_id: number;
  company_id: number;
  lang: string;
  tz: string;
}

interface OdooAuthResult {
  uid: number;
  is_system: boolean;
  is_admin: boolean;
  user_context: any;
  db: string;
  server_version: string;
  name: string;
  username: string;
  partner_display_name: string;
  company_id: number;
  partner_id: number;
  user_id: number[];
}

interface OdooResponse<T> {
  result: T;
  error?: {
    code: number;
    message: string;
    data: any;
  };
}

export class OdooService {
  private static readonly ODOO_URL = process.env.ODOO_URL || 'https://fexs.mx';
  private static readonly ODOO_DB = process.env.ODOO_DB || 'Productiva';
  private static readonly DB_HOST = process.env.DB_HOST || '98.80.84.181';
  private static readonly DB_PORT = parseInt(process.env.DB_PORT || '5432');
  private static readonly DB_NAME = process.env.DB_NAME || 'Productiva';
  private static readonly DB_USER = process.env.DB_USER || 'odoo16';
  private static readonly DB_PASSWORD = process.env.DB_PASSWORD || '';
  
  // Variables para mantener la sesión global
  private static sessionCookies: string[] = [];
  private static currentUser: OdooAuthResult | null = null;
  private static isRenewingSession = false; // Flag para evitar bucles infinitos
  private static globalCookieJar: string[] = []; // Cookie jar global para todo el dashboard

  /**
   * Método global para hacer requests con sesión compartida
   */
  private static async makeAuthenticatedRequest(url: string, body: any): Promise<Response> {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    // Usar cookies de sesión global si están disponibles
    if (this.globalCookieJar.length > 0) {
      headers['Cookie'] = this.globalCookieJar.join('; ');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Guardar cookies de la respuesta en el jar global
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.globalCookieJar.push(setCookie);
    }
    
    return response;
  }

  /**
   * Asegurar que tenemos una sesión válida
   */
  private static async ensureAuthenticated(): Promise<OdooAuthResult> {
    // Si ya tenemos un usuario y cookies, verificar si la sesión sigue siendo válida
    if (this.currentUser && this.sessionCookies.length > 0) {
      try {
        // Hacer una llamada de prueba para verificar la sesión
        const testResponse = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'res.users',
            method: 'read',
            args: [[this.currentUser.uid], ['id', 'name']],
            context: {
              'uid': this.currentUser.uid,
              'tz': 'America/Mexico_City',
              'lang': 'es_MX'
            }
          },
          id: Math.floor(Math.random() * 1000000),
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (!testData.error) {
            console.log(`✅ Sesión válida para usuario: ${this.currentUser.name}`);
            return this.currentUser;
          }
        }
      } catch (error) {
        console.log(`⚠️ Sesión expirada, renovando...`);
      }
    }
    
    // Si llegamos aquí, necesitamos autenticar
    const testUser = process.env.TEST_USER || 'soporte.tecnico@varcus.com.mx';
    const testPassword = process.env.TEST_PASSWORD || 'z14K7uN1';
    
    console.log(`🔐 Autenticando con usuario: ${testUser}`);
    
    // Limpiar cookies anteriores
    this.globalCookieJar = [];
    
    const authResponse = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/session/authenticate`, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: this.ODOO_DB,
        login: testUser,
        password: testPassword,
      },
      id: Math.floor(Math.random() * 1000000),
    });
    
    if (!authResponse.ok) {
      throw new Error(`HTTP error! status: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    if (authData.error) {
      throw new Error(`Odoo error: ${authData.error.message}`);
    }
    
    if (!authData.result || !authData.result.uid) {
      throw new Error('Invalid credentials or user not found');
    }
    
    this.currentUser = authData.result;
    console.log(`✅ Autenticación exitosa. UID: ${this.currentUser.uid}`);
    
    return this.currentUser;
  }

  /**
   * Autenticar usuario con Odoo
   */
  static async authenticate(login: string, password: string): Promise<OdooAuthResult> {
    try {
      const response = await fetch(`${this.ODOO_URL}/web/session/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            db: this.ODOO_DB,
            login: login,
            password: password,
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Verificar si hay error en la respuesta
      if (data.error) {
        throw new Error(`Odoo error: ${data.error.message}`);
      }

      // Verificar si el resultado es válido
      if (!data.result || !data.result.uid) {
        throw new Error('Invalid credentials or user not found');
      }

      return data.result;
    } catch (error) {
      console.error('Odoo authentication error:', error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario existe y está activo
   */
  static async verifyUser(uid: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.ODOO_URL}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'res.users',
            method: 'search_read',
            args: [[['id', '=', uid], ['active', '=', true]]],
            kwargs: {
              fields: ['id', 'name', 'login', 'email', 'active'],
              limit: 1,
            },
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OdooResponse<any[]> = await response.json();

      if (data.error) {
        throw new Error(`Odoo error: ${data.error.message}`);
      }

      return data.result && data.result.length > 0;
    } catch (error) {
      console.error('Odoo user verification error:', error);
      return false;
    }
  }

  /**
   * Obtener información completa del usuario
   */
  static async getUserInfo(uid: number): Promise<OdooUser | null> {
    try {
      const response = await fetch(`${this.ODOO_URL}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'res.users',
            method: 'read',
            args: [uid],
            kwargs: {
              fields: [
                'id', 'name', 'login', 'email', 'groups_id', 
                'partner_id', 'company_id', 'lang', 'tz', 'active'
              ],
            },
          },
          id: Math.floor(Math.random() * 1000000),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OdooResponse<OdooUser[]> = await response.json();

      if (data.error) {
        throw new Error(`Odoo error: ${data.error.message}`);
      }

      return data.result && data.result.length > 0 ? data.result[0] : null;
    } catch (error) {
      console.error('Odoo user info error:', error);
      return null;
    }
  }

  /**
   * Probar conexión básica con Odoo
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // Probar autenticación directamente con credenciales de prueba
      const testUser = process.env.TEST_USER || 'soporte.tecnico@varcus.com.mx';
      const testPassword = process.env.TEST_PASSWORD || 'z14K7uN1';

      console.log(`🧪 Probando conexión con Odoo: ${this.ODOO_URL}`);
      console.log(`📊 Base de datos: ${this.ODOO_DB}`);
      console.log(`👤 Usuario de prueba: ${testUser}`);

      console.log(`🔐 Iniciando autenticación...`);
      const authResult = await this.authenticate(testUser, testPassword);
      console.log(`✅ Autenticación exitosa: ${authResult.name}`);

      return {
        success: true,
        message: 'Conexión exitosa con Odoo',
        details: {
          odooUrl: this.ODOO_URL,
          odooDb: this.ODOO_DB,
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
      };
    } catch (error) {
      console.error('💥 Error en prueba de conexión:', error);
      return {
        success: false,
        message: `Error de conexión: ${error}`,
        details: {
          odooUrl: this.ODOO_URL,
          odooDb: this.ODOO_DB,
        },
      };
    }
  }

  /**
   * Obtener pagos diarios con filtros
   */
  static async getDailyPayments(filters: {
    dateFrom: string;
    dateTo: string;
    estadoRep?: 'pago_no_enviado' | 'pago_correcto';
  }) {
    try {
      console.log(`🔗 Conectando a Odoo: ${this.ODOO_URL}`);
      
      const testUser = process.env.TEST_USER || 'soporte.tecnico@varcus.com.mx';
      const testPassword = process.env.TEST_PASSWORD || 'z14K7uN1';
      
      // Crear un objeto para mantener cookies entre llamadas
      const cookieJar: string[] = [];
      
      // Función helper para hacer requests con cookies
      const makeRequest = async (url: string, body: any, useCookies = false) => {
        const headers: any = {
          'Content-Type': 'application/json',
        };
        
        if (useCookies && cookieJar.length > 0) {
          headers['Cookie'] = cookieJar.join('; ');
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        
        // Guardar cookies de la respuesta
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          cookieJar.push(setCookie);
        }
        
        return response;
      };
      
      // Primero autenticar
      console.log(`🔐 Autenticando con usuario: ${testUser}`);
      const authResponse = await makeRequest(`${this.ODOO_URL}/web/session/authenticate`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.ODOO_DB,
          login: testUser,
          password: testPassword,
        },
        id: Math.floor(Math.random() * 1000000),
      });
      
      if (!authResponse.ok) {
        throw new Error(`HTTP error! status: ${authResponse.status}`);
      }
      
      const authData = await authResponse.json();
      if (authData.error) {
        throw new Error(`Odoo error: ${authData.error.message}`);
      }
      
      if (!authData.result || !authData.result.uid) {
        throw new Error('Invalid credentials or user not found');
      }
      
      console.log(`✅ Autenticación exitosa. UID: ${authData.result.uid}`);
      
      // Ahora hacer la consulta usando las cookies de la sesión
      const queryResponse = await makeRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.payment',
          method: 'search_read',
          args: [
            [
              ['state', '=', 'posted'], // Solo pagos publicados
              ['date', '>=', filters.dateFrom],
              ['date', '<=', filters.dateTo],
              ...(filters.estadoRep ? [['estado_pago', '=', filters.estadoRep]] : [])
            ]
          ],
          kwargs: {
            fields: [
              'id', 'name', 'date', 'amount', 'currency_id', 
              'partner_id', 'journal_id',
              'estado_pago', 'state', 'ref', 'payment_type',
              'amount_company_currency_signed'
            ],
            order: 'date desc',
            limit: 1000
          },
          context: {
            'uid': authData.result.uid,
            'tz': 'America/Mexico_City',
            'lang': 'es_MX'
          }
        },
        id: Math.floor(Math.random() * 1000000),
      }, true); // Usar cookies en esta llamada
      
      if (!queryResponse.ok) {
        throw new Error(`HTTP error! status: ${queryResponse.status} - ${queryResponse.statusText}`);
      }
      
      const data: OdooResponse<any[]> = await queryResponse.json();
      
      if (data.error) {
        throw new Error(`Odoo error: ${data.error.message} (Code: ${data.error.code})`);
      }
      
      console.log(`✅ Datos obtenidos de Odoo: ${data.result?.length || 0} registros`);
      return data.result || [];
    } catch (error) {
      console.error('Odoo getDailyPayments error:', error);
      
      // Si es un error de conexión, proporcionar información más específica
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          throw new Error(`No se pudo conectar con el servidor Odoo en ${this.ODOO_URL}. Verifique la configuración de red.`);
        } else if (error.message.includes('ECONNREFUSED')) {
          throw new Error(`Conexión rechazada por el servidor Odoo. El servidor puede estar fuera de línea.`);
        } else if (error.message.includes('timeout')) {
          throw new Error(`Timeout al conectar con Odoo. El servidor puede estar sobrecargado.`);
        } else if (error.message.includes('Invalid credentials')) {
          throw new Error(`Credenciales inválidas. Verifique el usuario y contraseña de Odoo.`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Obtener estadísticas de pagos por día
   */
  static async getPaymentStatistics(filters: {
    dateFrom: string;
    dateTo: string;
    estadoRep?: 'pago_no_enviado' | 'pago_correcto';
  }) {
    try {
      const payments = await this.getDailyPayments(filters);
      
      // Agrupar por fecha y calcular estadísticas
      const dailyStats = payments.reduce((acc: any, payment: any) => {
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

      // Agrupar por diario (journal)
      const journalStats = payments.reduce((acc: any, payment: any) => {
        const journalId = payment.journal_id[0];
        const journalName = payment.journal_id[1];
        
        if (!acc[journalId]) {
          acc[journalId] = {
            id: journalId,
            name: journalName,
            totalAmount: 0,
            paymentCount: 0,
            repNoGenerado: 0,
            repGenerado: 0,
            amountNoGenerado: 0,
            amountGenerado: 0
          };
        }
        
        acc[journalId].totalAmount += payment.amount;
        acc[journalId].paymentCount += 1;
        
        if (payment.estado_pago === 'pago_no_enviado') {
          acc[journalId].repNoGenerado += 1;
          acc[journalId].amountNoGenerado += payment.amount;
        } else if (payment.estado_pago === 'pago_correcto') {
          acc[journalId].repGenerado += 1;
          acc[journalId].amountGenerado += payment.amount;
        }
        
        return acc;
      }, {});

      // Convertir a array y ordenar por fecha
      const dailyArray = Object.values(dailyStats).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Convertir journal stats a array y ordenar por monto
      const journalArray = Object.values(journalStats).sort((a: any, b: any) => 
        b.totalAmount - a.totalAmount
      );

      // Calcular totales generales
      const totals = {
        totalAmount: dailyArray.reduce((sum: number, day: any) => sum + day.totalAmount, 0),
        totalPayments: dailyArray.reduce((sum: number, day: any) => sum + day.paymentCount, 0),
        totalRepNoGenerado: dailyArray.reduce((sum: number, day: any) => sum + day.repNoGenerado, 0),
        totalRepGenerado: dailyArray.reduce((sum: number, day: any) => sum + day.repGenerado, 0),
        totalAmountNoGenerado: dailyArray.reduce((sum: number, day: any) => sum + day.amountNoGenerado, 0),
        totalAmountGenerado: dailyArray.reduce((sum: number, day: any) => sum + day.amountGenerado, 0)
      };

      return {
        dailyData: dailyArray,
        journalData: journalArray,
        totals,
        filters
      };
    } catch (error) {
      console.error('Odoo getPaymentStatistics error:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de pagos para tabla con paginación
   */
  static async getInvoiceData(filters: {
    dateFrom: string;
    dateTo: string;
    state?: 'draft' | 'posted' | 'cancel';
    page?: number;
    pageSize?: number;
  }) {
    try {
      console.log(`📄 Obteniendo datos de facturas - Página ${filters.page || 1}, Tamaño ${filters.pageSize || 10}`);
      
      // Usar el sistema de autenticación global
      const user = await this.ensureAuthenticated();
      
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const offset = (page - 1) * pageSize;
      
      // Construir filtros de búsqueda
      const searchFilters = [
        ['move_type', 'in', ['out_invoice', 'out_refund']], // Solo facturas de venta y notas de crédito
        ['invoice_date', '>=', filters.dateFrom],
        ['invoice_date', '<=', filters.dateTo],
        ...(filters.state ? [['state', '=', filters.state]] : [])
      ];
      
      console.log(`📄 Filtros de búsqueda:`, JSON.stringify(searchFilters, null, 2));
      
      // Obtener datos de facturas usando la sesión global
      const queryResponse = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.move',
          method: 'search_read',
          args: [searchFilters],
          kwargs: {
            fields: [
              'id', 'name', 'invoice_date', 'invoice_date_due', 'partner_id',
              'amount_total', 'amount_residual', 'amount_tax', 'currency_id',
              'state', 'move_type', 'ref', 'invoice_origin', 'invoice_payment_term_id',
              'user_id', 'team_id', 'company_id', 'create_date', 'write_date'
            ],
            order: 'invoice_date desc',
            limit: pageSize,
            offset: offset
          },
          context: {
            'uid': user.uid,
            'tz': 'America/Mexico_City',
            'lang': 'es_MX'
          }
        },
        id: Math.floor(Math.random() * 1000000),
      });
      
      if (!queryResponse.ok) {
        throw new Error(`HTTP error! status: ${queryResponse.status}`);
      }
      
      const queryData = await queryResponse.json();
      
      if (queryData.error) {
        throw new Error(`Odoo error: ${queryData.error.message}`);
      }
      
      const invoices = queryData.result || [];
      console.log(`✅ Datos de facturas obtenidos: ${invoices.length} registros`);
      
      // Para evitar problemas con search_count, vamos a usar una aproximación diferente
      // Obtener todos los registros sin paginación para contar, pero limitado a un número razonable
      const countResponse = await this.makeAuthenticatedRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.move',
          method: 'search_read',
          args: [searchFilters],
          kwargs: {
            fields: ['id'], // Solo necesitamos el ID para contar
            order: 'invoice_date desc',
            limit: 1000 // Límite razonable para contar
          },
          context: {
            'uid': user.uid,
            'tz': 'America/Mexico_City',
            'lang': 'es_MX'
          }
        },
        id: Math.floor(Math.random() * 1000000),
      });
      
      if (!countResponse.ok) {
        throw new Error(`HTTP error! status: ${countResponse.status}`);
      }
      
      const countData = await countResponse.json();
      
      if (countData.error) {
        throw new Error(`Odoo error: ${countData.error.message}`);
      }
      
      const totalRecords = countData.result?.length || 0;
      const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
      
      console.log(`✅ Facturas obtenidas: ${invoices.length} registros en página ${page} de ${totalPages}`);
      
      return {
        data: invoices,
        pagination: {
          page,
          pageSize,
          totalRecords,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo datos de facturas:', error);
      throw error;
    }
  }

  static async getPaymentTableData(filters: {
    dateFrom: string;
    dateTo: string;
    estadoRep?: 'pago_no_enviado' | 'pago_correcto';
    page?: number;
    pageSize?: number;
  }) {
    try {
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const offset = (page - 1) * pageSize;

      console.log(`📋 Obteniendo datos de tabla - Página ${page}, Tamaño ${pageSize}`);
      
      const testUser = process.env.TEST_USER || 'soporte.tecnico@varcus.com.mx';
      const testPassword = process.env.TEST_PASSWORD || 'z14K7uN1';
      
      const cookieJar: string[] = [];
      
      const makeRequest = async (url: string, body: any, useCookies = false) => {
        const headers: any = {
          'Content-Type': 'application/json',
        };
        
        if (useCookies && cookieJar.length > 0) {
          headers['Cookie'] = cookieJar.join('; ');
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          cookieJar.push(setCookie);
        }
        
        return response;
      };
      
      // Autenticar
      const authResponse = await makeRequest(`${this.ODOO_URL}/web/session/authenticate`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.ODOO_DB,
          login: testUser,
          password: testPassword,
        },
        id: Math.floor(Math.random() * 1000000),
      });
      
      if (!authResponse.ok) {
        throw new Error(`HTTP error! status: ${authResponse.status}`);
      }
      
      const authData = await authResponse.json();
      if (authData.error) {
        throw new Error(`Odoo error: ${authData.error.message}`);
      }
      
      if (!authData.result || !authData.result.uid) {
        throw new Error('Invalid credentials or user not found');
      }
      
      // Obtener datos paginados
      const queryResponse = await makeRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.payment',
          method: 'search_read',
          args: [
            [
              ['state', '=', 'posted'],
              ['date', '>=', filters.dateFrom],
              ['date', '<=', filters.dateTo],
              ...(filters.estadoRep ? [['estado_pago', '=', filters.estadoRep]] : [])
            ]
          ],
          kwargs: {
            fields: [
              'id', 'name', 'date', 'amount', 'currency_id', 
              'partner_id', 'journal_id',
              'estado_pago', 'state', 'ref', 'payment_type',
              'amount_company_currency_signed'
            ],
            order: 'date desc',
            limit: pageSize,
            offset: offset
          },
          context: {
            'uid': authData.result.uid,
            'tz': 'America/Mexico_City',
            'lang': 'es_MX'
          }
        },
        id: Math.floor(Math.random() * 1000000),
      }, true);
      
      if (!queryResponse.ok) {
        throw new Error(`HTTP error! status: ${queryResponse.status}`);
      }
      
      const data: OdooResponse<any[]> = await queryResponse.json();
      
      if (data.error) {
        throw new Error(`Odoo error: ${data.error.message}`);
      }
      
      // Obtener el total de registros para la paginación
      const countResponse = await makeRequest(`${this.ODOO_URL}/web/dataset/call_kw`, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.payment',
          method: 'search_count',
          args: [
            [
              ['state', '=', 'posted'],
              ['date', '>=', filters.dateFrom],
              ['date', '<=', filters.dateTo],
              ...(filters.estadoRep ? [['estado_pago', '=', filters.estadoRep]] : [])
            ]
          ],
          context: {
            'uid': authData.result.uid,
            'tz': 'America/Mexico_City',
            'lang': 'es_MX'
          }
        },
        id: Math.floor(Math.random() * 1000000),
      }, true);
      
      const countData: OdooResponse<number> = await countResponse.json();
      const totalRecords = countData.result || 0;
      
      console.log(`✅ Datos de tabla obtenidos: ${data.result?.length || 0} registros de ${totalRecords} totales`);
      
      const totalPages = Math.ceil(totalRecords / pageSize);
      
      return {
        data: data.result || [],
        pagination: {
          page,
          pageSize,
          totalRecords,
          totalPages: totalPages || 1,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Odoo getPaymentTableData error:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración actual
   */
  static getConfig() {
    return {
      odooUrl: this.ODOO_URL,
      odooDb: this.ODOO_DB,
      dbHost: this.DB_HOST,
      dbPort: this.DB_PORT,
      dbName: this.DB_NAME,
      dbUser: this.DB_USER,
      hasDbPassword: !!this.DB_PASSWORD,
    };
  }
}
