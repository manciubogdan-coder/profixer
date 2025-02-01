import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare, Briefcase, Trophy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMonths, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ro } from "date-fns/locale";

interface CraftsmanStats {
  total_clients: number;
  average_rating: number;
  total_projects: number;
  total_messages: number;
  positive_reviews: number;
}

type DateRange = {
  start: Date | null;
  end: Date | null;
};

export const CraftsmanStats = ({ craftsmanId }: { craftsmanId: string }) => {
  const [stats, setStats] = useState<CraftsmanStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const updateDateRange = (period: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (period) {
      case "this_week":
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        end = new Date();
        break;
      case "this_month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "last_month":
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case "last_3_months":
        start = startOfMonth(subMonths(now, 3));
        end = new Date();
        break;
      case "all":
      default:
        start = null;
        end = null;
    }

    setDateRange({ start, end });
  };

  useEffect(() => {
    const fetchStats = async () => {
      console.log("Fetching stats for craftsman:", craftsmanId);
      console.log("Date range:", dateRange);

      const { data, error } = await supabase.rpc("get_craftsman_statistics", {
        craftsman_id_param: craftsmanId,
        start_date: dateRange.start?.toISOString(),
        end_date: dateRange.end?.toISOString(),
      });

      if (error) {
        console.error("Error fetching craftsman stats:", error);
        return;
      }

      console.log("Craftsman stats:", data[0]);
      setStats(data[0]);
    };

    if (craftsmanId) {
      fetchStats();
    }
  }, [craftsmanId, dateRange]);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    updateDateRange(value);
  };

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selectează perioada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toată perioada</SelectItem>
            <SelectItem value="this_week">Săptămâna aceasta</SelectItem>
            <SelectItem value="this_month">Luna aceasta</SelectItem>
            <SelectItem value="last_month">Luna trecută</SelectItem>
            <SelectItem value="last_3_months">Ultimele 3 luni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total_clients}</p>
            <p className="text-sm text-muted-foreground">Clienți</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Rating Mediu</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total_projects}</p>
            <p className="text-sm text-muted-foreground">Proiecte</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total_messages}</p>
            <p className="text-sm text-muted-foreground">Mesaje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.positive_reviews}</p>
            <p className="text-sm text-muted-foreground">Recenzii Pozitive</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};