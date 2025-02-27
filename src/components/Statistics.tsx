
import { Users, Star, CheckCircle, MessageSquare, Briefcase, Calendar, Download, User, Hammer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Definim un tip pentru statisticile platformei
interface PlatformStatistics {
  total_clients: number;
  total_craftsmen: number;
  avg_rating: number;
  total_messages: number;
  total_jobs?: number;
  new_jobs_30d?: number;
  total_users?: number;
  users_by_county?: Record<string, { total: number, clients: number, craftsmen: number }>;
}

export const Statistics = () => {
  const { data: stats, isLoading } = useQuery<PlatformStatistics | null>({
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

      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error("Error fetching users count:", usersError);
      }

      // Get users by county
      const { data: usersByCounty, error: countyError } = await supabase
        .from('profiles')
        .select('county, role')
        .not('county', 'is', null);

      if (countyError) {
        console.error("Error fetching users by county:", countyError);
      }

      // Process users by county
      const countiesStat: Record<string, { total: number, clients: number, craftsmen: number }> = {};
      
      usersByCounty?.forEach(user => {
        if (!user.county) return;
        
        if (!countiesStat[user.county]) {
          countiesStat[user.county] = { total: 0, clients: 0, craftsmen: 0 };
        }
        
        countiesStat[user.county].total += 1;
        
        if (user.role === 'client') {
          countiesStat[user.county].clients += 1;
        } else if (user.role === 'professional') {
          countiesStat[user.county].craftsmen += 1;
        }
      });
      
      const result: PlatformStatistics = { 
        ...platformStats, 
        total_messages: totalMessages || 0,
        total_jobs: totalJobs || 0,
        new_jobs_30d: newJobs || 0,
        total_users: totalUsers || 0,
        users_by_county: countiesStat
      };
      
      console.log("Fetched statistics:", result);
      return result;
    }
  });

  const exportToExcel = () => {
    if (!stats) {
      toast.error("Nu există date pentru export");
      return;
    }

    // Creăm un workbook nou
    const wb = XLSX.utils.book_new();

    // Statistici principale
    const mainExportData = [
      {
        'Indicator': 'Utilizatori Totali',
        'Valoare': stats.total_users
      },
      {
        'Indicator': 'Clienți',
        'Valoare': stats.total_clients
      },
      {
        'Indicator': 'Meșteri',
        'Valoare': stats.total_craftsmen
      },
      {
        'Indicator': 'Rating Mediu',
        'Valoare': stats.avg_rating?.toFixed(1) + '/5'
      },
      {
        'Indicator': 'Mesaje Trimise',
        'Valoare': stats.total_messages
      },
      {
        'Indicator': 'Lucrări Totale', 
        'Valoare': stats.total_jobs
      },
      {
        'Indicator': 'Lucrări Noi (30 zile)',
        'Valoare': stats.new_jobs_30d
      }
    ];

    // Adăugăm foaia cu statistici principale
    const wsMain = XLSX.utils.json_to_sheet(mainExportData);
    XLSX.utils.book_append_sheet(wb, wsMain, "Statistici Generale");

    // Statistici pe județe
    if (stats.users_by_county) {
      const countyExportData = Object.entries(stats.users_by_county).map(([county, data]) => ({
        'Județ': county,
        'Total Utilizatori': data.total,
        'Clienți': data.clients,
        'Meșteri': data.craftsmen
      })).sort((a, b) => b['Total Utilizatori'] - a['Total Utilizatori']);

      // Adăugăm foaia cu statistici pe județe
      const wsCounty = XLSX.utils.json_to_sheet(countyExportData);
      XLSX.utils.book_append_sheet(wb, wsCounty, "Statistici pe Județe");
    }
    
    // Generăm numele fișierului cu data curentă
    const fileName = `Statistici_ProFixer_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Salvăm fișierul
    XLSX.writeFile(wb, fileName);
    
    toast.success("Statisticile au fost exportate cu succes!");
  };

  const statisticsData = [
    {
      icon: Users,
      value: stats?.total_users?.toString() || "0",
      label: "Utilizatori Totali",
    },
    {
      icon: User,
      value: stats?.total_clients?.toString() || "0",
      label: "Clienți",
    },
    {
      icon: Hammer,
      value: stats?.total_craftsmen?.toString() || "0",
      label: "Meșteri",
    },
    {
      icon: Star,
      value: `${stats?.avg_rating?.toFixed(1) || "0"}/5`,
      label: "Rating Mediu",
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
    }
  ];

  // Sortăm județele după numărul total de utilizatori
  const sortedCounties = stats?.users_by_county 
    ? Object.entries(stats.users_by_county)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 8) // Luăm doar primele 8 județe pentru afișare
    : [];

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Statistici Platformă</h2>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
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

        {/* Secțiunea pentru distribuția pe județe */}
        {sortedCounties.length > 0 && (
          <>
            <h3 className="text-2xl font-bold mb-6">Top Județe</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {sortedCounties.map(([county, data], index) => (
                <div
                  key={county}
                  className="p-6 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 
                             hover:bg-white/10 transition-all duration-300"
                >
                  <h4 className="text-xl font-semibold mb-3">{county}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{data.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clienți:</span>
                      <span className="font-medium">{data.clients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meșteri:</span>
                      <span className="font-medium">{data.craftsmen}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
