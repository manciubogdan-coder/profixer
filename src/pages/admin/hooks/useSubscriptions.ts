
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
      // Modificăm query-urile pentru a obține numere corecte
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'professional');

      const { data: activeListings } = await supabase
        .from('job_listings')
        .select('id, client_id')
        .eq('status', 'active');

      // Folosim distinct pe craftsman_id pentru a număra meșterii unici
      const { data: activeSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('craftsman_id')
        .eq('is_subscription_active', true);

      const { data: expiredSubscriptions } = await supabase
        .from('craftsman_subscription_status')
        .select('craftsman_id')
        .eq('is_subscription_active', false);

      // Folosim Set pentru a număra meșterii unici
      const uniqueActiveSubscriptions = new Set(activeSubscriptions?.map(sub => sub.craftsman_id));
      const uniqueExpiredSubscriptions = new Set(expiredSubscriptions?.map(sub => sub.craftsman_id));

      setStats({
        totalUsers: users?.length || 0,
        activeListings: activeListings?.length || 0,
        activeSubscriptions: uniqueActiveSubscriptions.size,
        expiredSubscriptions: uniqueExpiredSubscriptions.size
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Obținem doar cel mai recent status pentru fiecare meșter
      const { data: statusesRaw, error: statusError } = await supabase
        .from('craftsman_subscription_status')
        .select('craftsman_id, subscription_status, subscription_end_date, is_subscription_active')
        .order('subscription_end_date', { ascending: false });

      if (statusError) throw statusError;

      // Filtrăm pentru a păstra doar cel mai recent status pentru fiecare meșter
      const uniqueStatuses = statusesRaw.reduce((acc, current) => {
        if (!acc.has(current.craftsman_id)) {
          acc.set(current.craftsman_id, current);
        }
        return acc;
      }, new Map());

      const typedStatuses = Array.from(uniqueStatuses.values()) as SubscriptionStatus[];

      // Obținem doar profilurile pentru meșterii din lista de abonamente
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles_with_email')
        .select('id, first_name, last_name, email')
        .in('id', typedStatuses.map(s => s.craftsman_id));

      if (profilesError) throw profilesError;

      const typedProfiles = (profiles || []) as Array<{
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
      }>;

      // Creăm un map pentru profiluri pentru lookup rapid
      const profileMap = new Map(
        typedProfiles.map(p => [p.id, p])
      );

      const formattedSubscriptions: Subscription[] = typedStatuses.map(status => {
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
