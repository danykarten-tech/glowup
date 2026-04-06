
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Create analysis_history table
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.analysis_history FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.analysis_history FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_analysis_history_share_token ON public.analysis_history(share_token) WHERE share_token IS NOT NULL;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

-- Auto-create profile on signup
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Protect plan column
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
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_plan_on_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_plan_column();

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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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
CREATE POLICY "Admins can view all messages" ON public.support_messages FOR SELECT TO authenticated USING (is_admin_email(auth.uid()));

-- Page views table
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT TO authenticated USING (public.is_admin_email(auth.uid()));
