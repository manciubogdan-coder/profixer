import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare, Briefcase, Trophy } from "lucide-react";

interface CraftsmanStats {
  total_clients: number;
  average_rating: number;
  total_projects: number;
  total_messages: number;
  positive_reviews: number;
}

export const CraftsmanStats = ({ craftsmanId }: { craftsmanId: string }) => {
  const [stats, setStats] = useState<CraftsmanStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      console.log("Fetching stats for craftsman:", craftsmanId);
      const { data, error } = await supabase
        .from("craftsman_profile_statistics")
        .select("*")
        .eq("craftsman_id", craftsmanId)
        .single();

      if (error) {
        console.error("Error fetching craftsman stats:", error);
        return;
      }

      console.log("Craftsman stats:", data);
      setStats(data);
    };

    if (craftsmanId) {
      fetchStats();
    }
  }, [craftsmanId]);

  if (!stats) return null;

  return (
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
  );
};