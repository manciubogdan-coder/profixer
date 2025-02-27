
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') || ''; // Vom folosi ID-ul prețului din variabilele de mediu

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { craftsman_id, plan } = await req.json()

    if (!craftsman_id) {
      throw new Error('ID-ul meșterului este necesar')
    }

    // Creăm clientul Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificăm dacă există deja un abonament activ
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('craftsman_id', craftsman_id)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle()

    if (subError && subError.code !== 'PGRST116') {
      throw new Error(`Eroare la verificarea abonamentului: ${subError.message}`)
    }

    if (existingSub) {
      throw new Error('Ai deja un abonament activ')
    }

    // Creăm o plată în baza de date
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        craftsman_id,
        amount: 99,
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Eroare la crearea plății: ${paymentError.message}`)
    }

    // Creăm sesiunea de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: PRICE_ID, // Folosim ID-ul prețului configurat
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription/success?payment_id=${payment.id}&plan=${plan}`,
      cancel_url: `${req.headers.get('origin')}/subscription/activate`,
      client_reference_id: payment.id,
      metadata: {
        payment_id: payment.id,
        craftsman_id: craftsman_id
      }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
