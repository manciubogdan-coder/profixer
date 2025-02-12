
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
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Nu ești autentificat' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Nu ești autentificat' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obține datele din request
    const { plan, amount } = await req.json()

    if (!plan || !amount) {
      return new Response(
        JSON.stringify({ error: 'Datele sunt incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crează customer în Stripe dacă nu există
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profiles) {
      return new Response(
        JSON.stringify({ error: 'Profilul nu a fost găsit' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crează plata în baza de date
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        craftsman_id: user.id,
        amount,
        currency: 'RON',
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Eroare la crearea plății' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crează abonamentul în status pending
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        craftsman_id: user.id,
        status: 'inactive',
        plan,
        payment_id: payment.id,
        end_date: new Date(new Date().setMonth(new Date().getMonth() + (plan === 'anual' ? 12 : 1)))
      })

    if (subscriptionError) {
      return new Response(
        JSON.stringify({ error: 'Eroare la crearea abonamentului' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crează payment intent în Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe folosește cenți
      currency: 'ron',
      payment_method_types: ['card'],
      metadata: {
        payment_id: payment.id,
        user_id: user.id,
        plan
      }
    })

    // Actualizează payment cu ID-ul de la Stripe
    await supabaseClient
      .from('payments')
      .update({
        stripe_payment_id: paymentIntent.id
      })
      .eq('id', payment.id)

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
