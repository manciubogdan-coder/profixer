
// Follow this setup guide to integrate the Stripe API with your Supabase function:
// https://supabase.com/docs/guides/functions/secrets
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Import the cors configuration
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  craftsman_id: string;
  plan: 'lunar' | 'anual';
}

const PRICE_MAP = {
  'lunar': 199 * 100,  // 199 RON in bani (smallest currency unit)
  'anual': 1999 * 100  // 1999 RON in bani (if annual plan is added later)
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Configurare Stripe
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID'); // Prețul Stripe (opțional)
    
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret key');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15', // Use a consistent API version
      httpClient: Stripe.createFetchHttpClient(), // Necessary for Deno
    });
    
    // Extract request body
    const requestData: RequestBody = await req.json();
    const { craftsman_id, plan } = requestData;

    if (!craftsman_id) {
      throw new Error('Missing craftsman_id');
    }
    
    if (!plan || !['lunar', 'anual'].includes(plan)) {
      throw new Error('Invalid plan type');
    }
    
    // Setup Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if craftsman exists
    const { data: craftsman, error: craftsmanError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', craftsman_id)
      .eq('role', 'professional')
      .single();

    if (craftsmanError || !craftsman) {
      throw new Error('Invalid craftsman ID or not a professional account');
    }
    
    // Check if craftsman already has an active subscription
    const { data: activeSubscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();
    
    if (activeSubscription) {
      throw new Error('Ai deja un abonament activ. Nu poți crea un nou abonament până când cel curent nu expiră.');
    }
    
    // Create a payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        craftsman_id: craftsman_id,
        amount: plan === 'lunar' ? 199 : 1999, // Amount in RON
        status: 'pending',
        currency: 'RON'
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error('Could not create payment record');
    }
    
    // Create a subscription record linked to the payment
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        craftsman_id: craftsman_id,
        status: 'inactive',
        plan: plan,
        payment_id: payment.id
      });
    
    if (subscriptionError) {
      console.error("Error creating subscription record:", subscriptionError);
      throw new Error('Could not create subscription record');
    }
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Abonament ProFixer ${plan === 'lunar' ? 'Lunar' : 'Anual'}`,
              description: `Acces complet la platforma ProFixer pentru ${plan === 'lunar' ? '1 lună' : '12 luni'}`
            },
            unit_amount: PRICE_MAP[plan],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription/activate`,
      metadata: {
        craftsman_id: craftsman_id,
        payment_id: payment.id,
        plan: plan
      },
      client_reference_id: payment.id,
    });
    
    // Update payment record with Stripe session ID
    await supabaseAdmin
      .from('payments')
      .update({
        stripe_payment_id: session.id
      })
      .eq('id', payment.id);
    
    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    );
  }
});
