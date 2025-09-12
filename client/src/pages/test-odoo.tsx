import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Database,
  User,
  Key,
  Settings,
  Globe,
  Server
} from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

interface OdooConfig {
  odooUrl: string;
  odooDb: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  hasDbPassword: boolean;
}

export default function TestOdoo() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [config, setConfig] = useState<OdooConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    login: 'soporte.tecnico@varcus.com.mx',
    password: 'z14K7uN1'
  });
  const [authResult, setAuthResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-odoo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: TestResult = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error de conexión: ${error}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfig = async () => {
    try {
      const response = await fetch('/api/odoo-config');
      const result = await response.json();
      if (result.success) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setAuthResult(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();
      setAuthResult(result);
    } catch (error) {
      setAuthResult({
        success: false,
        message: `Error de autenticación: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔗 Prueba de Conexión Odoo</h1>
        <p className="text-gray-600">Verifica la conectividad y autenticación con la API de Odoo</p>
      </div>

      {/* Configuración */}
      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Ver configuración de Odoo</p>
            <Button onClick={getConfig} variant="outline" size="sm">
              <Database className="w-4 h-4 mr-2" />
              Obtener Config
            </Button>
          </div>
          
          {config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">URL de Odoo</p>
                  <p className="text-sm font-medium">{config.odooUrl}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Base de Datos</p>
                  <p className="text-sm font-medium">{config.odooDb}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Server className="w-4 h-4 mr-2 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Host DB</p>
                  <p className="text-sm font-medium">{config.dbHost}:{config.dbPort}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Usuario DB</p>
                  <p className="text-sm font-medium">{config.dbUser}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prueba de Conexión */}
      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2" />
            Prueba de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Probar conectividad básica con Odoo</p>
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Probar Conexión
            </Button>
          </div>

          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  <div className="font-medium mb-2">{testResult.message}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(testResult.timestamp).toLocaleString()}
                  </div>
                  {testResult.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                        Ver detalles técnicos
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Prueba de Autenticación */}
      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Prueba de Autenticación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="login">Usuario/Email</Label>
              <Input
                id="login"
                value={loginForm.login}
                onChange={(e) => setLoginForm({...loginForm, login: e.target.value})}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="contraseña"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">Probar autenticación con credenciales</p>
            <Button 
              onClick={testAuth} 
              disabled={loading || !loginForm.login || !loginForm.password}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              Probar Autenticación
            </Button>
          </div>

          {authResult && (
            <Alert className={authResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center">
                {authResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  <div className="font-medium mb-2">{authResult.message}</div>
                  {authResult.success && authResult.data && (
                    <div className="mt-2">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">{authResult.data.name}</span>
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                          ID: {authResult.data.uid}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Email: {authResult.data.username}</p>
                        <p>Login: {authResult.data.username}</p>
                        <p>Empresa: {authResult.data.company_id}</p>
                        <p>Partner: {authResult.data.partner_id}</p>
                        <p>Versión: {authResult.data.server_version}</p>
                        <p>Admin: {authResult.data.is_admin ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  )}
                  {!authResult.success && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                        Ver error completo
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(authResult, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Información de Ayuda */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>📚 Información de Ayuda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Variables de Entorno Requeridas:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li><code>ODOO_URL</code> - URL de la instancia de Odoo</li>
                <li><code>ODOO_DB</code> - Nombre de la base de datos</li>
                <li><code>TEST_USER</code> - Usuario de prueba (opcional)</li>
                <li><code>TEST_PASSWORD</code> - Contraseña de prueba (opcional)</li>
              </ul>
            </div>
            <div>
              <strong>Endpoints Disponibles:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li><code>POST /api/test-odoo</code> - Prueba de conexión</li>
                <li><code>GET /api/odoo-config</code> - Configuración actual</li>
                <li><code>POST /api/auth/login</code> - Autenticación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
