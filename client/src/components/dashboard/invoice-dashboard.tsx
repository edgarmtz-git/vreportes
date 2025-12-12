import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceComparison } from "./invoice-comparison";
import { TopPerformers } from "./top-performers";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp
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
  methodo_pago?: string | [string, string]; // Campo para método de pago (PUE o PPD) - puede venir como string o tupla [id, nombre]
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  invoices: InvoiceData[];
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function InvoiceDashboard() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [state, setState] = useState<string>("all");
  const [metodoPago, setMetodoPago] = useState<string>("all");
  const [estadoPago, setEstadoPago] = useState<string>("all");
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]); // Guardar todas las facturas sin filtrar
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);

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

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'draft': return 'Borrador';
      case 'posted': return 'Publicada';
      case 'cancel': return 'Cancelada';
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'posted': return 'bg-green-100 text-green-800';
      case 'cancel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoveTypeLabel = (moveType: string) => {
    switch (moveType) {
      case 'out_invoice': return 'Factura';
      case 'out_refund': return 'Nota de Crédito';
      default: return moveType;
    }
  };

  const getMetodoPagoLabel = (metodoPago?: string | [string, string]): string => {
    if (!metodoPago) return '-';
    
    // Manejar si viene como tupla [id, nombre] desde Odoo
    let metodoStr = '';
    if (Array.isArray(metodoPago)) {
      metodoStr = metodoPago[1] || metodoPago[0] || '';
    } else {
      metodoStr = metodoPago;
    }
    
    if (!metodoStr) return '-';
    
    // Convertir el valor del campo a PUE o PPD
    const metodoLower = metodoStr.toLowerCase().trim();
    
    // Buscar coincidencias para PUE
    if (
      metodoLower.includes('una sola exhibición') || 
      metodoLower.includes('pue') ||
      metodoLower === 'pue' ||
      metodoLower.includes('single payment') ||
      metodoLower.includes('exhibición única')
    ) {
      return 'PUE';
    }
    
    // Buscar coincidencias para PPD
    if (
      metodoLower.includes('parcialidades') || 
      metodoLower.includes('diferido') || 
      metodoLower.includes('ppd') ||
      metodoLower === 'ppd' ||
      metodoLower.includes('partial') ||
      metodoLower.includes('installments')
    ) {
      return 'PPD';
    }
    
    // Si no coincide con ninguno, devolver el valor original truncado
    return metodoStr.length > 20 ? metodoStr.substring(0, 20) + '...' : metodoStr;
  };

  const isPaid = (invoice: InvoiceData) => {
    return invoice.amount_residual === 0;
  };

  // Función para aplicar filtros locales
  const applyFilters = (invoiceList: InvoiceData[]): InvoiceData[] => {
    let filtered = [...invoiceList];

    // Filtro por método de pago (PUE/PPD)
    if (metodoPago !== "all") {
      filtered = filtered.filter(invoice => {
        const metodo = getMetodoPagoLabel(invoice.methodo_pago);
        return metodo === metodoPago;
      });
    }

    // Filtro por estado de pago (Pagada/Pendiente)
    if (estadoPago !== "all") {
      if (estadoPago === "pagada") {
        filtered = filtered.filter(invoice => isPaid(invoice));
      } else if (estadoPago === "pendiente") {
        filtered = filtered.filter(invoice => !isPaid(invoice));
      }
    }

    // Filtro por estado de factura (ya se aplica en el backend, pero lo mantenemos por consistencia)
    if (state !== "all") {
      filtered = filtered.filter(invoice => invoice.state === state);
    }

    return filtered;
  };

  const fetchInvoiceData = async () => {
    if (!dateFrom || !dateTo) {
      setError("Por favor selecciona un rango de fechas");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener estadísticas generales
      const statsResponse = await fetch('/api/reports/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          state: state === "all" ? undefined : state || undefined,
          page: 1,
          pageSize: 1000 // Obtener todas para calcular estadísticas
        }),
      });

      if (!statsResponse.ok) {
        throw new Error('Error al obtener datos de facturas');
      }

      const statsData = await statsResponse.json();

      if (!statsData.success) {
        throw new Error(statsData.message || 'Error al obtener datos');
      }

      const allInvoicesData = statsData.data || [];
      
      // Guardar todas las facturas sin filtrar
      setAllInvoices(allInvoicesData);
      
      // Aplicar filtros locales
      const filteredInvoices = applyFilters(allInvoicesData);
      
      // Calcular estadísticas con facturas filtradas
      const totalInvoices = filteredInvoices.length;
      const paidInvoices = filteredInvoices.filter(isPaid).length;
      const unpaidInvoices = totalInvoices - paidInvoices;
      
      const totalAmount = filteredInvoices.reduce((sum: number, inv: InvoiceData) => sum + inv.amount_total, 0);
      const paidAmount = filteredInvoices.filter(isPaid).reduce((sum: number, inv: InvoiceData) => sum + inv.amount_total, 0);
      const unpaidAmount = totalAmount - paidAmount;

      setStats({
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        totalAmount,
        paidAmount,
        unpaidAmount,
        invoices: filteredInvoices
      });

      // Cargar tabla con paginación
      await fetchTableData(1, pageSize);

    } catch (error) {
      console.error('Error fetching invoice data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (page: number, size: number) => {
    setIsLoadingTable(true);

    try {
      // Usar las facturas ya cargadas o cargar desde el servidor
      let invoicesToFilter = allInvoices.length > 0 ? allInvoices : [];
      
      // Si no hay facturas cargadas, obtenerlas del servidor
      if (invoicesToFilter.length === 0) {
        const response = await fetch('/api/reports/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateFrom,
            dateTo,
            state: state === "all" ? undefined : state || undefined,
            page: 1,
            pageSize: 1000 // Obtener todas para aplicar filtros locales
          }),
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos de tabla');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Error al obtener datos');
        }

        invoicesToFilter = data.data || [];
        setAllInvoices(invoicesToFilter);
      }
      
      // Aplicar filtros locales
      const filteredInvoices = applyFilters(invoicesToFilter);
      
      // Aplicar paginación local
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
      
      setInvoices(paginatedInvoices);
      
      // Calcular paginación basada en resultados filtrados
      const totalRecords = filteredInvoices.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / size));
      setPagination({
        page,
        pageSize: size,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      });
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching table data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTableData(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchTableData(1, newSize);
  };

  const handleRefresh = () => {
    if (dateFrom && dateTo) {
      // Resetear filtros locales al refrescar
      setMetodoPago("all");
      setEstadoPago("all");
      fetchInvoiceData();
    }
  };

  // Función para aplicar filtros cuando cambian
  const applyFiltersAndUpdate = () => {
    if (allInvoices.length > 0) {
      const filtered = applyFilters(allInvoices);
      const filteredStats = {
        totalInvoices: filtered.length,
        paidInvoices: filtered.filter(isPaid).length,
        unpaidInvoices: filtered.filter(inv => !isPaid(inv)).length,
        totalAmount: filtered.reduce((sum, inv) => sum + inv.amount_total, 0),
        paidAmount: filtered.filter(isPaid).reduce((sum, inv) => sum + inv.amount_total, 0),
        unpaidAmount: filtered.filter(inv => !isPaid(inv)).reduce((sum, inv) => sum + inv.amount_total, 0),
        invoices: filtered
      };
      setStats(filteredStats);
      fetchTableData(1, pageSize);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado Factura</Label>
              <Select value={state} onValueChange={(value) => {
                setState(value);
                applyFiltersAndUpdate();
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="posted">Publicada</SelectItem>
                  <SelectItem value="cancel">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estadoPago">Estado de Pago</Label>
              <Select value={estadoPago} onValueChange={(value) => {
                setEstadoPago(value);
                applyFiltersAndUpdate();
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select value={metodoPago} onValueChange={(value) => {
                setMetodoPago(value);
                applyFiltersAndUpdate();
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
                  <SelectItem value="PPD">PPD - Pago en parcialidades</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchInvoiceData}
                disabled={isLoading || !dateFrom || !dateTo}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Facturas */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facturas Pagadas */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Facturas Pagadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                  <p className="text-sm text-gray-500">
                    {stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}% del total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facturas No Pagadas */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Facturas Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unpaidInvoices}</p>
                  <p className="text-sm text-gray-500">
                    {stats.totalInvoices > 0 ? Math.round((stats.unpaidInvoices / stats.totalInvoices) * 100) : 0}% del total
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monto Total */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                  <div className="text-sm text-gray-500 mt-1">
                    <div>Pagado: {formatCurrency(stats.paidAmount)}</div>
                    <div>Pendiente: {formatCurrency(stats.unpaidAmount)}</div>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparación de Facturas Pagadas vs No Pagadas */}
      {stats && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análisis de Facturas y Margen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceComparison 
              invoices={stats.invoices}
              totalAmount={stats.totalAmount}
              paidAmount={stats.paidAmount}
              unpaidAmount={stats.unpaidAmount}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {stats && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performers - Clientes y Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopPerformers invoices={stats.invoices} />
          </CardContent>
        </Card>
      )}

      {/* Tabla de Facturas */}
      {(stats || invoices.length > 0) && (
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalle de Facturas</CardTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTableData(currentPage, pageSize)}
                  disabled={isLoadingTable}
                >
                  {isLoadingTable ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
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
            ) : invoices.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Pendiente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Estado Pago</TableHead>
                        <TableHead>Método Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
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
                          <TableCell>
                            {invoice.partner_id[1]}
                          </TableCell>
                          <TableCell>
                            {getMoveTypeLabel(invoice.move_type)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.amount_total)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(invoice.amount_residual)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStateColor(invoice.state)}>
                              {getStateLabel(invoice.state)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={isPaid(invoice) ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                              {isPaid(invoice) ? "Pagada" : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const metodoPago = getMetodoPagoLabel(invoice.methodo_pago);
                              if (metodoPago === 'PUE') {
                                return <Badge className="bg-purple-100 text-purple-800 border border-purple-300">PUE</Badge>;
                              } else if (metodoPago === 'PPD') {
                                return <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-300">PPD</Badge>;
                              } else {
                                return <Badge className="bg-gray-100 text-gray-600">{metodoPago}</Badge>;
                              }
                            })()}
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
                  Haz clic en "Generar Reporte" para cargar los datos de facturas.
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetchInvoiceData()}
                  disabled={isLoading || !dateFrom || !dateTo}
                >
                  {isLoading ? (
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
    </div>
  );
}
