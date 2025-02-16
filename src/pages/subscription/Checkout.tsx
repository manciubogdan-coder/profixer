
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/Navigation";
import { createPaymentIntent } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container flex items-center justify-center py-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return null;
};

export default Checkout;
