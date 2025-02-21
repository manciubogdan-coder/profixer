
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  totalUsers: number;
  activeListings: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
}

export const DashboardStats = ({
  totalUsers,
  activeListings,
  activeSubscriptions,
  expiredSubscriptions,
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilizatori Totali</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Numărul total de utilizatori înregistrați
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anunțuri Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeListings}</div>
          <p className="text-xs text-muted-foreground">
            Numărul total de anunțuri postate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonamente Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Numărul de abonamente active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonamente Expirate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiredSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Numărul de abonamente expirate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
