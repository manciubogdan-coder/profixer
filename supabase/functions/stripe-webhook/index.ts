
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@12.12.0?dts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log(`Processing Stripe event: ${event.type}`);

    // Procesăm evenimentul de plată completată
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`Payment completed for session: ${session.id}`);

      // Extragem metadata pentru a identifica plata
      const paymentId = session.metadata?.payment_id;
      const plan = session.metadata?.plan;

      if (!paymentId) {
        throw new Error('Payment ID not found in session metadata');
      }

      console.log(`Updating payment with ID: ${paymentId} to completed`);

      // Actualizăm statusul plății în baza de date
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_details: session,
        })
        .eq('id', paymentId);

      if (paymentError) {
        console.error(`Error updating payment: ${paymentError.message}`);
        throw new Error(`Error updating payment: ${paymentError.message}`);
      }

      // Determinăm durata abonamentului în funcție de plan
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (plan === 'anual' ? 365 : 30));

      // Extragem ID-ul meșterului din plată
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('craftsman_id')
        .eq('id', paymentId)
        .single();

      if (fetchError) {
        console.error(`Error fetching payment: ${fetchError.message}`);
        throw new Error(`Error fetching payment: ${fetchError.message}`);
      }

      const craftsmanId = payment.craftsman_id;

      // Actualizăm abonamentul
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .eq('payment_id', paymentId);

      if (subError) {
        console.error(`Error updating subscription: ${subError.message}`);
        throw new Error(`Error updating subscription: ${subError.message}`);
      }

      // Actualizăm statusul abonamentului pentru meșter
      const { error: rpcError } = await supabase
        .rpc('update_craftsman_subscription_status', {
          p_craftsman_id: craftsmanId,
          p_is_active: true,
          p_end_date: endDate.toISOString()
        });

      if (rpcError) {
        console.error(`Error updating craftsman subscription status: ${rpcError.message}`);
      }

      console.log(`Successfully updated payment and subscription for craftsman: ${craftsmanId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
