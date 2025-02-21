
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

      // Obținem numărul de abonamente active/expirate direct din tabela de status
      const { data: statusData } = await supabase
        .from('craftsman_subscription_status')
        .select('is_subscription_active');

      const activeSubscriptions = statusData?.filter(s => s.is_subscription_active).length || 0;
      const expiredSubscriptions = statusData?.filter(s => !s.is_subscription_active).length || 0;

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
        `)
        .order('subscription_end_date', { ascending: false });

      if (statusError) throw statusError;

      // Folosim Map pentru a păstra doar cel mai recent status pentru fiecare meșter
      const uniqueStatuses = new Map();
      statusData?.forEach(status => {
        if (!uniqueStatuses.has(status.craftsman_id)) {
          uniqueStatuses.set(status.craftsman_id, status);
        }
      });

      const formattedSubscriptions: Subscription[] = Array.from(uniqueStatuses.values()).map(sub => ({
        id: sub.craftsman_id,
        craftsman_id: sub.craftsman_id,
        craftsman_name: `${sub.profiles.first_name || ''} ${sub.profiles.last_name || ''}`.trim() || 'N/A',
        craftsman_email: sub.profiles.email || 'N/A',
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
