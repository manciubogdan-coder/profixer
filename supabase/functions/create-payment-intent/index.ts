
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { craftsman_id, plan = 'lunar' } = await req.json();
    console.log('Received request with craftsman_id:', craftsman_id, 'and plan:', plan);

    if (!craftsman_id) {
      throw new Error('Craftsman ID is required');
    }

    // Verificăm dacă utilizatorul are deja un abonament activ
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error checking existing subscription:', subscriptionError);
      throw subscriptionError;
    }

    if (existingSubscription) {
      throw new Error('Ai deja un abonament activ');
    }

    // Creăm o plată în baza de date
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id,
        amount: plan === 'lunar' ? 299 : 2990,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw paymentError;
    }

    console.log('Created payment record:', payment.id);

    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';

    // Creăm sesiunea Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      client_reference_id: craftsman_id,
      line_items: [
        {
          price: plan === 'lunar' ? 'price_1QtCCEDYsHU2MI0nVeNPZrGe' : 'price_1QtCCEDYsHU2MI0nF0PvB3x5',
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success`,
      cancel_url: `${baseUrl}/subscription/activate`,
      currency: 'ron',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        payment_id: payment.id,
      },
    });

    console.log('Created Stripe session:', session.id);

    // Actualizăm plata cu ID-ul sesiunii
    const { error: updateError } = await supabase
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment with session ID:', updateError);
      throw updateError;
    }

    // Creăm abonamentul inactiv
    const { error: subscriptionCreateError } = await supabase
      .from('subscriptions')
      .insert({
        craftsman_id,
        payment_id: payment.id,
        status: 'inactive',
        plan
      });

    if (subscriptionCreateError) {
      console.error('Error creating subscription:', subscriptionCreateError);
      throw subscriptionCreateError;
    }

    console.log('Subscription record created (inactive)');

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
