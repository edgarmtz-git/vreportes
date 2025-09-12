import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, TrendingUp, DollarSign, FileText, AlertCircle, BookOpen, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentData {
  date: string;
  totalAmount: number;
  paymentCount: number;
  repNoGenerado: number;
  repGenerado: number;
  amountNoGenerado: number;
  amountGenerado: number;
}

interface JournalData {
  id: number;
  name: string;
  totalAmount: number;
  paymentCount: number;
  repNoGenerado: number;
  repGenerado: number;
  amountNoGenerado: number;
  amountGenerado: number;
}

interface PaymentStats {
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
}

interface PaymentTableData {
  id: number;
  name: string;
  date: string;
  amount: number;
  currency_id: [number, string];
  partner_id: [number, string];
  journal_id: [number, string];
  estado_pago: string;
  state: string;
  ref: string;
  payment_type: string;
  amount_company_currency_signed: number;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaymentChartProps {
  onDataLoad?: (data: PaymentStats) => void;
}

export function PaymentChart({ onDataLoad }: PaymentChartProps) {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [estadoRep, setEstadoRep] = useState<string>('all');
  const [data, setData] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // Estados para la tabla
  const [tableData, setTableData] = useState<PaymentTableData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPaymentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reports/daily-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          estadoRep: estadoRep === 'all' ? undefined : estadoRep,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        onDataLoad?.(result.data);
        // Cargar también los datos de la tabla
        await fetchTableData();
      } else {
        setError(result.message || 'Error al cargar los datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (page = currentPage, size = pageSize) => {
    setIsLoadingTable(true);
    
    try {
      const response = await fetch('/api/reports/payment-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          estadoRep: estadoRep === 'all' ? undefined : estadoRep,
          page,
          pageSize: size,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTableData(result.data);
        setPagination(result.pagination);
        setCurrentPage(page);
        setPageSize(size);
      } else {
        setError(result.message || 'Error al cargar los datos de la tabla');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoadingTable(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM', { locale: es });
  };

  const formatTableDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getEstadoRepLabel = (estado: string) => {
    switch (estado) {
      case 'pago_no_enviado':
        return 'REP No Generado';
      case 'pago_correcto':
        return 'REP Generado';
      case 'problemas_factura':
        return 'Problemas con el pago';
      case 'solicitud_cancelar':
        return 'Cancelación en proceso';
      case 'cancelar_rechazo':
        return 'Cancelación rechazada';
      case 'factura_cancelada':
        return 'REP cancelado';
      default:
        return estado;
    }
  };

  const getEstadoRepColor = (estado: string) => {
    switch (estado) {
      case 'pago_no_enviado':
        return 'text-orange-600 bg-orange-100';
      case 'pago_correcto':
        return 'text-green-600 bg-green-100';
      case 'problemas_factura':
        return 'text-red-600 bg-red-100';
      case 'solicitud_cancelar':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelar_rechazo':
        return 'text-red-600 bg-red-100';
      case 'factura_cancelada':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchTableData(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchTableData(1, newSize);
  };

  const chartData = data?.dailyData.map(item => ({
    ...item,
    date: formatDate(item.date),
    dateValue: item.date,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros del Informe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estadoRep">Estado REP</Label>
              <Select value={estadoRep} onValueChange={setEstadoRep} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pago_no_enviado">REP No Generado</SelectItem>
                  <SelectItem value="pago_correcto">REP Generado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchPaymentData} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generar Informe
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.totals.totalAmount)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totals.totalPayments}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">REP No Generado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totals.totalRepNoGenerado}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(data.totals.totalAmountNoGenerado)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">REP Generado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.totals.totalRepGenerado}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(data.totals.totalAmountGenerado)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficas */}
      {data && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Gráfica de Ingresos Diarios */}
          <Card className="border-gray-200 lg:col-span-7">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ingresos Diarios por Fecha</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('line')}
                  >
                    Línea
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    Barras
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'totalAmount' ? 'Total Ingresos' :
                          name === 'amountGenerado' ? 'REP Generado' :
                          name === 'amountNoGenerado' ? 'REP No Generado' : name
                        ]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalAmount" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Total Ingresos"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amountGenerado" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="REP Generado"
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amountNoGenerado" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="REP No Generado"
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'totalAmount' ? 'Total Ingresos' :
                          name === 'amountGenerado' ? 'REP Generado' :
                          name === 'amountNoGenerado' ? 'REP No Generado' : name
                        ]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="amountGenerado" fill="#2563eb" name="REP Generado" />
                      <Bar dataKey="amountNoGenerado" fill="#f59e0b" name="REP No Generado" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfica de Diarios */}
          <Card className="border-gray-200 lg:col-span-3">
            <CardHeader>
              <CardTitle>Ingresos por Diario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.journalData.slice(0, 8).map((journal, index) => (
                  <div key={journal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{journal.name}</p>
                        <p className="text-sm text-gray-500">{journal.paymentCount} pagos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(journal.totalAmount)}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-blue-600">
                          {journal.repGenerado} REP ✓
                        </span>
                        {journal.repNoGenerado > 0 && (
                          <span className="text-orange-600">
                            {journal.repNoGenerado} Pend.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {data.journalData.length > 8 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    Y {data.journalData.length - 8} diarios más...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de Pagos */}
      {(data || tableData.length > 0) && (
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalle de Pagos</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTableData(1, pageSize)}
                  disabled={isLoadingTable}
                >
                  {isLoadingTable ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Actualizar Tabla
                    </>
                  )}
                </Button>
                <Label htmlFor="pageSize" className="text-sm">Mostrar:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTable ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Cargando datos...</span>
              </div>
            ) : tableData.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Diario</TableHead>
                        <TableHead>Importe</TableHead>
                        <TableHead>Estado REP</TableHead>
                        <TableHead>Referencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {formatTableDate(payment.date)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <a
                              href={`https://fexs.mx/web#id=${payment.id}&model=account.payment&view_type=form`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {payment.name}
                            </a>
                          </TableCell>
                          <TableCell>
                            {payment.partner_id[1]}
                          </TableCell>
                          <TableCell>
                            {payment.journal_id[1]}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEstadoRepColor(payment.estado_pago)}>
                              {getEstadoRepLabel(payment.estado_pago)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {payment.ref || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {pagination && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a {Math.min(pagination.page * pagination.pageSize, pagination.totalRecords)} de {pagination.totalRecords} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos en la tabla</h3>
                <p className="text-gray-500 mb-4">
                  Haz clic en "Actualizar Tabla" para cargar los datos de pagos.
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetchTableData(1, pageSize)}
                  disabled={isLoadingTable}
                >
                  {isLoadingTable ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Cargar Datos
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay datos */}
      {data && chartData.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500">
              No se encontraron pagos para el rango de fechas seleccionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
