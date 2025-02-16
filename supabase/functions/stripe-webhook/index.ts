
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Webhook called with method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('No stripe signature found in headers');
    return new Response('Webhook Error: No Stripe signature', { 
      headers: corsHeaders,
      status: 400 
    });
  }

  if (!WEBHOOK_SECRET) {
    console.error('No webhook secret configured');
    return new Response('Webhook Error: No webhook secret configured', { 
      headers: corsHeaders,
      status: 500 
    });
  }

  try {
    const body = await req.text();
    let event;

    console.log('Attempting to verify webhook signature...');
    console.log('Webhook secret length:', WEBHOOK_SECRET.length);
    console.log('Signature received:', signature);

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
      console.log('Webhook signature verified successfully');
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      console.error('Received body:', body);
      return new Response(`Webhook Error: ${err.message}`, { 
        headers: corsHeaders,
        status: 400 
      });
    }

    console.log('Received Stripe webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed payment session:', session.id);

      const craftsman_id = session.client_reference_id;
      const plan = session.metadata?.plan || 'lunar';

      if (!craftsman_id) {
        console.error('No craftsman_id found in session');
        return new Response('No craftsman_id found', { 
          headers: corsHeaders,
          status: 400 
        });
      }

      console.log('Creating payment record for craftsman:', craftsman_id);

      // Creăm plata
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          craftsman_id,
          amount: session.amount_total / 100, // Convertim din cenți în RON
          currency: session.currency.toUpperCase(),
          status: 'completed',
          stripe_payment_id: session.id,
          stripe_customer_id: session.customer
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
        return new Response('Error creating payment: ' + paymentError.message, { 
          headers: corsHeaders,
          status: 500 
        });
      }

      console.log('Payment created:', payment.id);

      // Calculăm data de sfârșit
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (plan === 'lunar' ? 1 : 12));

      console.log('Creating subscription with dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Creăm abonamentul
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          craftsman_id,
          payment_id: payment.id,
          status: 'active',
          plan,
          stripe_subscription_id: session.subscription,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return new Response('Error creating subscription: ' + subscriptionError.message, { 
          headers: corsHeaders,
          status: 500 
        });
      }

      console.log('Subscription created successfully:', subscription.id);

      // Verificăm dacă abonamentul a fost într-adevăr creat și este activ
      const { data: verifySubscription, error: verifyError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('id', subscription.id)
        .single();

      if (verifyError) {
        console.error('Error verifying subscription:', verifyError);
      } else {
        console.log('Verified subscription status:', verifySubscription.status);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(`Webhook Error: ${err.message}`, { 
      headers: corsHeaders,
      status: 400 
    });
  }
});
