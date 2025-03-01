
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/types/subscription';

const SubscriptionSuccess = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const paymentId = searchParams.get('payment_id');
  const plan = searchParams.get('plan') as SubscriptionPlan;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        toast.error('Nu s-a putut verifica plata: ID de plată lipsă');
        setTimeout(() => navigate('/subscription/activate'), 3000);
        return;
      }

      try {
        console.log(`Verifying payment ${paymentId} for plan ${plan}`);
        
        // Get current user session
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          throw new Error('Nu ești autentificat');
        }

        // Verificăm starea plății
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('status, craftsman_id')
          .eq('id', paymentId)
          .single();

        if (paymentError) {
          throw new Error(`Nu s-a putut verifica plata: ${paymentError.message}`);
        }

        console.log('Payment status:', payment.status);

        // Actualizăm manual plata dacă nu este deja completată
        if (payment.status !== 'completed') {
          console.log('Updating payment status manually');
          const { error: paymentUpdateError } = await supabase
            .from('payments')
            .update({ status: 'completed' })
            .eq('id', paymentId);
            
          if (paymentUpdateError) {
            console.error('Error updating payment status:', paymentUpdateError);
          }
        }

        // Creăm date pentru abonament
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30); // Adăugăm 30 de zile pentru abonament lunar

        // Verificăm abonamentul existent
        const { data: existingSub, error: existingSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('payment_id', paymentId)
          .maybeSingle();

        if (existingSubError && existingSubError.code !== 'PGRST116') {
          console.error('Error checking existing subscription:', existingSubError);
        }

        // Deactivate any existing active subscriptions for this user
        const { error: deactivateError } = await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('craftsman_id', payment.craftsman_id)
          .eq('status', 'active');

        if (deactivateError) {
          console.error('Error deactivating existing subscriptions:', deactivateError);
        }

        if (existingSub) {
          console.log('Updating existing subscription');
          // Actualizăm abonamentul existent
          const { error: updateSubError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString()
            })
            .eq('id', existingSub.id);

          if (updateSubError) {
            console.error('Error updating subscription:', updateSubError);
          }
        } else {
          console.log('Creating new subscription');
          // Creăm un nou abonament
          const validPlan: SubscriptionPlan = plan === 'lunar' ? 'lunar' : 'lunar'; // Forțăm să fie 'lunar' dacă nu este valid
          const { error: createSubError } = await supabase
            .from('subscriptions')
            .insert({
              craftsman_id: payment.craftsman_id,
              status: 'active',
              plan: validPlan,
              payment_id: paymentId,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString()
            });

          if (createSubError) {
            console.error('Error creating new subscription:', createSubError);
            throw new Error(`Nu s-a putut crea abonamentul: ${createSubError.message}`);
          }
        }

        // Forțăm actualizarea stării abonamentului prin RPC
        console.log('Forcing subscription status update via RPC');
        const { error: statusUpdateError } = await supabase
          .rpc('update_craftsman_subscription_status', {
            p_craftsman_id: payment.craftsman_id,
            p_is_active: true,
            p_end_date: endDate.toISOString()
          });

        if (statusUpdateError) {
          console.error('Error updating subscription status via RPC:', statusUpdateError);
          throw new Error(`Nu s-a putut actualiza starea abonamentului: ${statusUpdateError.message}`);
        } else {
          console.log('Successfully updated subscription status via RPC');
        }

        // Invalidate any cached subscription data
        await Promise.all([
          supabase.auth.refreshSession(),
          new Promise(resolve => setTimeout(resolve, 1000)) // Wait for DB updates to propagate
        ]);

        setIsLoading(false);
        toast.success('Abonamentul a fost activat cu succes!');
        
        // Redirecționăm către profil după 3 secunde
        setTimeout(() => {
          navigate('/profile/me');
        }, 3000);

      } catch (error) {
        console.error('Error during payment verification:', error);
        toast.error(error.message || 'A apărut o eroare la verificarea plății');
        setIsLoading(false);
        
        // Redirecționăm către pagina de activare în caz de eroare
        setTimeout(() => {
          navigate('/subscription/activate');
        }, 3000);
      }
    };

    verifyPayment();
  }, [paymentId, plan, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-12">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          {isLoading ? (
            <>
              <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="mt-6 text-2xl font-bold">Procesăm plata ta...</h1>
              <p className="mt-2 text-muted-foreground">
                Te rugăm să aștepți câteva momente în timp ce confirmăm plata.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="mt-6 text-2xl font-bold">Plata a fost confirmată!</h1>
              <p className="mt-2 text-muted-foreground">
                Mulțumim pentru abonare! Abonamentul tău a fost activat cu succes.
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                Vei fi redirecționat automat către profilul tău în câteva secunde...
              </p>
              <Button 
                className="mt-6 w-full" 
                onClick={() => navigate('/profile/me')}
              >
                Către profil
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
