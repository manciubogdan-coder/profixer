
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan } from "@/types/subscription";

// Vom folosi doar planul lunar deocamdată
export const SUBSCRIPTION_PRICES = {
  lunar: 199,
} as const;

export async function activateInitialSubscription(userId: string, endDate: Date = new Date(2025, 6, 1)) {
  try {
    console.log('Activating initial subscription for user:', userId);
    
    // Use RPC to update subscription status
    const { error } = await supabase.rpc('update_craftsman_subscription_status', {
      p_craftsman_id: userId,
      p_is_active: true,
      p_end_date: endDate.toISOString()
    });

    if (error) {
      console.error('Error activating initial subscription:', error);
      throw error;
    }

    console.log('Successfully activated initial subscription until:', endDate);
    return true;
  } catch (error) {
    console.error('Error in activateInitialSubscription:', error);
    return false;
  }
}

export async function createPaymentIntent(plan: SubscriptionPlan) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    
    if (!user) {
      throw new Error('Nu ești autentificat');
    }

    console.log('Creating payment link for user:', user.id);
    
    // Create a payment record in the database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id: user.id,
        amount: SUBSCRIPTION_PRICES[plan],
        currency: 'RON',
        status: 'pending'
      })
      .select()
      .single();
      
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error('Nu am putut crea înregistrarea plății');
    }
    
    console.log('Created payment record:', paymentData.id);
    
    // Create a simple success URL without using Stripe
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/subscription/success?payment_id=${paymentData.id}&plan=${plan}`;
    
    // Return the success URL directly - skipping payment process
    return successUrl;
      
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
}

export async function getActiveSubscription(craftsmanId: string) {
  try {
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
  } catch (error) {
    console.error('Error in getActiveSubscription:', error);
    return null;
  }
}

export async function getSubscriptionHistory(craftsmanId: string) {
  try {
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
  } catch (error) {
    console.error('Error in getSubscriptionHistory:', error);
    return [];
  }
}
