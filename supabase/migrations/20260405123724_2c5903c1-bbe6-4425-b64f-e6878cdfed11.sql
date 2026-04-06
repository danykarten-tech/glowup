
CREATE OR REPLACE FUNCTION public.activate_premium_plan(p_user_id uuid, p_plan text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_plan NOT IN ('pro', 'ultimate') THEN
    RETURN false;
  END IF;

  PERFORM set_config('app.trusted_plan_update', 'true', true);

  UPDATE public.profiles
  SET plan = p_plan,
      plan_start_date = now(),
      renewal_date = now() + interval '30 days',
      auto_renew_enabled = true,
      cancel_at_period_end = false,
      subscription_status = 'active',
      updated_at = now()
  WHERE id = p_user_id;

  PERFORM set_config('app.trusted_plan_update', 'false', true);

  RETURN true;
END;
$$;
