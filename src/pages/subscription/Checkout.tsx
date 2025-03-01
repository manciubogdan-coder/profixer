
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { createPaymentIntent, SUBSCRIPTION_PRICES } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get('plan') as SubscriptionPlan;

  useEffect(() => {
    if (!plan) {
      navigate('/subscription/activate');
      return;
    }

    const initializePayment = async () => {
      try {
        console.log('Creating payment link for plan:', plan);
        
        // Check user session first
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          throw new Error('Nu ești autentificat. Te rugăm să te autentifici pentru a continua.');
        }

        // Check profile and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.session.user.id)
          .single();

        if (profileError) {
          throw new Error('Nu am putut verifica profilul tău. Te rugăm să încerci din nou.');
        }

        if (profile.role !== 'professional') {
          throw new Error('Doar utilizatorii cu cont de meșter pot achiziționa abonamente.');
        }

        // Try to create payment intent
        const paymentUrl = await createPaymentIntent(plan);
        console.log('Payment link created, redirecting to:', paymentUrl);
        
        // Add a small delay to ensure logs are captured
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 500);
        
      } catch (error: any) {
        console.error('Error creating payment:', error);
        
        setError(error.message || 'A apărut o eroare la inițializarea plății.');
        
        if (error.message.includes('Ai deja un abonament activ')) {
          toast.error('Nu poți crea un nou abonament deoarece ai deja unul activ.');
        } else {
          toast.error(error.message || 'A apărut o eroare la inițializarea plății.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [plan, navigate]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    navigate('/subscription/checkout?plan=lunar');
  };

  const handleGoBack = () => {
    navigate('/subscription/activate');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container flex flex-col items-center justify-center py-12">
        {isLoading ? (
          <div className="text-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Se inițializează plata...</h2>
            <p className="text-muted-foreground">Vă rugăm să așteptați, vă vom redirecționa către pagina de plată.</p>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">Suma de plată: {SUBSCRIPTION_PRICES[plan]} RON</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">A apărut o eroare</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={handleGoBack}>
                Înapoi
              </Button>
              <Button onClick={handleRetry}>
                Încearcă din nou
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Checkout;
