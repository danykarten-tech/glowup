-- Add bonus_credits and referral_code to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bonus_credits integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing users
UPDATE public.profiles
SET referral_code = substr(md5(id::text || now()::text), 1, 8)
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL after populating
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT substr(md5(random()::text), 1, 8);

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  bonus_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Function: when a referral row is inserted, award 5 bonus credits to referrer
CREATE OR REPLACE FUNCTION public.award_referral_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.bonus_awarded THEN
    UPDATE public.profiles
    SET bonus_credits = bonus_credits + 5
    WHERE id = NEW.referrer_id;

    UPDATE public.referrals
    SET bonus_awarded = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_referral_bonus
  AFTER INSERT ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.award_referral_bonus();

-- Update handle_new_user to generate referral_code and process referral
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan text := 'free';
  _ref_code text;
  _referrer_id uuid;
BEGIN
  IF NEW.email IN (
    'harishsinghwork2@gmail.com',
    'harishsinghwork92@gmail.com',
    'hariwork92@gmail.com',
    'balamnegi9211@gmail.com'
  ) THEN
    _plan := 'ultimate';
  END IF;

  INSERT INTO public.profiles (id, full_name, plan, referral_code)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', _plan, substr(md5(NEW.id::text || now()::text), 1, 8));

  -- Check if user signed up with a referral code
  _ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  IF _ref_code IS NOT NULL AND _ref_code != '' THEN
    SELECT id INTO _referrer_id FROM public.profiles WHERE referral_code = _ref_code;
    IF _referrer_id IS NOT NULL AND _referrer_id != NEW.id THEN
      INSERT INTO public.referrals (referrer_id, referred_user_id)
      VALUES (_referrer_id, NEW.id)
      ON CONFLICT (referred_user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;