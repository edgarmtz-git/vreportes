import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuotationCharts } from "./quotation-charts";
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
  TrendingUp,
  Clock
} from "lucide-react";

interface QuotationData {
  id: number;
  name: string;
  date_order: string;
  partner_id: [number, string];
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  currency_id: [number, string];
  state: string;
  user_id: [number, string];
  team_id: [number, string];
  company_id: [number, string];
  create_date: string;
  write_date: string;
  validity_date?: string;
  commitment_date?: string;
}

interface QuotationStats {
  total: number;
  accepted: {
    count: number;
    amount: number;
  };
  rejected: {
    count: number;
    amount: number;
  };
  pending: {
    count: number;
    amount: number;
  };
  totalAmount: number;
  quotations: QuotationData[];
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function QuotationDashboard() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [state, setState] = useState<string>("all");
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [allQuotations, setAllQuotations] = useState<QuotationData[]>([]);
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
      case 'sent': return 'Enviada';
      case 'sale': return 'Aceptada';
      case 'done': return 'Completada';
      case 'cancel': return 'Rechazada';
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-green-100 text-green-800';
      case 'done': return 'bg-purple-100 text-purple-800';
      case 'cancel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isPending = (quotation: QuotationData) => {
    return quotation.state === 'draft' || quotation.state === 'sent';
  };

  const isAccepted = (quotation: QuotationData) => {
    return quotation.state === 'sale' || quotation.state === 'done';
  };

  const isRejected = (quotation: QuotationData) => {
    return quotation.state === 'cancel';
  };

  // Función para aplicar filtros locales
  const applyFilters = (quotationList: QuotationData[]): QuotationData[] => {
    let filtered = [...quotationList];

    // Filtro por estado de cotización
    if (state !== "all") {
      filtered = filtered.filter(quotation => quotation.state === state);
    }

    return filtered;
  };

  const fetchQuotationData = async () => {
    if (!dateFrom || !dateTo) {
      setError("Por favor selecciona un rango de fechas");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener estadísticas generales
      const statsResponse = await fetch('/api/reports/quotations/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          state: state === "all" ? undefined : state || undefined,
        }),
      });

      if (!statsResponse.ok) {
        throw new Error('Error al obtener estadísticas de cotizaciones');
      }

      const statsData = await statsResponse.json();

      if (!statsData.success) {
        throw new Error(statsData.message || 'Error al obtener datos');
      }

      const statsResult = statsData.data as QuotationStats;
      
      // Guardar todas las cotizaciones sin filtrar
      setAllQuotations(statsResult.quotations || []);
      
      // Aplicar filtros locales
      const filteredQuotations = applyFilters(statsResult.quotations || []);

      setStats({
        ...statsResult,
        quotations: filteredQuotations
      });

      // Cargar tabla con paginación
      await fetchTableData(1, pageSize);

    } catch (error) {
      console.error('Error fetching quotation data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (page: number, size: number) => {
    setIsLoadingTable(true);

    try {
      // Usar las cotizaciones ya cargadas o cargar desde el servidor
      let quotationsToFilter = allQuotations.length > 0 ? allQuotations : [];
      
      // Si no hay cotizaciones cargadas, obtenerlas del servidor
      if (quotationsToFilter.length === 0) {
        const response = await fetch('/api/reports/quotations', {
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

        quotationsToFilter = data.data || [];
        setAllQuotations(quotationsToFilter);
      }
      
      // Aplicar filtros locales
      const filteredQuotations = applyFilters(quotationsToFilter);
      
      // Aplicar paginación local
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);
      
      setQuotations(paginatedQuotations);
      
      // Calcular paginación basada en resultados filtrados
      const totalRecords = filteredQuotations.length;
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
      fetchQuotationData();
    }
  };

  // Función para aplicar filtros cuando cambian
  const applyFiltersAndUpdate = () => {
    if (allQuotations.length > 0) {
      const filtered = applyFilters(allQuotations);
      
      // Recalcular estadísticas con datos filtrados
      const accepted = filtered.filter(isAccepted);
      const rejected = filtered.filter(isRejected);
      const pending = filtered.filter(isPending);
      
      const acceptedAmount = accepted.reduce((sum, q) => sum + q.amount_total, 0);
      const rejectedAmount = rejected.reduce((sum, q) => sum + q.amount_total, 0);
      const pendingAmount = pending.reduce((sum, q) => sum + q.amount_total, 0);
      const totalAmount = filtered.reduce((sum, q) => sum + q.amount_total, 0);
      
      setStats({
        total: filtered.length,
        accepted: {
          count: accepted.length,
          amount: acceptedAmount
        },
        rejected: {
          count: rejected.length,
          amount: rejectedAmount
        },
        pending: {
          count: pending.length,
          amount: pendingAmount
        },
        totalAmount,
        quotations: filtered
      });
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Label htmlFor="state">Estado</Label>
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
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="sale">Aceptada</SelectItem>
                  <SelectItem value="done">Completada</SelectItem>
                  <SelectItem value="cancel">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchQuotationData}
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

      {/* Mensaje de error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cotizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(stats.totalAmount)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aceptadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.accepted.count}</div>
              <div className="text-sm text-green-600 mt-1">
                {formatCurrency(stats.accepted.amount)}
              </div>
              <div className="text-xs text-green-500 mt-1">
                Monto por ganar
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rechazadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{stats.rejected.count}</div>
              <div className="text-sm text-red-600 mt-1">
                {formatCurrency(stats.rejected.amount)}
              </div>
              <div className="text-xs text-red-500 mt-1">
                Monto perdido
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.pending.count}</div>
              <div className="text-sm text-blue-600 mt-1">
                {formatCurrency(stats.pending.amount)}
              </div>
              <div className="text-xs text-blue-500 mt-1">
                Monto en espera
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de Cotizaciones */}
      {stats && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análisis de Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuotationCharts stats={stats} />
          </CardContent>
        </Card>
      )}

      {/* Tabla de Cotizaciones */}
      {(stats || quotations.length > 0) && (
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalle de Cotizaciones</CardTitle>
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
            ) : quotations.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Vendedor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((quotation) => (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-medium">
                            {formatDate(quotation.date_order)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <a
                              href={`https://fexs.mx/web#id=${quotation.id}&model=sale.order&view_type=form`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {quotation.name}
                            </a>
                          </TableCell>
                          <TableCell>
                            {quotation.partner_id[1]}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(quotation.amount_total)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStateColor(quotation.state)}>
                              {getStateLabel(quotation.state)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quotation.user_id?.[1] || '-'}
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
                  Haz clic en "Generar Reporte" para cargar los datos de cotizaciones.
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetchQuotationData()}
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

