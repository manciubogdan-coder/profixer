
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

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeListings: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

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

      const { data: statusData } = await supabase
        .from('craftsman_subscription_status')
        .select('is_subscription_active');

      // Calculăm statusurile unice
      const uniqueStatuses = new Set(statusData?.map(s => s.craftsman_id));
      const activeSubscriptions = statusData?.filter(s => s.is_subscription_active).length || 0;
      const expiredSubscriptions = uniqueStatuses.size - activeSubscriptions;

      setStats({
        totalUsers: totalUsers || 0,
        activeListings: activeListings || 0,
        activeSubscriptions,
        expiredSubscriptions
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Obținem doar cel mai recent status pentru fiecare meșter
      const { data: statusData, error: statusError } = await supabase
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
        `);

      if (statusError) throw statusError;

      // Păstrăm doar cel mai recent status pentru fiecare meșter
      const latestStatuses = new Map();
      statusData?.forEach(status => {
        const existingStatus = latestStatuses.get(status.craftsman_id);
        if (!existingStatus || new Date(status.subscription_end_date) > new Date(existingStatus.subscription_end_date)) {
          latestStatuses.set(status.craftsman_id, status);
        }
      });

      const formattedSubscriptions: Subscription[] = Array.from(latestStatuses.values())
        .map(sub => ({
          id: sub.craftsman_id,
          craftsman_id: sub.craftsman_id,
          craftsman_name: `${sub.profiles.first_name || ''} ${sub.profiles.last_name || ''}`.trim() || 'N/A',
          craftsman_email: sub.profiles.email || 'N/A',
          status: sub.is_subscription_active ? 'active' : 'inactive',
          end_date: sub.subscription_end_date
        }))
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
    fetchDashboardStats();
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    stats,
    loading,
    updateSubscriptionDate,
  };
};
