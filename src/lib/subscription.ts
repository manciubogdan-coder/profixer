
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan } from "@/types/subscription";

export const SUBSCRIPTION_PRICES = {
  lunar: 99,
} as const;

export async function createPaymentIntent(plan: SubscriptionPlan) {
  try {
    console.log('Creating payment intent for plan:', plan);
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Nu ești autentificat');
    }

    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        plan,
        amount: SUBSCRIPTION_PRICES[plan],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'A apărut o eroare la crearea plății');
    }

    const data = await response.json();
    console.log('Payment intent created successfully');
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function getActiveSubscription(craftsmanId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      payment:payments(*)
    `)
    .eq('craftsman_id', craftsmanId)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error);
    throw error;
  }

  return data;
}

export async function getSubscriptionHistory(craftsmanId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      payment:payments(*)
    `)
    .eq('craftsman_id', craftsmanId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscription history:', error);
    throw error;
  }

  return data;
}
