import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare, Briefcase, Trophy, Eye, MapPin, Phone, UserCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { addMonths, startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface CraftsmanStats {
  total_clients: number;
  average_rating: number;
  total_projects: number;
  total_messages: number;
  positive_reviews: number;
  profile_views: number;
  map_clicks: number;
  phone_clicks: number;
  unique_visitors: number;
}

export const CraftsmanStats = ({ craftsmanId }: { craftsmanId: string }) => {
  const [stats, setStats] = useState<CraftsmanStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const updateDateRange = (period: string) => {
    const now = new Date();
    let start: Date | undefined = undefined;
    let end: Date | undefined = undefined;

    switch (period) {
      case "this_week":
        start = startOfWeek(now, { locale: ro });
        end = endOfWeek(now, { locale: ro });
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
      case "custom":
        setIsCustomRange(true);
        return;
      case "all":
      default:
        start = undefined;
        end = undefined;
    }

    setIsCustomRange(false);
    setDateRange({ from: start, to: end });
  };

  const fetchStats = async () => {
    console.log("Fetching stats for craftsman:", craftsmanId);
    console.log("Date range:", isCustomRange ? customDateRange : dateRange);

    const { data, error } = await supabase.rpc("get_craftsman_statistics", {
      craftsman_id_param: craftsmanId,
      start_date: isCustomRange 
        ? customDateRange?.from?.toISOString() 
        : dateRange?.from?.toISOString(),
      end_date: isCustomRange 
        ? customDateRange?.to?.toISOString() 
        : dateRange?.to?.toISOString(),
    });

    if (error) {
      console.error("Error fetching craftsman stats:", error);
      return;
    }

    console.log("Craftsman stats:", data[0]);
    setStats(data[0]);
  };

  useEffect(() => {
    if (craftsmanId) {
      fetchStats();
    }
  }, [craftsmanId, dateRange, customDateRange, isCustomRange]);

  // Set up real-time subscription for profile interactions
  useEffect(() => {
    if (!craftsmanId) return;

    console.log("Setting up profile interactions subscription for craftsman:", craftsmanId);

    const channel = supabase
      .channel('profile_interactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_interactions',
          filter: `craftsman_id=eq.${craftsmanId}`,
        },
        (payload) => {
          console.log('New profile interaction:', payload);
          fetchStats();
        }
      )
      .subscribe((status) => {
        console.log("Profile interactions subscription status:", status);
      });

    return () => {
      console.log("Cleaning up profile interactions subscription");
      supabase.removeChannel(channel);
    };
  }, [craftsmanId]);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    updateDateRange(value);
  };

  const handleCustomRangeChange = (range: DateRange | undefined) => {
    setCustomDateRange(range);
  };

  const formatCustomRange = () => {
    if (customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'dd MMM yyyy', { locale: ro })} - ${format(customDateRange.to, 'dd MMM yyyy', { locale: ro })}`;
    }
    return "Selectează perioada";
  };

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
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
            <SelectItem value="custom">Interval personalizat</SelectItem>
          </SelectContent>
        </Select>

        {selectedPeriod === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !customDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatCustomRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDateRange?.from}
                selected={customDateRange}
                onSelect={handleCustomRangeChange}
                numberOfMonths={2}
                locale={ro}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.profile_views}</p>
            <p className="text-sm text-muted-foreground">Vizualizări Profil</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.map_clicks}</p>
            <p className="text-sm text-muted-foreground">Click-uri pe Hartă</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.phone_clicks}</p>
            <p className="text-sm text-muted-foreground">Click-uri pe Telefon</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.unique_visitors}</p>
            <p className="text-sm text-muted-foreground">Vizitatori Unici</p>
          </CardContent>
        </Card>

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