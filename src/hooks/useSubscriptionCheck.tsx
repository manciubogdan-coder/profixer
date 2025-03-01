
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

  // Check if current date is before July 1, 2025
  const isBeforeJuly2025 = new Date() < new Date("2025-07-01T00:00:00Z");

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
        .from('craftsman_subscription_status_latest')
        .select('*')
        .eq('craftsman_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      console.log("Subscription status data:", data);
      return data;
    },
    enabled: !!user && profile?.role === 'professional' && !isBeforeJuly2025,
    refetchInterval: 30000, // Verificăm statusul la fiecare 30 secunde
  });

  useEffect(() => {
    // Skip subscription check before July 1, 2025
    if (isBeforeJuly2025) return;
    
    if (!shouldCheck || !profile) return;

    if (profile.role === 'professional') {
      if (!subscriptionStatus?.is_subscription_active) {
        toast.error('Abonamentul tău a expirat. Te rugăm să îl reînnoiești pentru a continua.');
        navigate('/subscription/activate');
      }
    }
  }, [shouldCheck, profile, subscriptionStatus, navigate, isBeforeJuly2025]);

  const refreshSubscriptionStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status', user?.id] });
  };

  return {
    isLoading: profileLoading || subscriptionLoading,
    isProfessional: profile?.role === 'professional',
    hasActiveSubscription: isBeforeJuly2025 ? true : (subscriptionStatus?.is_subscription_active ?? false),
    refreshSubscriptionStatus,
  };
};
