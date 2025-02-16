
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

    if (!craftsman_id) {
      throw new Error('Craftsman ID is required');
    }

    // Creăm o plată în baza de date
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id,
        amount: plan === 'lunar' ? 299 : 2990,
        status: 'pending',
        plan
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';

    // Creăm sesiunea Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      client_reference_id: craftsman_id, // Adăugat aici
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

    // Actualizăm plata cu ID-ul sesiunii
    const { error: updateError } = await supabase
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    // Creăm abonamentul inactiv
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        craftsman_id,
        payment_id: payment.id,
        status: 'inactive',
        plan
      });

    if (subscriptionError) {
      throw subscriptionError;
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
