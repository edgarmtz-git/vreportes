import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react";

interface InvoiceData {
  id: number;
  name: string;
  invoice_date: string;
  invoice_date_due: string;
  partner_id: [number, string];
  amount_total: number;
  amount_residual: number;
  amount_tax: number;
  currency_id: [number, string];
  state: string;
  move_type: string;
  ref: string;
  invoice_origin: string;
  invoice_payment_term_id: [number, string];
  user_id: [number, string];
  team_id: [number, string];
  company_id: [number, string];
  create_date: string;
  write_date: string;
}

interface InvoiceComparisonProps {
  invoices: InvoiceData[];
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export function InvoiceComparison({ 
  invoices, 
  totalAmount, 
  paidAmount, 
  unpaidAmount 
}: InvoiceComparisonProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isPaid = (invoice: InvoiceData) => {
    return invoice.amount_residual === 0;
  };

  const getMoveTypeLabel = (moveType: string) => {
    switch (moveType) {
      case 'out_invoice': return 'Factura';
      case 'out_refund': return 'Nota de Crédito';
      default: return moveType;
    }
  };

  // Separar facturas pagadas y no pagadas
  const paidInvoices = invoices.filter(isPaid);
  const unpaidInvoices = invoices.filter(invoice => !isPaid(invoice));

  // Datos para el gráfico de pie
  const pieData = [
    {
      name: 'Facturas Pagadas',
      value: paidAmount,
      count: paidInvoices.length,
      color: '#10b981'
    },
    {
      name: 'Facturas Pendientes',
      value: unpaidAmount,
      count: unpaidInvoices.length,
      color: '#f59e0b'
    }
  ];

  // Datos para el gráfico de barras
  const barData = [
    {
      category: 'Pagadas',
      amount: paidAmount,
      count: paidInvoices.length,
      color: '#10b981'
    },
    {
      category: 'Pendientes',
      amount: unpaidAmount,
      count: unpaidInvoices.length,
      color: '#f59e0b'
    }
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tabla Comparativa */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comparación de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Pagadas</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(paidAmount)}
                </div>
                <div className="text-sm text-green-700">
                  {paidInvoices.length} facturas
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Pendientes</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(unpaidAmount)}
                </div>
                <div className="text-sm text-orange-700">
                  {unpaidInvoices.length} facturas
                </div>
              </div>
            </div>

            {/* Tabla de facturas pagadas */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Facturas Pagadas ({paidInvoices.length})
              </h4>
              <div className="rounded-md border max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidInvoices.slice(0, 5).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-sm">
                          {formatDate(invoice.invoice_date)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <a
                            href={`https://fexs.mx/web#id=${invoice.id}&model=account.move&view_type=form`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {invoice.name}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm">
                          {invoice.partner_id[1]}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(invoice.amount_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {paidInvoices.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Mostrando 5 de {paidInvoices.length} facturas pagadas
                </p>
              )}
            </div>

            {/* Tabla de facturas pendientes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-orange-600" />
                Facturas Pendientes ({unpaidInvoices.length})
              </h4>
              <div className="rounded-md border max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidInvoices.slice(0, 5).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-sm">
                          {formatDate(invoice.invoice_date)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <a
                            href={`https://fexs.mx/web#id=${invoice.id}&model=account.move&view_type=form`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {invoice.name}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm">
                          {invoice.partner_id[1]}
                        </TableCell>
                        <TableCell className="font-semibold text-orange-600">
                          {formatCurrency(invoice.amount_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {unpaidInvoices.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  Mostrando 5 de {unpaidInvoices.length} facturas pendientes
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Análisis Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gráfico de Pie */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Distribución por Monto</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Comparación por Monto</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                    />
                    <Bar dataKey="amount" fill="#8884d8">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Porcentaje Pagado</div>
                  <div className="font-semibold text-green-600">
                    {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Porcentaje Pendiente</div>
                  <div className="font-semibold text-orange-600">
                    {totalAmount > 0 ? Math.round((unpaidAmount / totalAmount) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
