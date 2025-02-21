
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
      // Obținem toți meșterii activi
      const { data: professionals, error: profError } = await supabase
        .from('user_profiles_with_email')
        .select('id, first_name, last_name, email')
        .eq('role', 'professional');

      if (profError) throw profError;
      if (!professionals) return;

      // Obținem cel mai recent abonament pentru fiecare meșter
      const { data: latestSubscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .in('craftsman_id', professionals.map(p => p.id))
        .order('created_at', { ascending: false });

      if (subError) throw subError;

      // Creăm un Map pentru a păstra doar cel mai recent abonament per meșter
      const latestSubscriptionMap = new Map();
      latestSubscriptions?.forEach(sub => {
        if (!latestSubscriptionMap.has(sub.craftsman_id)) {
          latestSubscriptionMap.set(sub.craftsman_id, sub);
        }
      });

      // Construim lista finală de abonamente
      const uniqueSubscriptions = professionals.map(prof => {
        const latestSubscription = latestSubscriptionMap.get(prof.id);
        
        return {
          id: prof.id,
          craftsman_id: prof.id,
          craftsman_name: `${prof.first_name} ${prof.last_name}`,
          craftsman_email: prof.email || 'N/A',
          status: (latestSubscription?.status === 'active' ? 'active' : 'inactive') as "active" | "inactive",
          end_date: latestSubscription?.end_date || null
        };
      });

      setSubscriptions(uniqueSubscriptions);
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
        .order('created_at', { ascending: false })
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
          .eq('id', existingSubscription.id); // Actualizăm după ID-ul specific al abonamentului
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
      await fetchSubscriptions();
      await fetchDashboardStats();
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
