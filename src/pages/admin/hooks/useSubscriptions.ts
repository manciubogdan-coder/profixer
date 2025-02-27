
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionData {
  craftsman_id: string;
  is_subscription_active: boolean;
  subscription_end_date: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface Subscription {
  id: string;
  craftsman_id: string;
  craftsman_name: string;
  craftsman_email: string;
  status: "active" | "inactive";
  end_date: string | null;
}

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalClients: number;
  totalProfessionals: number;
}

interface Filters {
  status: "all" | "active" | "inactive";
  search: string;
  name: string;
  email: string;
}

export interface HistoricalStats {
  date: string;
  total_users: number;
  total_clients: number;
  total_craftsmen: number;
  total_messages: number;
  total_jobs: number;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalClients: 0,
    totalProfessionals: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    name: "",
    email: ""
  });

  const fetchDashboardStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalClients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client");

      const { count: totalProfessionals } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "professional");

      const { count: activeListings } = await supabase
        .from("job_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      const { data: subStats } = await supabase
        .from("subscription_statistics")
        .select("*")
        .single();

      setStats({
        totalUsers: totalUsers || 0,
        totalClients: totalClients || 0,
        totalProfessionals: totalProfessionals || 0,
        activeListings: activeListings || 0,
        activeSubscriptions: subStats?.active_subscriptions || 0,
        expiredSubscriptions: subStats?.expired_subscriptions || 0
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Nu am putut încărca statisticile");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data: professionals, error: profError } = await supabase
        .from("user_profiles_with_email")
        .select("*")
        .eq("role", "professional");

      if (profError) {
        console.error("Error fetching professionals:", profError);
        throw profError;
      }

      if (!professionals || professionals.length === 0) {
        console.log("No professional craftsmen found in the database");
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      const { data: statusData, error: statusError } = await supabase
        .from("craftsman_subscription_status_latest")
        .select("*")
        .in("craftsman_id", professionals.map(p => p.id));

      if (statusError) {
        console.error("Error fetching subscription status:", statusError);
        throw statusError;
      }

      const statusMap = new Map(
        statusData?.map(status => [status.craftsman_id, status]) || []
      );

      const formattedSubscriptions: Subscription[] = professionals
        .filter(prof => prof.role === 'professional')
        .map(prof => {
          const subscriptionStatus = statusMap.get(prof.id);
          const status: "active" | "inactive" = subscriptionStatus?.is_subscription_active ? "active" : "inactive";
          
          const subscription = {
            id: prof.id,
            craftsman_id: prof.id,
            craftsman_name: `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || 'N/A',
            craftsman_email: prof.email || 'N/A',
            status,
            end_date: subscriptionStatus?.subscription_end_date || null
          };

          console.log('Formatted subscription for craftsman:', prof.first_name, prof.last_name);
          return subscription;
        })
        .filter(sub => {
          if (filters.status !== 'all' && filters.status !== sub.status) return false;
          if (filters.name && !sub.craftsman_name.toLowerCase().includes(filters.name.toLowerCase())) return false;
          if (filters.email && !sub.craftsman_email.toLowerCase().includes(filters.email.toLowerCase())) return false;
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!sub.craftsman_name.toLowerCase().includes(searchLower) &&
                !sub.craftsman_email.toLowerCase().includes(searchLower)) {
              return false;
            }
          }
          return true;
        })
        .sort((a, b) => {
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
        });

      console.log('Final formatted subscriptions:', formattedSubscriptions.length, 'craftsmen');
      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Nu am putut încărca lista de abonamente');
    } finally {
      setLoading(false);
    }
  };

  // Adăugăm o funcție pentru a obține date istorice în funcție de intervalul de date
  const fetchHistoricalStats = async (startDate?: Date, endDate?: Date): Promise<HistoricalStats[]> => {
    try {
      console.log("Fetching historical data from:", startDate, "to:", endDate);
      
      // Obținem utilizatorii înregistrați în timp
      const { data: userTimeline, error: userError } = await supabase
        .from('profiles')
        .select('created_at, role')
        .order('created_at', { ascending: true });
      
      if (userError) throw userError;
      
      // Obținem mesajele în timp
      const { data: messageTimeline, error: messageError } = await supabase
        .from('messages')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (messageError) throw messageError;
      
      // Obținem lucrările în timp
      const { data: jobTimeline, error: jobError } = await supabase
        .from('job_listings')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (jobError) throw jobError;
      
      // Creăm o mapare a lunilor cu date agregate
      const monthlyData = new Map<string, HistoricalStats>();
      
      // Funcția pentru a grupa pe luni
      const aggregateByMonth = (date: string) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      };
      
      // Inițializăm luna de start pentru a avea toate lunile în interval
      let startMonth = startDate ? 
          new Date(startDate.getFullYear(), startDate.getMonth(), 1) : 
          userTimeline.length > 0 ? new Date(userTimeline[0].created_at) : new Date();
          
      const endMonth = endDate ? 
          new Date(endDate.getFullYear(), endDate.getMonth(), 1) : 
          new Date();
      
      // Creăm intrări pentru toate lunile din interval
      while (startMonth <= endMonth) {
        const monthKey = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}`;
        const monthName = format(startMonth, 'MMM yyyy');
        
        monthlyData.set(monthKey, {
          date: monthName,
          total_users: 0,
          total_clients: 0,
          total_craftsmen: 0,
          total_messages: 0,
          total_jobs: 0
        });
        
        startMonth.setMonth(startMonth.getMonth() + 1);
      }
      
      // Agregăm utilizatorii pe luni
      let runningTotalUsers = 0;
      let runningTotalClients = 0;
      let runningTotalCraftsmen = 0;
      
      userTimeline.forEach(user => {
        const monthKey = aggregateByMonth(user.created_at);
        if (monthlyData.has(monthKey)) {
          runningTotalUsers++;
          
          if (user.role === 'client') {
            runningTotalClients++;
          } else if (user.role === 'professional') {
            runningTotalCraftsmen++;
          }
          
          // Actualizăm toate lunile de la această dată încolo
          for (const [key, value] of monthlyData.entries()) {
            if (key >= monthKey) {
              monthlyData.set(key, {
                ...value,
                total_users: runningTotalUsers,
                total_clients: runningTotalClients,
                total_craftsmen: runningTotalCraftsmen
              });
            }
          }
        }
      });
      
      // Agregăm mesajele pe luni
      messageTimeline.forEach(message => {
        const monthKey = aggregateByMonth(message.created_at);
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          monthlyData.set(monthKey, {
            ...data,
            total_messages: data.total_messages + 1
          });
        }
      });
      
      // Agregăm lucrările pe luni
      jobTimeline.forEach(job => {
        const monthKey = aggregateByMonth(job.created_at);
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          monthlyData.set(monthKey, {
            ...data,
            total_jobs: data.total_jobs + 1
          });
        }
      });
      
      // Convertim Map în array și sortăm cronologic
      return Array.from(monthlyData.values())
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
      
    } catch (error) {
      console.error('Error fetching historical stats:', error);
      toast.error('Nu am putut încărca datele istorice');
      return [];
    }
  };

  const updateSubscriptionDate = async (subscriptionId: string, newDate: Date) => {
    try {
      const { error: rpcError } = await supabase
        .rpc('update_craftsman_subscription_status', {
          p_craftsman_id: subscriptionId,
          p_is_active: true,
          p_end_date: newDate.toISOString()
        });

      if (rpcError) throw rpcError;

      toast.success('Data abonamentului a fost actualizată');
      
      await Promise.all([
        fetchSubscriptions(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Nu am putut actualiza data abonamentului');
    }
  };

  useEffect(() => {
    console.log('Running fetchSubscriptions effect');
    fetchSubscriptions();
  }, [filters]);

  useEffect(() => {
    console.log('Running fetchDashboardStats effect');
    fetchDashboardStats();
  }, []);

  return {
    subscriptions,
    stats,
    loading,
    updateSubscriptionDate,
    filters,
    setFilters,
    fetchHistoricalStats,
  };
};
