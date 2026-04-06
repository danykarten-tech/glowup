
-- Create a security definer function to check if a user is an admin by email
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

-- Drop old permissive policies for insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.affiliate_products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.affiliate_products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.affiliate_products;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.affiliate_products;

-- New admin-only policies
CREATE POLICY "Admins can insert products" ON public.affiliate_products
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_email(auth.uid()));

CREATE POLICY "Admins can update products" ON public.affiliate_products
FOR UPDATE TO authenticated
USING (public.is_admin_email(auth.uid()))
WITH CHECK (public.is_admin_email(auth.uid()));

CREATE POLICY "Admins can delete products" ON public.affiliate_products
FOR DELETE TO authenticated
USING (public.is_admin_email(auth.uid()));

CREATE POLICY "Admins can view all products" ON public.affiliate_products
FOR SELECT TO authenticated
USING (public.is_admin_email(auth.uid()));
