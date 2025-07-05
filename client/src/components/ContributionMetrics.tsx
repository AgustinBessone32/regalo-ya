import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gift, TrendingUp } from "lucide-react";

interface Contributor {
  contributor_name: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface ContributionMetricsProps {
  contributors: Contributor[];
  totalAmount: number;
}

export function ContributionMetrics({
  contributors,
  totalAmount,
}: ContributionMetricsProps) {
  const averageAmount =
    contributors.length > 0 ? Math.round(totalAmount / contributors.length) : 0;

  console.log("ccc", contributors);

  const uniqueContributors = contributors.reduce((acc, contributor) => {
    const name = contributor.contributor_name || "Anónimo";
    if (!acc[name]) {
      acc[name] = { name: name, totalAmount: 0, contributions: 0 };
    }
    acc[name].totalAmount += contributor.amount;
    acc[name].contributions += 1;
    return acc;
  }, {} as Record<string, { name: string; totalAmount: number; contributions: number }>);

  const contributorList = Object.values(uniqueContributors).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contribuyentes
                </p>
                <p className="text-2xl font-bold">{contributorList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Regalos
                </p>
                <p className="text-2xl font-bold">{contributors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Promedio por Regalo
                </p>
                <p className="text-2xl font-bold">${averageAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contributors List */}
      {contributorList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiénes Regalaron</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contributorList.slice(0, 10).map((contributor, index) => (
                <div
                  key={contributor.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{contributor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contributor.contributions}{" "}
                        {contributor.contributions === 1 ? "regalo" : "regalos"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${contributor.totalAmount}
                    </p>
                  </div>
                </div>
              ))}
              {contributorList.length > 10 && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Y {contributorList.length - 10} contribuyentes más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
