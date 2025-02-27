
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

console.log("Stripe Webhook Secret: " + Deno.env.get('STRIPE_WEBHOOK_SECRET'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { craftsman_id, plan } = await req.json();
    console.log(`Creating payment intent for craftsman: ${craftsman_id}, plan: ${plan}`);

    if (!craftsman_id) {
      return new Response(
        JSON.stringify({ error: 'Missing craftsman_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if craftsman exists
    const { data: craftsman, error: craftsmanError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', craftsman_id)
      .single();

    if (craftsmanError || !craftsman) {
      console.error('Error fetching craftsman:', craftsmanError);
      return new Response(
        JSON.stringify({ error: 'Craftsman not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if craftsman already has an active subscription
    const { data: activeSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (activeSubscription) {
      console.log('Craftsman already has an active subscription:', activeSubscription);
      return new Response(
        JSON.stringify({ error: 'Ai deja un abonament activ care va expira la ' + new Date(activeSubscription.end_date).toLocaleDateString() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get price from the subscription plan
    let amount = 0;
    if (plan === 'lunar') {
      amount = 99; // RON
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          craftsman_id,
          amount,
          currency: 'RON',
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created payment record:', payment);

    // Create a checkout session
    const success_url = `https://profixer.ro/subscription/success?payment_id=${payment.id}&plan=${plan}`;
    const cancel_url = 'https://profixer.ro/subscription/activate';

    console.log(`Success URL: ${success_url}`);
    console.log(`Cancel URL: ${cancel_url}`);

    // Create a temporary subscription record linked to the payment
    const { error: subscriptionInsertError } = await supabase
      .from('subscriptions')
      .insert([
        {
          craftsman_id,
          status: 'inactive',
          plan,
          payment_id: payment.id,
          start_date: new Date().toISOString(),
          end_date: null,
        }
      ]);

    if (subscriptionInsertError) {
      console.error('Error creating temporary subscription record:', subscriptionInsertError);
      // Continue anyway, not critical
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Abonament Profixer ${plan === 'lunar' ? 'Lunar' : 'Anual'}`,
              description: `Abonament Profixer ${plan === 'lunar' ? 'Lunar' : 'Anual'} - acces la toate funcționalitățile platformei`,
            },
            unit_amount: amount * 100, // Stripe expects amount in smallest currency unit (bani)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url,
      cancel_url,
      client_reference_id: payment.id,
      customer_email: craftsman.email,
      metadata: {
        payment_id: payment.id,
        craftsman_id,
        plan,
      },
    });

    console.log('Created Stripe checkout session:', session.id);

    // Update payment record with Stripe session ID
    const { error: updateError } = await supabase
      .from('payments')
      .update({ stripe_payment_id: session.id })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment record with Stripe session ID:', updateError);
      // Continue anyway
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
