
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

// CORS headers simplificați
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
    
    // Obținem datele cererii
    const requestData = await req.json();
    const { craftsman_id, plan } = requestData;
    
    console.log('Request data:', { craftsman_id, plan });
    
    if (!craftsman_id) {
      throw new Error('ID-ul meșterului este necesar');
    }
    
    // Inițializăm Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Inițializăm Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Creăm plata în baza de date
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
      throw new Error(`Eroare la crearea plății`);
    }
    
    // Creăm produsul și prețul pentru Stripe
    const product = await stripe.products.create({
      name: 'Abonament Profixer Lunar',
      description: 'Abonament lunar pentru meșteri pe platforma Profixer',
    });
    
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // 99 RON în cenți
      currency: 'ron',
    });
    
    // Creăm sesiunea de checkout
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/subscription/success?payment_id=${payment.id}&plan=${plan}`,
      cancel_url: `${origin}/subscription/activate`,
      client_reference_id: payment.id,
      metadata: {
        payment_id: payment.id,
        craftsman_id
      }
    });
    
    // Returnăm URL-ul de checkout
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Returnăm o eroare standardizată
    return new Response(
      JSON.stringify({ error: error.message || 'A apărut o eroare' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
