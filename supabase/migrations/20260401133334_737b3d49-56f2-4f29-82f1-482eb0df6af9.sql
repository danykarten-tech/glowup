
-- Update handle_new_user to give admins ultimate plan on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _plan text := 'free';
BEGIN
  IF NEW.email IN (
    'harishsinghwork2@gmail.com',
    'harishsinghwork92@gmail.com',
    'hariwork92@gmail.com',
    'balamnegi9211@gmail.com'
  ) THEN
    _plan := 'ultimate';
  END IF;

  INSERT INTO public.profiles (id, full_name, plan)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', _plan);
  RETURN NEW;
END;
$$;

-- Update protect_plan_column to always enforce ultimate for admin emails
CREATE OR REPLACE FUNCTION public.protect_plan_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Admin emails always get ultimate
  IF public.is_admin_email(NEW.id) THEN
    NEW.plan := 'ultimate';
    RETURN NEW;
  END IF;

  -- Non-admins cannot change their own plan
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$$;
