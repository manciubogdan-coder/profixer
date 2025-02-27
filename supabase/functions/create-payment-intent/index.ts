
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

// Definim cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Gestionăm CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function started');
    
    // Verificăm dacă secretul Stripe există
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      throw new Error('Configurație lipsă: STRIPE_SECRET_KEY nu este setat. Contactați administratorul.');
    }

    // Inițializăm Stripe
    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Procesăm request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (err) {
      console.error('Failed to parse request body:', err);
      throw new Error('Eroare la parsarea datelor de cerere');
    }
    
    const { craftsman_id, plan } = requestData;
    console.log('Request data:', { craftsman_id, plan });

    if (!craftsman_id) {
      throw new Error('ID-ul meșterului este necesar');
    }

    // Inițializăm Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials are not set');
      throw new Error('Configurație lipsă: credențialele Supabase nu sunt setate. Contactați administratorul.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificăm abonamentul existent
    console.log('Checking existing subscription');
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (subError) {
      console.error('Error checking subscription:', subError);
      if (subError.code !== 'PGRST116') {
        throw new Error(`Eroare la verificarea abonamentului: ${subError.message}`);
      }
    }

    if (existingSub) {
      console.log('User already has active subscription:', existingSub);
      throw new Error('Ai deja un abonament activ');
    }

    // Creăm plata
    console.log('Creating payment record');
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id,
        amount: 99,
        currency: 'RON',
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      throw new Error(`Eroare la crearea plății: ${paymentError.message}`);
    }

    console.log('Payment record created:', payment);

    // Obținem prețul din variabile de mediu sau folosim un preț de test
    let priceId = Deno.env.get('STRIPE_PRICE_ID');
    
    if (!priceId) {
      console.warn('STRIPE_PRICE_ID is not set, attempting to create a price');
      
      // Creăm un produs de test dacă nu există price ID
      const product = await stripe.products.create({
        name: 'Abonament Profixer Lunar',
      });
      
      // Creăm un preț pentru produsul de test
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 9900, // 99 RON în cenți
        currency: 'ron',
      });
      
      priceId = price.id;
      console.log('Created test price ID:', priceId);
    }

    console.log('Using price ID:', priceId);

    // Creăm sesiunea Stripe
    console.log('Creating Stripe checkout session');
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/subscription/success?payment_id=${payment.id}&plan=${plan}`,
      cancel_url: `${origin}/subscription/activate`,
      client_reference_id: payment.id,
      metadata: {
        payment_id: payment.id,
        craftsman_id: craftsman_id
      }
    });

    console.log('Checkout session created:', { id: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'A apărut o eroare internă',
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
