import { PaymentChart } from '@/components/dashboard/payment-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function PaymentReport() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="space-y-6">

      {/* Información del informe */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Descripción del Informe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">¿Qué muestra este informe?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Ingresos diarios de pagos en estado "Publicado"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Pagos con REP generado correctamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <span>Pagos con REP pendiente de generación</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>Tendencias de ingresos por período</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Filtros disponibles</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Rango de fechas:</strong> Selecciona el período a analizar</li>
                <li>• <strong>Estado REP:</strong> Filtra por REP generado o no generado</li>
                <li>• <strong>Vista de gráfica:</strong> Línea o barras para mejor visualización</li>
                <li>• <strong>Datos en tiempo real:</strong> Conectado directamente con Odoo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente principal del informe */}
      <PaymentChart />
      </div>
    </div>
  );
}
