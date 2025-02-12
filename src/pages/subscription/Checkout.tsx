
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Navigation } from "@/components/Navigation";
import { CheckoutForm } from '@/components/subscription/CheckoutForm';
import { createPaymentIntent } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const stripePromise = loadStripe('pk_test_51OqWcLBhVBCT5VBK15MoNrBnuoZ51O2uKYjbXLFtaLmDm6rRBfhMnvWPBfVGV7Y3L6kICEbqPz5nIFiTDM7r4OgR00w6Ny4Ecy');

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get('plan') as SubscriptionPlan;
  const amount = plan === 'lunar' ? 99 : 990;

  useEffect(() => {
    if (!plan) {
      navigate('/subscription/activate');
      return;
    }

    const initializePayment = async () => {
      try {
        const secret = await createPaymentIntent(plan);
        setClientSecret(secret);
      } catch (error) {
        console.error('Error initializing payment:', error);
        toast.error('A apărut o eroare la inițializarea plății.');
        navigate('/subscription/activate');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [plan, navigate]);

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
        <h1 className="text-2xl font-bold mb-6">Finalizează Plata</h1>
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              clientSecret={clientSecret}
              amount={amount}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Checkout;
