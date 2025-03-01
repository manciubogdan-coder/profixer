
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { createPaymentIntent, SUBSCRIPTION_PRICES } from '@/lib/subscription';
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

    const activateSubscription = async () => {
      try {
        console.log('Auto-activating subscription for plan:', plan);
        // This will now directly activate the subscription without payment
        const redirectUrl = await createPaymentIntent(plan);
        console.log('Subscription activated, redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } catch (error: any) {
        console.error('Error activating subscription:', error);
        
        setError(error.message || 'A apărut o eroare la activarea abonamentului.');
        
        toast.error(error.message || 'A apărut o eroare la activarea abonamentului.');
      } finally {
        setIsLoading(false);
      }
    };

    activateSubscription();
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
            <h2 className="text-2xl font-bold mb-2">Se activează abonamentul...</h2>
            <p className="text-muted-foreground">Vă rugăm să așteptați, abonamentul va fi activat automat.</p>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">Valabil până la 1 iulie 2025</p>
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
