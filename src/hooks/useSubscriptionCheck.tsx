
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscriptionCheck = (shouldCheck: boolean = true) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('craftsman_subscription_status')
        .select('*')
        .eq('craftsman_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      console.log("Subscription status data:", data);
      return data;
    },
    enabled: !!user && profile?.role === 'professional',
    refetchInterval: 30000, // Verificăm statusul la fiecare 30 secunde
  });

  useEffect(() => {
    if (!shouldCheck || !profile) return;

    if (profile.role === 'professional') {
      if (!subscriptionStatus?.is_subscription_active) {
        toast.error('Abonamentul tău a expirat. Te rugăm să îl reînnoiești pentru a continua.');
        navigate('/subscription/activate');
      }
    }
  }, [shouldCheck, profile, subscriptionStatus, navigate]);

  const refreshSubscriptionStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status', user?.id] });
  };

  return {
    isLoading: profileLoading || subscriptionLoading,
    isProfessional: profile?.role === 'professional',
    hasActiveSubscription: subscriptionStatus?.is_subscription_active ?? false,
    refreshSubscriptionStatus,
  };
};
