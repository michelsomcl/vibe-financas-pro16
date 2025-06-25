
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
              className="mx-auto aspect-square max-h-[400px]"
            >
              <PieChart>
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="flex-wrap gap-2 text-sm"
                />
              </PieChart>
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
              className="mx-auto aspect-square max-h-[400px]"
            >
              <PieChart>
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Pie
                  data={revenuesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {revenuesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="flex-wrap gap-2 text-sm"
                />
              </PieChart>
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
