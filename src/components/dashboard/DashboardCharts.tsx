
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const COLORS = ['#800491', '#FF8042', '#FFBB28', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347'];

interface DashboardChartsProps {
  expensesByCategory: Array<{ name: string; value: number }>;
  revenuesByCategory: Array<{ name: string; value: number }>;
  formatCurrency: (value: number) => string;
}

export function DashboardCharts({
  expensesByCategory,
  revenuesByCategory,
  formatCurrency
}: DashboardChartsProps) {
  // Função customizada para o tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`Categoria: ${label}`}</p>
          <p className="text-blue-600">
            {`Valor: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-tertiary">
            Despesas Pagas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expensesByCategory}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    fontSize={12}
                    tick={{ textAnchor: 'end' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhuma despesa encontrada no período
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-tertiary">
            Receitas Recebidas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenuesByCategory.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenuesByCategory}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    fontSize={12}
                    tick={{ textAnchor: 'end' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {revenuesByCategory.map((entry, index) => (
                      <Cell key={`revenue-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhuma receita encontrada no período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
