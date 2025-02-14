
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Paginile care nu necesită verificarea abonamentului
const EXEMPT_PATHS = [
  '/subscription/activate',
  '/subscription/checkout',
  '/subscription/success',
  '/profile/me',
  '/'
];

export const useSubscriptionCheck = (shouldCheck: boolean = true) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        .from('craftsman_subscription_status')
        .select('*')
        .eq('craftsman_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && profile?.role === 'professional',
  });

  useEffect(() => {
    if (!shouldCheck || !profile) return;

    // Nu verificăm abonamentul pentru paginile exceptate
    if (EXEMPT_PATHS.some(path => location.pathname.startsWith(path))) {
      return;
    }

    if (profile.role === 'professional') {
      const isActive = subscription?.is_subscription_active;

      if (!isActive) {
        toast.error('Abonamentul tău a expirat. Te rugăm să îl reînnoiești pentru a continua.');
        navigate('/subscription/activate');
      }
    }
  }, [shouldCheck, profile, subscription, navigate, location]);

  return {
    isLoading: !profile,
    isProfessional: profile?.role === 'professional',
    hasActiveSubscription: subscription?.is_subscription_active || false,
    subscriptionStatus: subscription?.subscription_status || 'inactive',
    subscriptionEndDate: subscription?.subscription_end_date || null,
  };
};
