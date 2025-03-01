
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
    const handleSubscriptionSuccess = async () => {
      try {
        // Check if this is an auto-activated subscription
        if (paymentId === 'auto_activated') {
          console.log('Auto-activated subscription detected');
          
          // Get current user
          const { data: session } = await supabase.auth.getSession();
          const userId = session.session?.user.id;
          
          if (!userId) {
            throw new Error('Nu ești autentificat');
          }
          
          // Double-check that subscription was activated properly
          const { data: subscriptionStatus, error: statusError } = await supabase
            .from('craftsman_subscription_status_latest')
            .select('*')
            .eq('craftsman_id', userId)
            .maybeSingle();
          
          if (statusError) {
            throw new Error('Nu s-a putut verifica statusul abonamentului');
          }
          
          if (!subscriptionStatus?.is_subscription_active) {
            console.log('Subscription not active, retrying activation');
            
            // If not active, try activating again
            const targetEndDate = new Date('2025-07-01T23:59:59');
            const { error: updateError } = await supabase
              .rpc('update_craftsman_subscription_status', {
                p_craftsman_id: userId,
                p_is_active: true,
                p_end_date: targetEndDate.toISOString()
              });
            
            if (updateError) {
              throw new Error('Nu s-a putut activa abonamentul');
            }
          }
          
          setIsLoading(false);
          toast.success('Abonamentul a fost activat cu succes!');
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            navigate('/profile/me');
          }, 3000);
          
          return;
        }
        
        // Handle normal payment verification (leaving original code for fallback)
        if (!paymentId) {
          toast.error('Nu s-a putut verifica plata: ID de plată lipsă');
          setTimeout(() => navigate('/subscription/activate'), 3000);
          return;
        }

        console.log(`Verifying payment ${paymentId} for plan ${plan}`);
        
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
        const endDate = new Date('2025-07-01T23:59:59');

        // Verificăm abonamentul existent
        const { data: existingSub, error: existingSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('payment_id', paymentId)
          .maybeSingle();

        if (existingSubError && existingSubError.code !== 'PGRST116') {
          console.error('Error checking existing subscription:', existingSubError);
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
        } else {
          console.log('Successfully updated subscription status via RPC');
        }

        setIsLoading(false);
        toast.success('Abonamentul a fost activat cu succes!');
        
        // Redirecționăm către profil după 3 secunde
        setTimeout(() => {
          navigate('/profile/me');
        }, 3000);

      } catch (error) {
        console.error('Error during subscription verification:', error);
        toast.error(error.message || 'A apărut o eroare la verificarea abonamentului');
        setIsLoading(false);
        
        // Redirecționăm către pagina de activare în caz de eroare
        setTimeout(() => {
          navigate('/subscription/activate');
        }, 3000);
      }
    };

    handleSubscriptionSuccess();
  }, [paymentId, plan, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-12">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          {isLoading ? (
            <>
              <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="mt-6 text-2xl font-bold">Activăm abonamentul tău...</h1>
              <p className="mt-2 text-muted-foreground">
                Te rugăm să aștepți câteva momente în timp ce confirmăm abonamentul.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="mt-6 text-2xl font-bold">Abonament activat!</h1>
              <p className="mt-2 text-muted-foreground">
                Abonamentul tău a fost activat cu succes și este valabil până la 1 iulie 2025.
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
