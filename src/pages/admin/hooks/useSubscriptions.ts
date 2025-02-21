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
}

interface Filters {
  status: "all" | "active" | "inactive";
  search: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: ""
  });

  const fetchDashboardStats = async () => {
    try {
      // Obținem statisticile despre abonamente folosind noua funcție
      const { data: subStats, error: subStatsError } = await supabase.rpc('get_subscription_statistics');
      console.log('Subscription stats received:', subStats);
      
      if (subStatsError) {
        console.error('Error fetching subscription stats:', subStatsError);
        throw subStatsError;
      }
      
      // Obținem numărul total de meșteri
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'professional');

      if (usersError) {
        console.error('Error fetching total users:', usersError);
        throw usersError;
      }

      console.log('Total users:', totalUsers);

      const { count: activeListings, error: listingsError } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (listingsError) {
        console.error('Error fetching active listings:', listingsError);
        throw listingsError;
      }

      console.log('Active listings:', activeListings);

      // Verificăm dacă avem date și accesăm primul element
      if (subStats && subStats[0]) {
        const newStats = {
          totalUsers: totalUsers || 0,
          activeListings: activeListings || 0,
          activeSubscriptions: Number(subStats[0].active_subscriptions) || 0,
          expiredSubscriptions: Number(subStats[0].expired_subscriptions) || 0
        };
        console.log('Setting new stats:', newStats);
        setStats(newStats);
      } else {
        console.log('No subscription stats available');
      }
    } catch (error) {
      console.error('Error in fetchDashboardStats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      let query = supabase
        .from('craftsman_subscription_status_latest')
        .select('*');

      if (filters.status !== 'all') {
        query = query.eq('is_subscription_active', filters.status === 'active');
      }

      const { data: statusData, error: statusError } = await query;

      if (statusError) throw statusError;

      const formattedSubscriptions: Subscription[] = (statusData as SubscriptionData[] || [])
        .map(sub => ({
          id: sub.craftsman_id,
          craftsman_id: sub.craftsman_id,
          craftsman_name: `${sub.first_name || ''} ${sub.last_name || ''}`.trim() || 'N/A',
          craftsman_email: sub.email || 'N/A',
          status: sub.is_subscription_active ? 'active' as const : 'inactive' as const,
          end_date: sub.subscription_end_date
        }))
        .filter(sub => {
          if (!filters.search) return true;
          const searchLower = filters.search.toLowerCase();
          return (
            sub.craftsman_name.toLowerCase().includes(searchLower) ||
            sub.craftsman_email.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => {
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
        });

      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Nu am putut încărca lista de abonamente');
    } finally {
      setLoading(false);
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
  };
};
