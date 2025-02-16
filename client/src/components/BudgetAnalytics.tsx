import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";

interface BudgetAnalyticsProps {
  avgAmount: number;
  medianAmount: number;
  minAmount: number;
  maxAmount: number;
  totalContributions: number;
  contributionHistory: number[];
  reactionCounts?: { emoji: string; count: number }[];
  totalShares?: number;
  platformShares?: { platform: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export function BudgetAnalytics({
  avgAmount,
  medianAmount,
  minAmount,
  maxAmount,
  totalContributions,
  contributionHistory,
  reactionCounts = [],
  totalShares = 0,
  platformShares = [],
}: BudgetAnalyticsProps) {
  // Prepare data for contribution history visualization
  const chartData = contributionHistory.map((amount, index) => ({
    contribution: index + 1,
    amount,
  }));

  // Calculate contribution growth rate
  const growthRate = useMemo(() => {
    if (contributionHistory.length < 2) return 0;
    const firstAmount = contributionHistory[0];
    const lastAmount = contributionHistory[contributionHistory.length - 1];
    return ((lastAmount - firstAmount) / firstAmount) * 100;
  }, [contributionHistory]);

  const statistics = [
    { label: "Promedio", value: avgAmount },
    { label: "Mediana", value: medianAmount },
    { label: "Mínimo", value: minAmount },
    { label: "Máximo", value: maxAmount },
    { label: "Total Contribuyentes", value: totalContributions },
    { label: "Tasa de Crecimiento", value: `${growthRate.toFixed(1)}%` },
  ];

  // Prepare data for engagement visualization
  const engagementData = platformShares.map((share, index) => ({
    name: share.platform,
    value: share.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Contribuciones</CardTitle>
          <CardDescription>
            Seguimiento de patrones de contribución y crecimiento del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {statistics.map(({ label, value }) => (
              <div key={label} className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-xl font-semibold">
                  {typeof value === 'number' && label !== "Tasa de Crecimiento" 
                    ? label === "Total Contribuyentes" 
                      ? value 
                      : `$${value.toFixed(2)}`
                    : value}
                </p>
              </div>
            ))}
          </div>

          {contributionHistory.length > 0 && (
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="contribution" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Monto"]}
                    labelFormatter={(value) => `Contribución #${value}`}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de Participación</CardTitle>
          <CardDescription>
            Participación de la comunidad e impacto social
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total de Reacciones</p>
              <p className="text-xl font-semibold">
                {reactionCounts.reduce((sum, r) => sum + r.count, 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total de Compartidos</p>
              <p className="text-xl font-semibold">{totalShares}</p>
            </div>
          </div>

          {/* Engagement Distribution */}
          {platformShares.length > 0 && (
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reaction Distribution */}
          {reactionCounts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Distribución de Reacciones</h4>
              <div className="flex flex-wrap gap-2">
                {reactionCounts.map(({ emoji, count }) => (
                  <div key={emoji} className="flex items-center gap-1 text-sm">
                    <span>{emoji}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}