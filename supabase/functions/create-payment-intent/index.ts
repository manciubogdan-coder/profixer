
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Request received:', req.method);

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

    let requestData;
    try {
      requestData = await req.json()
    } catch (error) {
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

    const { plan } = requestData;

    if (!plan) {
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
      // Crează plata în baza de date
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          craftsman_id: user.id,
          amount: 99, // Prețul în RON
          currency: 'RON',
          status: 'pending',
          stripe_payment_id: 'pl_test_static' // Un ID static pentru că folosim un payment link static
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

      // Crează înregistrarea de abonament inactivă
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .insert({
          craftsman_id: user.id,
          status: 'inactive',
          plan,
          payment_id: payment.id,
          start_date: null,
          end_date: null
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

      return new Response(
        JSON.stringify({ 
          paymentUrl: 'https://buy.stripe.com/test_8wM3cDanZ5TbfPG000'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )

    } catch (error) {
      console.error('Error:', error);
      return new Response(
        JSON.stringify({ error: 'Eroare la procesarea plății' }),
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
