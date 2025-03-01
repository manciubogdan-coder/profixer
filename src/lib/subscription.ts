
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan } from "@/types/subscription";

// Vom folosi doar planul lunar deocamdată
export const SUBSCRIPTION_PRICES = {
  lunar: 199,
} as const;

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
        
        response = await supabase.functions.invoke('create-payment-intent', {
          body: {
            craftsman_id: user.id,
            plan,
          }
        });
        
        if (response.error) {
          console.error(`Error response (attempt ${attempts}):`, response.error);
          lastError = response.error;
          response = null;
          
          // Wait before retrying
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (err) {
        console.error(`Exception during attempt ${attempts}:`, err);
        lastError = err;
        
        // Wait before retrying
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    if (!response || response.error) {
      if (lastError?.message?.includes('Ai deja un abonament activ')) {
        throw new Error('Ai deja un abonament activ. Nu poți crea un nou abonament până când cel curent nu expiră.');
      }
      
      throw new Error(lastError?.message || 'A apărut o eroare la crearea plății');
    }

    return response.data.url;
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
