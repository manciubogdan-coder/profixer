
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'professional');

      const { count: activeListings } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Folosim DISTINCT pentru a număra doar meșteri unici
      const { data: statusData } = await supabase
        .from('craftsman_subscription_status')
        .select('is_subscription_active, craftsman_id')
        .order('craftsman_id');

      if (statusData) {
        const activeSubscriptions = statusData.filter(s => s.is_subscription_active).length;
        const expiredSubscriptions = statusData.length - activeSubscriptions;

        setStats({
          totalUsers: totalUsers || 0,
          activeListings: activeListings || 0,
          activeSubscriptions,
          expiredSubscriptions
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      let query = supabase
        .from('craftsman_subscription_status')
        .select(`
          craftsman_id,
          is_subscription_active,
          subscription_end_date,
          profiles!inner(
            first_name,
            last_name,
            email
          )
        `)
        .order('subscription_end_date', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('is_subscription_active', filters.status === 'active');
      }

      const { data: statusData, error: statusError } = await query;

      if (statusError) throw statusError;

      // Folosim Set pentru a urmări ID-urile unice ale meșterilor
      const processedIds = new Set<string>();
      
      const formattedSubscriptions: Subscription[] = (statusData || [])
        .reduce((acc: Subscription[], sub) => {
          // Verificăm dacă am procesat deja acest meșter
          if (!processedIds.has(sub.craftsman_id)) {
            processedIds.add(sub.craftsman_id);
            
            const subscription: Subscription = {
              id: sub.craftsman_id,
              craftsman_id: sub.craftsman_id,
              craftsman_name: `${sub.profiles.first_name || ''} ${sub.profiles.last_name || ''}`.trim() || 'N/A',
              craftsman_email: sub.profiles.email || 'N/A',
              status: sub.is_subscription_active ? 'active' : 'inactive',
              end_date: sub.subscription_end_date
            };

            // Aplicăm filtrul de căutare
            const searchLower = filters.search.toLowerCase();
            if (
              subscription.craftsman_name.toLowerCase().includes(searchLower) ||
              subscription.craftsman_email.toLowerCase().includes(searchLower)
            ) {
              acc.push(subscription);
            }
          }
          return acc;
        }, [])
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
    fetchSubscriptions();
  }, [filters]);

  useEffect(() => {
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
