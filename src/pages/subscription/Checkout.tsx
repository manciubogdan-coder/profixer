
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Navigation } from "@/components/Navigation";
import { CheckoutForm } from '@/components/subscription/CheckoutForm';
import { createPaymentIntent, getActiveSubscription } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe('pk_test_51OqWcLBhVBCT5VBK15MoNrBnuoZ51O2uKYjbXLFtaLmDm6rRBfhMnvWPBfVGV7Y3L6kICEbqPz5nIFiTDM7r4OgR00w6Ny4Ecy');

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get('plan') as SubscriptionPlan;
  const amount = 99; // Preț fix pentru abonamentul lunar

  useEffect(() => {
    if (!plan) {
      navigate('/subscription/activate');
      return;
    }

    const initializePayment = async () => {
      try {
        if (!user?.id) {
          throw new Error('Nu ești autentificat');
        }

        // Verifică dacă există deja un abonament activ
        const activeSubscription = await getActiveSubscription(user.id);
        if (activeSubscription) {
          toast.error('Ai deja un abonament activ');
          navigate('/subscription/activate');
          return;
        }

        const secret = await createPaymentIntent(plan);
        setClientSecret(secret);
      } catch (error: any) {
        console.error('Error initializing payment:', error);
        toast.error(error.message || 'A apărut o eroare la inițializarea plății.');
        navigate('/subscription/activate');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [plan, navigate, user]);

  if (isLoading || !clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container flex items-center justify-center py-8">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-md mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Finalizează Plata</CardTitle>
          </CardHeader>
          <CardContent>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  clientSecret={clientSecret}
                  amount={amount}
                />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
