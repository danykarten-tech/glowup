
-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate: users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id);

-- Create a trigger function that prevents plan column changes by non-admins
CREATE OR REPLACE FUNCTION public.protect_plan_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF NOT public.is_admin_email(auth.uid()) THEN
      NEW.plan := OLD.plan;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger
DROP TRIGGER IF EXISTS protect_plan_on_update ON public.profiles;
CREATE TRIGGER protect_plan_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_plan_column();
