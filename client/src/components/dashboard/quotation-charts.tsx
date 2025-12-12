import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

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
}

interface QuotationChartsProps {
  stats: QuotationStats;
}

export function QuotationCharts({ stats }: QuotationChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Datos para gráfico de pie (cantidad)
  const pieData = [
    {
      name: 'Aceptadas',
      value: stats.accepted.count,
      color: '#10b981',
      icon: CheckCircle
    },
    {
      name: 'Rechazadas',
      value: stats.rejected.count,
      color: '#ef4444',
      icon: XCircle
    },
    {
      name: 'Pendientes',
      value: stats.pending.count,
      color: '#3b82f6',
      icon: Clock
    }
  ].filter(item => item.value > 0);

  // Datos para gráfico de barras (montos)
  const barData = [
    {
      name: 'Aceptadas',
      monto: stats.accepted.amount,
      count: stats.accepted.count,
      color: '#10b981',
      label: 'Monto por ganar'
    },
    {
      name: 'Rechazadas',
      monto: stats.rejected.amount,
      count: stats.rejected.count,
      color: '#ef4444',
      label: 'Monto perdido'
    },
    {
      name: 'Pendientes',
      monto: stats.pending.amount,
      count: stats.pending.count,
      color: '#3b82f6',
      label: 'Monto en espera'
    }
  ].filter(item => item.monto > 0);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pie - Cantidad de Cotizaciones */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          Distribución por Cantidad
        </h4>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-300 text-gray-500">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No hay datos para mostrar</p>
            </div>
          </div>
        )}
        
        {/* Leyenda */}
        <div className="mt-4 space-y-2">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Barras - Montos */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 text-center">
          Distribución por Montos
        </h4>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`;
                }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Estado: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="monto" 
                name="Monto"
                radius={[8, 8, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-300 text-gray-500">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No hay datos para mostrar</p>
            </div>
          </div>
        )}
        
        {/* Resumen de montos */}
        <div className="mt-4 space-y-2">
          {barData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: `${item.color}20` }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <span className="font-bold" style={{ color: item.color }}>
                {formatCurrency(item.monto)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Estadísticas */}
      <div className="lg:col-span-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Oportunidades Ganadas</h4>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats.accepted.amount)}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {stats.accepted.count} cotizaciones aceptadas
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Oportunidades Perdidas</h4>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(stats.rejected.amount)}
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {stats.rejected.count} cotizaciones rechazadas
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Oportunidades en Proceso</h4>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(stats.pending.amount)}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {stats.pending.count} cotizaciones pendientes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

