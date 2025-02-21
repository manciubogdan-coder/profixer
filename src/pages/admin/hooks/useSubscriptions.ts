
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
      // Obținem numărul total de meșteri
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'professional');

      const { data: activeListings } = await supabase
        .from('job_listings')
        .select('id')
        .eq('status', 'active');

      // Obținem statusul cel mai recent pentru fiecare meșter
      const { data: subscriptionStatuses } = await supabase
        .from('craftsman_subscription_status')
        .select('craftsman_id, is_subscription_active')
        .order('subscription_end_date', { ascending: false });

      if (subscriptionStatuses) {
        // Folosim Map pentru a păstra doar cel mai recent status pentru fiecare meșter
        const statusMap = new Map();
        subscriptionStatuses.forEach(status => {
          if (!statusMap.has(status.craftsman_id)) {
            statusMap.set(status.craftsman_id, status.is_subscription_active);
          }
        });

        // Numărăm meșterii activi și expirați
        let activeCount = 0;
        let expiredCount = 0;
        statusMap.forEach(isActive => {
          if (isActive) {
            activeCount++;
          } else {
            expiredCount++;
          }
        });

        setStats({
          totalUsers: users?.length || 0,
          activeListings: activeListings?.length || 0,
          activeSubscriptions: activeCount,
          expiredSubscriptions: expiredCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Nu am putut încărca statisticile');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Obținem cel mai recent status pentru fiecare meșter
      const { data: statusesRaw, error: statusError } = await supabase
        .from('craftsman_subscription_status')
        .select('*')
        .order('subscription_end_date', { ascending: false });

      if (statusError) throw statusError;

      // Folosim Map pentru a păstra doar cel mai recent status pentru fiecare meșter
      const uniqueStatuses = new Map();
      statusesRaw?.forEach(status => {
        if (!uniqueStatuses.has(status.craftsman_id)) {
          uniqueStatuses.set(status.craftsman_id, status);
        }
      });

      // Convertim Map înapoi în array
      const latestStatuses = Array.from(uniqueStatuses.values());

      // Obținem profilurile doar pentru meșterii din lista noastră
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles_with_email')
        .select('id, first_name, last_name, email')
        .in('id', latestStatuses.map(s => s.craftsman_id));

      if (profilesError) throw profilesError;

      // Creăm un Map pentru profiluri pentru lookup rapid
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Formatăm datele pentru afișare
      const formattedSubscriptions: Subscription[] = latestStatuses.map(status => {
        const profile = profileMap.get(status.craftsman_id);
        return {
          id: status.craftsman_id,
          craftsman_id: status.craftsman_id,
          craftsman_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'N/A',
          craftsman_email: profile?.email || 'N/A',
          status: status.is_subscription_active ? 'active' : 'inactive',
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
