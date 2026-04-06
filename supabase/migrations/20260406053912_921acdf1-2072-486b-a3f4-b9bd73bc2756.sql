
-- Helper function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- is_admin_email function
CREATE OR REPLACE FUNCTION public.is_admin_email(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email IN (
      'harishsinghwork2@gmail.com',
      'harishsinghwork92@gmail.com',
      'hariwork92@gmail.com',
      'balamnegi9211@gmail.com'
    )
  );
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  plan_start_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  auto_renew_enabled BOOLEAN NOT NULL DEFAULT false,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  subscription_status TEXT NOT NULL DEFAULT 'expired',
  downgrade_after_expiry TEXT NOT NULL DEFAULT 'free',
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Protect plan column trigger
CREATE OR REPLACE FUNCTION public.protect_plan_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.is_admin_email(NEW.id) THEN
    NEW.plan := 'ultimate';
    RETURN NEW;
  END IF;
  IF current_setting('app.trusted_plan_update', true) = 'true' THEN
    RETURN NEW;
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_plan_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_plan_column();

-- Analysis history table
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  symmetry_score INTEGER,
  skin_score INTEGER,
  hairstyle_score INTEGER,
  style_score INTEGER,
  photo_url TEXT,
  analysis_data JSONB,
  share_token UUID DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.analysis_history FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.analysis_history FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_analysis_history_share_token ON public.analysis_history(share_token) WHERE share_token IS NOT NULL;

-- get_shared_analysis function
CREATE OR REPLACE FUNCTION public.get_shared_analysis(p_share_token uuid)
RETURNS SETOF public.analysis_history
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.analysis_history WHERE share_token = p_share_token LIMIT 1;
$$;

-- Affiliate products table
CREATE TABLE public.affiliate_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'skincare',
  description TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  affiliate_link TEXT NOT NULL DEFAULT '#',
  tag TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.affiliate_products FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can insert products" ON public.affiliate_products FOR INSERT TO authenticated WITH CHECK (public.is_admin_email(auth.uid()));
CREATE POLICY "Admins can update products" ON public.affiliate_products FOR UPDATE TO authenticated USING (public.is_admin_email(auth.uid())) WITH CHECK (public.is_admin_email(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.affiliate_products FOR DELETE TO authenticated USING (public.is_admin_email(auth.uid()));
CREATE POLICY "Admins can view all products" ON public.affiliate_products FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));

CREATE TRIGGER update_affiliate_products_updated_at
  BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support messages table
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.support_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all messages" ON public.support_messages FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));

-- Page views table
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));

-- Payments table
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

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_razorpay_sub ON public.payments(razorpay_subscription_id);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  bonus_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "System can insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);

-- Award referral bonus trigger
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
    UPDATE public.referrals SET bonus_awarded = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_referral_bonus
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.award_referral_bonus();

-- Handle new user function
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- check_subscription_expiry function
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
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- activate_premium_plan function
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

-- Storage bucket for selfies (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('selfies', 'selfies', false);

CREATE POLICY "Users can upload own selfies" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own selfies" ON storage.objects
  FOR SELECT USING (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own selfies" ON storage.objects
  FOR DELETE USING (bucket_id = 'selfies' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own selfies" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'selfies' AND (storage.foldername(name))[1] = auth.uid()::text);
