
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

interface SubscriptionStatus {
  craftsman_id: string;
  subscription_status: string | null;
  subscription_end_date: string | null;
  is_subscription_active: boolean | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
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
      // Folosim două query-uri separate pentru a evita problemele cu tipurile
      const { data: statusesRaw, error: statusError } = await supabase
        .from('craftsman_subscription_status')
        .select('craftsman_id, subscription_status, subscription_end_date, is_subscription_active');

      if (statusError) throw statusError;

      // Obținem informațiile despre utilizatori separat
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', statusesRaw?.map(s => s.craftsman_id) || []);

      if (profilesError) throw profilesError;

      // Creăm un map pentru profiluri pentru lookup rapid
      const profileMap = new Map(
        profiles?.map(p => [p.id, p]) || []
      );

      const formattedSubscriptions: Subscription[] = (statusesRaw || []).map(status => {
        const profile = profileMap.get(status.craftsman_id);
        return {
          id: status.craftsman_id,
          craftsman_id: status.craftsman_id,
          craftsman_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'N/A',
          craftsman_email: profile?.email || 'N/A',
          status: status.is_subscription_active ? 'active' as const : 'inactive' as const,
          end_date: status.subscription_end_date
        };
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
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('craftsman_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingSubscription) {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            craftsman_id: subscriptionId,
            end_date: newDate.toISOString(),
            status: 'active',
            plan: 'lunar'
          });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            end_date: newDate.toISOString(),
            status: 'active'
          })
          .eq('id', existingSubscription.id);
        if (updateError) throw updateError;
      }

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
