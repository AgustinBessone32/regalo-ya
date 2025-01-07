import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface BudgetAnalyticsProps {
  avgAmount: number;
  medianAmount: number;
  minAmount: number;
  maxAmount: number;
  totalContributions: number;
  contributionHistory: number[];
}

export function BudgetAnalytics({
  avgAmount,
  medianAmount,
  minAmount,
  maxAmount,
  totalContributions,
  contributionHistory,
}: BudgetAnalyticsProps) {
  // Prepare data for visualization
  const chartData = contributionHistory.map((amount, index) => ({
    contribution: index + 1,
    amount,
  }));

  const statistics = [
    { label: "Average", value: avgAmount },
    { label: "Median", value: medianAmount },
    { label: "Minimum", value: minAmount },
    { label: "Maximum", value: maxAmount },
    { label: "Total Contributors", value: totalContributions },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statistics.map(({ label, value }) => (
            <div key={label} className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-semibold">
                {label === "Total Contributors" ? value : `$${value.toFixed(2)}`}
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
                  formatter={(value) => [`$${value}`, "Amount"]}
                  labelFormatter={(value) => `Contribution #${value}`}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {contributionHistory.length === 0 && (
          <p className="text-center text-muted-foreground">
            No contributions yet. Be the first to contribute!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
