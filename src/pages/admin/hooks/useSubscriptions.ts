
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

      // Folosim RPC pentru a obține statusurile corecte
      const { data: subscriptionStats } = await supabase
        .rpc('get_subscription_statistics');

      setStats({
        totalUsers: totalUsers || 0,
        activeListings: activeListings || 0,
        activeSubscriptions: subscriptionStats?.[0]?.active_subscriptions || 0,
        expiredSubscriptions: subscriptionStats?.[0]?.expired_subscriptions || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Folosim DISTINCT ON pentru a obține doar cel mai recent status pentru fiecare meșter
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('craftsman_subscription_status_latest')
        .select(`
          craftsman_id,
          is_subscription_active,
          subscription_end_date,
          profile:profiles!inner(
            first_name,
            last_name,
            email
          )
        `)
        .order('subscription_end_date', { ascending: false });

      if (subscriptionError) throw subscriptionError;

      const formattedSubscriptions: Subscription[] = (subscriptionData || []).map(sub => ({
        id: sub.craftsman_id,
        craftsman_id: sub.craftsman_id,
        craftsman_name: `${sub.profile.first_name || ''} ${sub.profile.last_name || ''}`.trim() || 'N/A',
        craftsman_email: sub.profile.email || 'N/A',
        status: sub.is_subscription_active ? 'active' : 'inactive',
        end_date: sub.subscription_end_date
      }));

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
