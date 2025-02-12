
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscriptionCheck = (shouldCheck: boolean = true) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
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

  const { data: subscription } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('craftsman_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && profile?.role === 'professional',
  });

  useEffect(() => {
    if (!shouldCheck || !profile) return;

    if (profile.role === 'professional') {
      const isActive = subscription && 
        subscription.status === 'active' && 
        new Date(subscription.end_date) > new Date();

      if (!isActive) {
        toast.error('Abonamentul tău a expirat. Te rugăm să îl reînnoiești pentru a continua.');
        navigate('/subscription/activate');
      }
    }
  }, [shouldCheck, profile, subscription, navigate]);

  return {
    isLoading: !profile,
    isProfessional: profile?.role === 'professional',
    hasActiveSubscription: subscription?.status === 'active' && new Date(subscription?.end_date) > new Date(),
  };
};
