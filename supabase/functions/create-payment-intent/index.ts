
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Request received:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verifică autorizarea
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header:', authHeader);
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      console.log('No token provided');
      return new Response(
        JSON.stringify({ error: 'Nu ești autentificat' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.log('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'Nu ești autentificat' }),
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('User authenticated:', user.id);

    let requestData;
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log('Request data:', requestData);
    const { plan, amount } = requestData

    if (!plan || !amount) {
      console.log('Missing required data:', { plan, amount });
      return new Response(
        JSON.stringify({ error: 'Datele sunt incomplete' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Verifică dacă utilizatorul are deja un abonament activ
    const { data: activeSubscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', user.id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle()

    if (activeSubscription) {
      console.log('User already has active subscription');
      return new Response(
        JSON.stringify({ error: 'Ai deja un abonament activ' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    try {
      // Crează payment intent în Stripe ÎNAINTE de a crea înregistrările în baza de date
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe folosește cenți
        currency: 'ron',
        payment_method_types: ['card'],
        metadata: {
          user_id: user.id,
          plan
        }
      })

      console.log('Stripe payment intent created:', paymentIntent.id);

      // Doar după ce avem payment intent-ul, creăm plata în baza de date
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          craftsman_id: user.id,
          amount,
          currency: 'RON',
          status: 'pending',
          stripe_payment_id: paymentIntent.id
        })
        .select()
        .single()

      if (paymentError || !payment) {
        console.error('Error creating payment:', paymentError)
        return new Response(
          JSON.stringify({ error: 'Eroare la crearea plății' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      console.log('Payment record created:', payment.id);

      // Crează înregistrarea de abonament inactivă
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          craftsman_id: user.id,
          status: 'inactive', // Important: începe ca inactiv
          plan,
          payment_id: payment.id,
          start_date: null, // Va fi setat când plata este confirmată
          end_date: null // Va fi setat când plata este confirmată
        })

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        return new Response(
          JSON.stringify({ error: 'Eroare la crearea abonamentului' }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      console.log('Subscription record created (inactive)');

      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )

    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return new Response(
        JSON.stringify({ error: 'Eroare la procesarea plății cu Stripe' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
