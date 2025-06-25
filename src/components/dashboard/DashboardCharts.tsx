
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
  // Configuração dos gráficos
  const expensesChartConfig = expensesByCategory.reduce((config, item, index) => ({
    ...config,
    [item.name]: {
      label: item.name,
      color: COLORS[index % COLORS.length],
    },
  }), {});

  const revenuesChartConfig = revenuesByCategory.reduce((config, item, index) => ({
    ...config,
    [item.name]: {
      label: item.name,
      color: COLORS[index % COLORS.length],
    },
  }), {});

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
            <ChartContainer
              config={expensesChartConfig}
              className="min-h-[400px] w-full"
            >
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
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Valor']}
                  labelFormatter={(label) => `Categoria: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill={(entry: any, index: number) => COLORS[index % COLORS.length]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
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
            <ChartContainer
              config={revenuesChartConfig}
              className="min-h-[400px] w-full"
            >
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
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Valor']}
                  labelFormatter={(label) => `Categoria: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill={(entry: any, index: number) => COLORS[index % COLORS.length]}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
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
