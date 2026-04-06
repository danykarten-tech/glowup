
-- Add Razorpay fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS razorpay_customer_id text,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id text;

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  razorpay_payment_id text,
  razorpay_subscription_id text,
  razorpay_order_id text,
  plan text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments"
ON public.payments FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update payments"
ON public.payments FOR UPDATE
USING (true);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_razorpay_sub ON public.payments(razorpay_subscription_id);
