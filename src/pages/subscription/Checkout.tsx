
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
  const amount = 99;

  useEffect(() => {
    if (!plan) {
      navigate('/subscription/activate');
      return;
    }

    const initializePayment = async () => {
      try {
        console.log('Initializing payment for plan:', plan);
        const secret = await createPaymentIntent(plan);
        console.log('Payment intent created successfully');
        setClientSecret(secret);
      } catch (error: any) {
        console.error('Error initializing payment:', error);
        
        if (error.message.includes('Ai deja un abonament activ')) {
          toast.error('Nu poți crea un nou abonament deoarece ai deja unul activ.');
          navigate('/profile/me');
        } else {
          toast.error(error.message || 'A apărut o eroare la inițializarea plății.');
          navigate('/subscription/activate');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [plan, navigate]);

  if (isLoading || !clientSecret) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container flex items-center justify-center py-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="container max-w-md mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Finalizează Plata</h1>
        {clientSecret && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#9333EA',
                    colorBackground: '#FFFFFF',
                    colorText: '#1F2937',
                    colorDanger: '#EF4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                  rules: {
                    '.Input': {
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    },
                  }
                }
              }}
            >
              <CheckoutForm 
                clientSecret={clientSecret}
                amount={amount}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
