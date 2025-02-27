
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { createPaymentIntent } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        const paymentUrl = await createPaymentIntent(plan);
        console.log('Payment link created, redirecting to:', paymentUrl);
        window.location.href = paymentUrl;
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
