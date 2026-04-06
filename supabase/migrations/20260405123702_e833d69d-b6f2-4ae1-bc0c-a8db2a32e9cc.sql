
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_start_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS renewal_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS auto_renew_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'expired',
  ADD COLUMN IF NOT EXISTS downgrade_after_expiry text NOT NULL DEFAULT 'free';

-- Create a function to check and auto-downgrade expired subscriptions
CREATE OR REPLACE FUNCTION public.check_subscription_expiry(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
BEGIN
  SELECT plan, renewal_date, auto_renew_enabled, cancel_at_period_end, subscription_status
  INTO _profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF _profile IS NULL THEN
    RETURN false;
  END IF;

  -- If subscription is active, renewal_date has passed, and auto_renew is off
  IF _profile.subscription_status = 'active'
     AND _profile.renewal_date IS NOT NULL
     AND _profile.renewal_date < now()
     AND _profile.auto_renew_enabled = false
  THEN
    PERFORM set_config('app.trusted_plan_update', 'true', true);
    
    UPDATE public.profiles
    SET plan = 'free',
        subscription_status = 'expired',
        cancel_at_period_end = false,
        updated_at = now()
    WHERE id = p_user_id;

    PERFORM set_config('app.trusted_plan_update', 'false', true);
    RETURN true; -- downgraded
  END IF;

  RETURN false; -- no change
END;
$$;
