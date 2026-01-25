-- Add Stripe Subscription fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id text,
ADD COLUMN stripe_subscription_id text,
ADD COLUMN subscription_status text default 'inactive', -- active, past_due, canceled, incomplete
ADD COLUMN current_period_end timestamp with time zone;
