
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan, SubscriptionWithPayment } from "@/types/subscription";
import { toast } from "sonner";

export const SUBSCRIPTION_PRICES = {
  lunar: 99,
} as const;

export async function createPaymentIntent(plan: SubscriptionPlan) {
  try {
    console.log('Creating payment intent for plan:', plan);
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) {
      toast.error("Sesiunea a expirat. Te rugăm să te autentifici din nou.");
      throw new Error('Nu ești autentificat');
    }

    // Verifică doar abonamentele cu status activ și plată completată
    const { data: activeSubscription } = await supabase
      .from('subscriptions')
      .select(`
        *,
        payment:payments(*)
      `)
      .eq('craftsman_id', session.data.session?.user.id)
      .eq('status', 'active')
      .eq('payments.status', 'completed')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (activeSubscription) {
      toast.error('Ai deja un abonament activ');
      throw new Error('Ai deja un abonament activ');
    }

    const response = await supabase.functions.invoke('create-payment-intent', {
      body: {
        plan,
        amount: SUBSCRIPTION_PRICES[plan],
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'A apărut o eroare la crearea plății');
    }

    console.log('Payment intent created successfully');
    return response.data.clientSecret;
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
    .eq('payments.status', 'completed')
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
