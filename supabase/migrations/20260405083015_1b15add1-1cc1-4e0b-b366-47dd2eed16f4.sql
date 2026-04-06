
-- Modify protect_plan_column to allow trusted updates
CREATE OR REPLACE FUNCTION public.protect_plan_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow admin users
  IF public.is_admin_email(NEW.id) THEN
    NEW.plan := 'ultimate';
    RETURN NEW;
  END IF;

  -- Allow trusted internal updates (from edge functions via service role)
  IF current_setting('app.trusted_plan_update', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Block client-side plan changes
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create a secure function to activate premium plans
CREATE OR REPLACE FUNCTION public.activate_premium_plan(p_user_id uuid, p_plan text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_plan NOT IN ('pro', 'ultimate') THEN
    RETURN false;
  END IF;

  -- Set trusted flag so trigger allows the update
  PERFORM set_config('app.trusted_plan_update', 'true', true);

  UPDATE public.profiles
  SET plan = p_plan, updated_at = now()
  WHERE id = p_user_id;

  -- Reset flag
  PERFORM set_config('app.trusted_plan_update', 'false', true);

  RETURN true;
END;
$function$;
