
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('No stripe signature found');
    return new Response('Webhook Error: No Stripe signature', { status: 400 });
  }

  try {
    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Tratăm evenimentul de plată finalizată
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment completed for session:', session.id);
      console.log('Client reference ID:', session.client_reference_id);

      // Găsim plata după metadata sau ID
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: session.id
        })
        .eq('status', 'pending')
        .eq('craftsman_id', session.client_reference_id)
        .select()
        .single();

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
        return new Response('Error updating payment', { status: 500 });
      }

      if (!payment) {
        console.error('No payment found to update');
        return new Response('No payment found', { status: 404 });
      }

      console.log('Payment updated successfully:', payment.id);

      // Actualizăm abonamentul
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 zile
        })
        .eq('payment_id', payment.id);

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        return new Response('Error updating subscription', { status: 500 });
      }

      console.log('Subscription activated successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
