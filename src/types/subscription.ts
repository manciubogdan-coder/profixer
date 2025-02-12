
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type SubscriptionPlan = 'lunar';

export interface Payment {
  id: string;
  craftsman_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPayment {
  id: string;
  craftsman_id: string;
  status: 'active' | 'inactive' | 'canceled';
  plan: SubscriptionPlan;
  payment_id: string;
  stripe_subscription_id?: string;
  start_date: string;
  end_date: string;
  payment?: Payment;
}
