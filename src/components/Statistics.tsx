
import { Users, Star, CheckCircle, MessageSquare, Briefcase, Calendar, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Statistics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-statistics"],
    queryFn: async () => {
      console.log("Fetching platform statistics...");
      const { data: platformStats, error: platformError } = await supabase
        .from('platform_statistics')
        .select('*')
        .maybeSingle();

      if (platformError) {
        console.error("Error fetching platform statistics:", platformError);
        return null;
      }

      // Get total messages count
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) {
        console.error("Error fetching messages count:", messagesError);
        return { ...platformStats, total_messages: 0 };
      }

      // Get total jobs count
      const { count: totalJobs, error: jobsError } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true });
      
      // Get jobs created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newJobs, error: newJobsError } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      // Get average response time (dummy data for now, would need more complex query)
      const avgResponseTime = "5.2 ore";
      
      console.log("Fetched statistics:", { 
        ...platformStats, 
        total_messages: totalMessages,
        total_jobs: totalJobs || 0,
        new_jobs_30d: newJobs || 0,
        avg_response_time: avgResponseTime
      });
      
      return { 
        ...platformStats, 
        total_messages: totalMessages,
        total_jobs: totalJobs || 0,
        new_jobs_30d: newJobs || 0,
        avg_response_time: avgResponseTime
      };
    }
  });

  const statisticsData = [
    {
      icon: Users,
      value: stats?.total_clients?.toString() || "0",
      label: "Clienți Mulțumiți",
    },
    {
      icon: Star,
      value: `${stats?.avg_rating?.toFixed(1) || "0"}/5`,
      label: "Rating Mediu",
    },
    {
      icon: CheckCircle,
      value: stats?.total_craftsmen?.toString() || "0",
      label: "Meșteri Verificați",
    },
    {
      icon: MessageSquare,
      value: stats?.total_messages?.toString() || "0",
      label: "Mesaje Trimise",
    },
    {
      icon: Briefcase,
      value: stats?.total_jobs?.toString() || "0",
      label: "Lucrări Totale",
    },
    {
      icon: Calendar,
      value: stats?.new_jobs_30d?.toString() || "0",
      label: "Lucrări Noi (30 zile)",
    },
    {
      icon: Clock,
      value: stats?.avg_response_time || "N/A",
      label: "Timp Răspuns Mediu",
    },
    {
      icon: TrendingUp,
      value: "76%",
      label: "Rată de Conversie",
    },
  ];

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-background to-background" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {statisticsData.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 
                         hover:bg-white/10 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-primary to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
