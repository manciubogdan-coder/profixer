
import { Users, Star, CheckCircle, MessageSquare, Briefcase, Calendar, Download, User, Hammer, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

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

// Funcție pentru normalizarea numelor de județe
const normalizeCountyName = (county: string): string => {
  // Standardizăm numele județului (prima literă mare, restul mici)
  return county.trim().charAt(0).toUpperCase() + county.trim().slice(1).toLowerCase();
};

export const Statistics = () => {
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(10);
  
  const form = useForm({
    defaultValues: {
      displayOption: "10"
    }
  });

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

      // Process users by county with normalization
      const countiesStat: Record<string, { total: number, clients: number, craftsmen: number }> = {};
      
      usersByCounty?.forEach(user => {
        if (!user.county) return;
        
        const normalizedCounty = normalizeCountyName(user.county);
        
        if (!countiesStat[normalizedCounty]) {
          countiesStat[normalizedCounty] = { total: 0, clients: 0, craftsmen: 0 };
        }
        
        countiesStat[normalizedCounty].total += 1;
        
        if (user.role === 'client') {
          countiesStat[normalizedCounty].clients += 1;
        } else if (user.role === 'professional') {
          countiesStat[normalizedCounty].craftsmen += 1;
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

  // Organizăm județele în funcție de numărul total de utilizatori
  const sortedCounties = useMemo(() => {
    if (!stats?.users_by_county) return [];
    
    return Object.entries(stats.users_by_county)
      .map(([county, data]) => ({
        name: county,
        ...data
      }))
      .sort((a, b) => b.total - a.total);
  }, [stats?.users_by_county]);

  // Filtrăm județele în funcție de selecție
  const filteredCounties = useMemo(() => {
    if (selectedCounties.length === 0) {
      return sortedCounties.slice(0, displayCount);
    }
    return sortedCounties.filter(county => selectedCounties.includes(county.name));
  }, [sortedCounties, selectedCounties, displayCount]);

  // Gestiunea selecției județelor
  const toggleCountySelection = (county: string) => {
    if (selectedCounties.includes(county)) {
      setSelectedCounties(selectedCounties.filter(c => c !== county));
    } else {
      setSelectedCounties([...selectedCounties, county]);
    }
  };

  const handleDisplayOptionChange = (value: string) => {
    if (value === "all") {
      setDisplayCount(sortedCounties.length);
    } else {
      setDisplayCount(parseInt(value));
    }
    setSelectedCounties([]);
  };

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

        {/* Lista județelor */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-6">Distribuția pe Județe</h3>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="displayOption"
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel>Afișează</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDisplayOptionChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selectează opțiune" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10">Top 10 județe</SelectItem>
                            <SelectItem value="20">Top 20 județe</SelectItem>
                            <SelectItem value="all">Toate județele</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </Form>

                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Județe selectate: {selectedCounties.length}</span>
                </div>
              </div>
              
              {selectedCounties.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCounties([])}
                >
                  Resetează selecția
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Județ</TableHead>
                    <TableHead className="text-right">Total Utilizatori</TableHead>
                    <TableHead className="text-right">Clienți</TableHead>
                    <TableHead className="text-right">Meșteri</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCounties.length > 0 ? (
                    filteredCounties.map((county) => (
                      <TableRow 
                        key={county.name}
                        className={selectedCounties.includes(county.name) ? "bg-primary/10" : ""}
                        onClick={() => toggleCountySelection(county.name)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell className="font-medium">{county.name}</TableCell>
                        <TableCell className="text-right">{county.total}</TableCell>
                        <TableCell className="text-right">{county.clients}</TableCell>
                        <TableCell className="text-right">{county.craftsmen}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Nu există date disponibile pentru județe
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
