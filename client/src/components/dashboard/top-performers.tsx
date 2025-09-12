import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Trophy, 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp,
  Award,
  Star
} from "lucide-react";

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

interface TopPerformersProps {
  invoices: InvoiceData[];
}

interface ClientStats {
  clientId: number;
  clientName: string;
  paidInvoices: number;
  totalAmount: number;
  unpaidInvoices: number;
  unpaidAmount: number;
}

interface SalespersonStats {
  salespersonId: number;
  salespersonName: string;
  paidInvoices: number;
  totalAmount: number;
  unpaidInvoices: number;
  unpaidAmount: number;
}

export function TopPerformers({ invoices }: TopPerformersProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isPaid = (invoice: InvoiceData) => {
    return invoice.amount_residual === 0;
  };

  // Calcular estadísticas por cliente
  const calculateClientStats = (): ClientStats[] => {
    const clientMap = new Map<number, ClientStats>();

    invoices.forEach(invoice => {
      const clientId = invoice.partner_id[0];
      const clientName = invoice.partner_id[1];
      
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          clientId,
          clientName,
          paidInvoices: 0,
          totalAmount: 0,
          unpaidInvoices: 0,
          unpaidAmount: 0
        });
      }

      const stats = clientMap.get(clientId)!;
      stats.totalAmount += invoice.amount_total;
      
      if (isPaid(invoice)) {
        stats.paidInvoices++;
      } else {
        stats.unpaidInvoices++;
        stats.unpaidAmount += invoice.amount_residual;
      }
    });

    const allClients = Array.from(clientMap.values());
    
    return allClients
      .filter(client => client.paidInvoices > 0)
      .sort((a, b) => b.paidInvoices - a.paidInvoices)
      .slice(0, 10);
  };

  // Calcular estadísticas por vendedor
  const calculateSalespersonStats = (): SalespersonStats[] => {
    const salespersonMap = new Map<number, SalespersonStats>();

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

    const allSalespeople = Array.from(salespersonMap.values());
    
    return allSalespeople
      .filter(salesperson => salesperson.paidInvoices > 0)
      .sort((a, b) => b.paidInvoices - a.paidInvoices)
      .slice(0, 10);
  };

  const topClients = calculateClientStats();
  const topSalespeople = calculateSalespersonStats();

  // Datos para gráficos
  const clientChartData = topClients.slice(0, 5).map((client, index) => ({
    name: client.clientName.length > 15 ? client.clientName.substring(0, 15) + '...' : client.clientName,
    fullName: client.clientName,
    paidInvoices: client.paidInvoices,
    totalAmount: client.totalAmount,
    rank: index + 1
  }));

  const salespersonChartData = topSalespeople.slice(0, 5).map((salesperson, index) => ({
    name: salesperson.salespersonName.length > 15 ? salesperson.salespersonName.substring(0, 15) + '...' : salesperson.salespersonName,
    fullName: salesperson.salespersonName,
    paidInvoices: salesperson.paidInvoices,
    totalAmount: salesperson.totalAmount,
    rank: index + 1
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Award className="w-4 h-4 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800";
      case 2: return "bg-gray-100 text-gray-800";
      case 3: return "bg-amber-100 text-amber-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 10 Clientes */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Top 10 Clientes - Facturas Pagadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabla de Clientes */}
            <div>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Pagadas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((client, index) => (
                      <TableRow key={client.clientId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <Badge className={getRankBadgeColor(index + 1)}>
                              #{index + 1}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.clientName}</div>
                          <div className="text-xs text-gray-500">
                            {client.unpaidInvoices > 0 && (
                              <span className="text-orange-600">
                                {client.unpaidInvoices} pendientes
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">
                            {client.paidInvoices}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(client.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Gráfico de Clientes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Top 5 Clientes</h4>
              <div className="h-80">
                {clientChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          `${value} facturas`,
                          'Facturas Pagadas'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return `Cliente: ${payload[0].payload.fullName}`;
                          }
                          return label;
                        }}
                      />
                      <Bar dataKey="paidInvoices" fill="#10b981" name="Facturas Pagadas" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay datos de clientes con facturas pagadas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Vendedores */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Top 10 Vendedores - Facturas Pagadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabla de Vendedores */}
            <div>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-center">Pagadas</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSalespeople.map((salesperson, index) => (
                      <TableRow key={salesperson.salespersonId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <Badge className={getRankBadgeColor(index + 1)}>
                              #{index + 1}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{salesperson.salespersonName}</div>
                          <div className="text-xs text-gray-500">
                            {salesperson.unpaidInvoices > 0 && (
                              <span className="text-orange-600">
                                {salesperson.unpaidInvoices} pendientes
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800">
                            {salesperson.paidInvoices}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(salesperson.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Gráfico de Vendedores */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Top 5 Vendedores</h4>
              <div className="h-80">
                {salespersonChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salespersonChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          `${value} facturas`,
                          'Facturas Pagadas'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return `Vendedor: ${payload[0].payload.fullName}`;
                          }
                          return label;
                        }}
                      />
                      <Bar dataKey="paidInvoices" fill="#8b5cf6" name="Facturas Pagadas" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay datos de vendedores con facturas pagadas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Rendimiento */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Resumen de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {topClients.length > 0 ? formatCurrency(topClients[0].totalAmount) : '$0'}
              </div>
              <div className="text-sm text-blue-700">Mejor Cliente</div>
              <div className="text-xs text-blue-600">
                {topClients.length > 0 ? topClients[0].clientName : 'N/A'}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <UserCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {topSalespeople.length > 0 ? topSalespeople[0].paidInvoices : 0}
              </div>
              <div className="text-sm text-purple-700">Mejor Vendedor</div>
              <div className="text-xs text-purple-600">
                {topSalespeople.length > 0 ? topSalespeople[0].salespersonName : 'N/A'}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {topClients.length + topSalespeople.length}
              </div>
              <div className="text-sm text-green-700">Total Activos</div>
              <div className="text-xs text-green-600">
                {topClients.length} clientes, {topSalespeople.length} vendedores
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
