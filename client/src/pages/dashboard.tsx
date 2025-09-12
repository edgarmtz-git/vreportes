import InvoiceDashboard from "@/components/dashboard/invoice-dashboard";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      {/* Información del dashboard */}
      <Card className="border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Facturación
          </h2>
          <p className="text-gray-600">
            Visualiza el estado de tus facturas, pagos pendientes y estadísticas de ventas. 
            Utiliza los filtros de fecha para analizar períodos específicos y obtener insights 
            sobre el comportamiento de tus clientes y el flujo de efectivo.
          </p>
        </div>
      </Card>

      {/* Componente principal del dashboard */}
      <InvoiceDashboard />
    </div>
  );
}
