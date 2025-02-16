
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
}

export const CheckoutForm = ({ clientSecret, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error(error.message || 'A apărut o eroare la procesarea plății.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('A apărut o eroare la procesarea plății.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <div className="text-sm text-gray-600">Total de plată</div>
        <div className="text-2xl font-bold">{amount} RON</div>
      </div>
      
      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Se procesează...
          </>
        ) : (
          'Plătește'
        )}
      </Button>
    </form>
  );
};
