
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@12.12.0?dts';

// Configurare CORS pentru a permite accesul de la aplicația web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Folosim cheia secretă în modul live, nu în modul test
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Verificăm dacă este un request POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extragem datele din request
    const { craftsman_id, plan } = await req.json();

    console.log(`Processing payment intent for craftsman: ${craftsman_id}, plan: ${plan}`);

    if (!craftsman_id) {
      throw new Error('ID-ul meșterului lipsește');
    }

    // Verificăm dacă meșterul există
    const { data: craftsman, error: craftsmanError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', craftsman_id)
      .eq('role', 'professional')
      .single();

    if (craftsmanError || !craftsman) {
      throw new Error(`Meșterul nu a fost găsit: ${craftsmanError?.message || 'Unknown error'}`);
    }

    // Verificăm dacă meșterul are deja un abonament activ
    const { data: activeSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Eroare la verificarea abonamentului: ${subError.message}`);
    }

    if (activeSub) {
      throw new Error(`Ai deja un abonament activ până la ${new Date(activeSub.end_date).toLocaleDateString()}`);
    }

    // Determinăm prețul în funcție de plan
    const amount = plan === 'anual' ? 1990 : 199; // 199 RON lunar sau 1990 RON anual
    const planName = plan === 'anual' ? 'Anual' : 'Lunar';

    console.log(`Creating payment with amount: ${amount} RON for plan: ${planName}`);

    // Creăm o nouă înregistrare de plată în baza de date
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id,
        amount,
        status: 'pending',
        plan,
        payment_type: 'stripe'
      })
      .select('id')
      .single();

    if (paymentError) {
      throw new Error(`Eroare la crearea înregistrării de plată: ${paymentError.message}`);
    }

    // Creăm o sesiune de checkout cu Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Abonament ProFixer ${planName}`,
              description: `Acces la toate funcționalitățile platformei ProFixer timp de ${plan === 'anual' ? '12 luni' : '1 lună'}`,
            },
            unit_amount: amount * 100, // Stripe folosește cenți
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription/success?payment_id=${payment.id}&plan=${plan}`,
      cancel_url: `${req.headers.get('origin')}/subscription/activate`,
      client_reference_id: craftsman_id,
      metadata: {
        payment_id: payment.id,
        plan: plan,
      },
    });

    // Actualizăm înregistrarea de plată cu ID-ul sesiunii Stripe
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        stripe_payment_id: session.id,
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error(`Eroare la actualizarea înregistrării de plată: ${updateError.message}`);
    }

    console.log(`Payment session created: ${session.id}, redirecting to: ${session.url}`);

    // Înregistrăm abonamentul cu status pending
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (plan === 'anual' ? 365 : 30));

    const { error: subCreateError } = await supabase
      .from('subscriptions')
      .insert({
        craftsman_id,
        status: 'pending',
        plan,
        payment_id: payment.id,
        stripe_subscription_id: session.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

    if (subCreateError) {
      console.error(`Eroare la crearea abonamentului: ${subCreateError.message}`);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
