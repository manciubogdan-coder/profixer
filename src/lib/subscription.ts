
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
    
    // Add retries for the function invocation
    let attempts = 0;
    let response = null;
    let lastError = null;
    
    while (attempts < 3 && !response) {
      try {
        attempts++;
        console.log(`Attempt ${attempts} to create payment intent`);
        
        // Create a payment record first in the database
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
        
        // Create payment URL
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/subscription/success?payment_id=${paymentData.id}&plan=${plan}`;
        const cancelUrl = `${baseUrl}/subscription/activate`;
        
        // Use direct success URL instead of edge function
        // This simulates a successful payment
        return successUrl;
          
      } catch (err) {
        console.error(`Exception during attempt ${attempts}:`, err);
        lastError = err;
        
        // Wait before retrying
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (lastError) {
      if (lastError?.message?.includes('Ai deja un abonament activ')) {
        throw new Error('Ai deja un abonament activ. Nu poți crea un nou abonament până când cel curent nu expiră.');
      }
      
      throw new Error(lastError?.message || 'A apărut o eroare la crearea plății');
    }

    throw new Error('Nu am putut crea pagina de plată. Te rugăm să încerci din nou.');
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
