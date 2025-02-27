
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const signature = req.headers.get('stripe-signature');
  
  try {
    // Verificăm că am primit un signature valid
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Citim body-ul requestului
    const body = await req.text();
    console.log('Received webhook. Processing...');
    
    // Verificăm semnătura
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Webhook event type: ${event.type}`);

    // Creăm clientul Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Procesăm evenimentul
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful, processing checkout session:', session.id);

      // Preluăm ID-ul plății din client_reference_id sau metadata
      const paymentId = session.client_reference_id || session.metadata?.payment_id;
      
      if (!paymentId) {
        console.error('No payment ID found in the session');
        return new Response(
          JSON.stringify({ error: 'No payment ID found in the session' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing payment ID: ${paymentId}`);

      // Actualizăm starea plății
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          stripe_customer_id: session.customer,
        })
        .eq('id', paymentId)
        .select('craftsman_id, id')
        .single();

      if (paymentError) {
        console.error('Error updating payment status:', paymentError);
        return new Response(
          JSON.stringify({ error: `Error updating payment: ${paymentError.message}` }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment updated successfully:', paymentData);

      // Acum să calculăm data de sfârșit a abonamentului
      const startDate = new Date();
      // Presupunem abonament lunar (adăugăm 30 de zile)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      // Preluăm informații despre subscripție
      const { data: subscriptionData, error: subSelectError } = await supabase
        .from('subscriptions')
        .select('plan, id')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (subSelectError && subSelectError.code !== 'PGRST116') {
        console.error('Error getting subscription data:', subSelectError);
        // Continuăm totuși, nu e critic
      }

      const plan = subscriptionData?.plan || 'lunar';
      
      if (subscriptionData?.id) {
        // Actualizăm abonamentul existent
        console.log('Updating existing subscription ID:', subscriptionData.id);
        const { data: subscriptionUpdateData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          })
          .eq('id', subscriptionData.id)
          .select()
          .single();

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
        } else {
          console.log('Subscription updated successfully:', subscriptionUpdateData);
        }
      } else {
        // Creăm un nou abonament
        console.log('Creating new subscription for craftsman:', paymentData.craftsman_id);
        const { data: newSub, error: createSubError } = await supabase
          .from('subscriptions')
          .insert([{
            craftsman_id: paymentData.craftsman_id,
            status: 'active',
            plan,
            payment_id: paymentId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }])
          .select()
          .single();

        if (createSubError) {
          console.error('Error creating new subscription:', createSubError);
          return new Response(
            JSON.stringify({ error: `Error creating subscription: ${createSubError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.log('New subscription created successfully:', newSub);
        }
      }

      // Actualizăm manual și tabela de status pentru a fi siguri
      console.log('Force updating craftsman subscription status via RPC');
      const { error: statusUpdateError } = await supabase
        .rpc('update_craftsman_subscription_status', {
          p_craftsman_id: paymentData.craftsman_id,
          p_is_active: true,
          p_end_date: endDate.toISOString()
        });

      if (statusUpdateError) {
        console.error('Error updating craftsman subscription status:', statusUpdateError);
        // Continuăm totuși
      } else {
        console.log('Craftsman subscription status updated successfully');
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pentru orice alt tip de eveniment, doar confirmăm primirea
    return new Response(
      JSON.stringify({ received: true }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Error processing webhook: ${error.message}` }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
