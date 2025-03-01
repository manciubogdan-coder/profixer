
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-08-01',
  httpClient: Stripe.createFetchHttpClient(),
});

console.log("Hello from Stripe Payment Intent!");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nu ești autorizat" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Nu ești autentificat", details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the request body
    const { craftsman_id, plan } = await req.json();
    
    if (!craftsman_id || !plan) {
      return new Response(
        JSON.stringify({ error: 'ID-ul meșterului și planul sunt obligatorii' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make sure the user is requesting for themselves
    if (user.id !== craftsman_id) {
      return new Response(
        JSON.stringify({ error: 'Nu poți crea un abonament pentru un alt utilizator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user already has an active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('craftsman_subscription_status_latest')
      .select('is_subscription_active, subscription_end_date')
      .eq('craftsman_id', craftsman_id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Error checking subscription:", subscriptionError);
    } else if (subscriptionData?.is_subscription_active && 
               subscriptionData?.subscription_end_date && 
               new Date(subscriptionData.subscription_end_date) > new Date()) {
      console.log("User already has an active subscription until:", subscriptionData.subscription_end_date);
      
      // Allow users to still purchase if they want to extend
      console.log("Allowing user to purchase a new subscription anyway");
    }

    // Determine price based on plan
    const priceAmount = plan === 'lunar' ? 19900 : 0; // 199 RON to cents

    // Create a payment record in the database
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        craftsman_id: craftsman_id,
        amount: 199, // Store as RON, not cents
        currency: 'RON',
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return new Response(
        JSON.stringify({ error: 'Nu am putut crea înregistrarea plății', details: paymentError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a subscription record for the payment
    const { error: subscriptionCreateError } = await supabaseClient
      .from('subscriptions')
      .insert({
        craftsman_id: craftsman_id,
        status: 'inactive',
        plan: plan,
        payment_id: paymentData.id,
        start_date: new Date().toISOString(),
        end_date: null
      });

    if (subscriptionCreateError) {
      console.error("Error creating subscription record:", subscriptionCreateError);
    }

    // Generate a Stripe Checkout URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Abonament ProFixer ${plan}`,
              description: 'Abonament la platforma ProFixer pentru profesioniști',
            },
            unit_amount: priceAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_id: paymentData.id,
        craftsman_id: craftsman_id,
        plan: plan
      },
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription/success?payment_id=${paymentData.id}&plan=${plan}`,
      cancel_url: `${req.headers.get('origin')}/subscription/activate`,
    });

    // Update the payment record with Stripe payment ID
    if (session.id) {
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          stripe_payment_id: session.id
        })
        .eq('id', paymentData.id);

      if (updateError) {
        console.error("Error updating payment record with Stripe ID:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'A apărut o eroare neașteptată', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
