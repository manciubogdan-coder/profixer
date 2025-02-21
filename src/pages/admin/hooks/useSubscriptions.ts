
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
      const { data: users } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' });

      const { data: activeListings } = await supabase
        .from('job_listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const { data: activeSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('*', { count: 'exact' })
        .eq('is_subscription_active', true);

      const { data: expiredSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('*', { count: 'exact' })
        .eq('is_subscription_active', false);

      setStats({
        totalUsers: users?.length || 0,
        activeListings: activeListings?.length || 0,
        activeSubscriptions: activeSubscriptions?.length || 0,
        expiredSubscriptions: expiredSubscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data: professionals, error: profError } = await supabase
        .from('user_profiles_with_email')
        .select('id, first_name, last_name, email')
        .eq('role', 'professional');

      if (profError) throw profError;
      if (!professionals) return;

      const { data: subscriptionsData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('craftsman_id', professionals.map(p => p.id));

      if (subError) throw subError;

      const combinedSubscriptions = professionals.map(prof => {
        const subscription = subscriptionsData?.find(s => s.craftsman_id === prof.id);
        
        return {
          id: prof.id,
          craftsman_id: prof.id,
          craftsman_name: `${prof.first_name} ${prof.last_name}`,
          craftsman_email: prof.email || 'N/A',
          status: (subscription?.status === 'active' ? 'active' : 'inactive') as "active" | "inactive",
          end_date: subscription?.end_date || null
        };
      });

      setSubscriptions(combinedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Nu am putut încărca lista de abonamente');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionDate = async (subscriptionId: string, newDate: Date) => {
    try {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('craftsman_id', subscriptionId)
        .maybeSingle();

      if (!existingSubscription) {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            craftsman_id: subscriptionId,
            end_date: newDate.toISOString(),
            status: 'active',
            plan: 'lunar'
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            end_date: newDate.toISOString(),
            status: 'active'
          })
          .eq('craftsman_id', subscriptionId);
        if (error) throw error;
      }

      toast.success('Data abonamentului a fost actualizată');
      fetchSubscriptions();
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
