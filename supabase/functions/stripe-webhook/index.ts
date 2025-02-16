
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment completed for session:', session.id);

      const craftsman_id = session.client_reference_id;
      const plan = session.metadata?.plan || 'lunar';

      if (!craftsman_id) {
        console.error('No craftsman_id found in session');
        return new Response('No craftsman_id found', { status: 400 });
      }

      // Creăm plata
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          craftsman_id,
          amount: plan === 'lunar' ? 299 : 2990,
          status: 'completed',
          stripe_payment_id: session.id,
          stripe_customer_id: session.customer
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
        return new Response('Error creating payment', { status: 500 });
      }

      console.log('Payment created:', payment.id);

      // Calculăm data de sfârșit
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (plan === 'lunar' ? 1 : 12));

      // Creăm abonamentul
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          craftsman_id,
          payment_id: payment.id,
          status: 'active',
          plan,
          stripe_subscription_id: session.subscription,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return new Response('Error creating subscription', { status: 500 });
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
