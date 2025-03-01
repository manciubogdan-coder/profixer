
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan } from "@/types/subscription";

// Vom folosi doar planul lunar deocamdată
export const SUBSCRIPTION_PRICES = {
  lunar: 199,
} as const;

export async function createPaymentIntent(plan: SubscriptionPlan) {
  try {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    
    if (!user) {
      throw new Error('Nu ești autentificat');
    }

    console.log('Auto-activating subscription for user:', user.id);
    
    // Instead of creating a payment intent, we'll directly activate the subscription
    // until July 1, 2025
    const targetEndDate = new Date('2025-07-01T23:59:59');
    
    const { error } = await supabase
      .rpc('update_craftsman_subscription_status', {
        p_craftsman_id: user.id,
        p_is_active: true,
        p_end_date: targetEndDate.toISOString()
      });

    if (error) {
      console.error('Error activating subscription:', error);
      throw new Error('A apărut o eroare la activarea abonamentului');
    }

    // Return success page URL instead of payment URL
    return window.location.origin + '/subscription/success?payment_id=auto_activated&plan=' + plan;
  } catch (error) {
    console.error('Error creating subscription:', error);
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
