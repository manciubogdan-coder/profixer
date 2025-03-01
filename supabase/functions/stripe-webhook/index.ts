
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-08-01',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log("Hello from Stripe webhook!");

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body
    const requestBody = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        requestBody,
        signature,
        webhookSecret || ''
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle the event
    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { payment_id, craftsman_id, plan } = session.metadata || {};

        console.log(`Payment ${payment_id} completed for craftsman ${craftsman_id} with plan ${plan}`);

        if (!payment_id) {
          console.error("Missing payment_id in metadata");
          return new Response(JSON.stringify({ error: 'Missing payment_id in metadata' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Update the payment status to completed
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('id', payment_id);

        if (paymentError) {
          console.error(`Error updating payment: ${paymentError.message}`);
          return new Response(JSON.stringify({ error: `Error updating payment: ${paymentError.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Calculate the subscription end date based on the plan
        const startDate = new Date();
        const endDate = new Date(startDate);
        
        if (plan === 'lunar') {
          endDate.setDate(endDate.getDate() + 30); // 30 days subscription
        } else if (plan === 'anual') {
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription
        }

        // Update the subscription status to active and set dates
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          })
          .eq('payment_id', payment_id);

        if (subscriptionError) {
          console.error(`Error updating subscription: ${subscriptionError.message}`);
          return new Response(JSON.stringify({ error: `Error updating subscription: ${subscriptionError.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Update the craftsman's subscription status through RPC
        if (craftsman_id) {
          const { error: rpcError } = await supabase.rpc('update_craftsman_subscription_status', {
            p_craftsman_id: craftsman_id,
            p_is_active: true,
            p_end_date: endDate.toISOString()
          });

          if (rpcError) {
            console.error(`Error updating craftsman subscription status: ${rpcError.message}`);
            return new Response(JSON.stringify({ error: `Error updating craftsman subscription status: ${rpcError.message}` }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        break;
      }
      
      case 'charge.failed': {
        const charge = event.data.object;
        console.log(`Payment failed for charge: ${charge.id}`);
        
        // Try to find the payment with this Stripe ID
        const { data: payments, error: queryError } = await supabase
          .from('payments')
          .select('id')
          .eq('stripe_payment_id', charge.payment_intent)
          .limit(1);
          
        if (queryError) {
          console.error(`Error finding payment: ${queryError.message}`);
        } else if (payments && payments.length > 0) {
          const paymentId = payments[0].id;
          
          // Update the payment status to failed
          const { error: updateError } = await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', paymentId);
            
          if (updateError) {
            console.error(`Error updating payment status: ${updateError.message}`);
          }
        } else {
          console.log(`No payment found for failed charge: ${charge.id}`);
        }
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
