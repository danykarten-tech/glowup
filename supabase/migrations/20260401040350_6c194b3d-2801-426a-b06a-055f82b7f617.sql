
CREATE POLICY "Authenticated users can insert products"
ON public.affiliate_products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.affiliate_products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
ON public.affiliate_products
FOR DELETE
TO authenticated
USING (true);

-- Also allow authenticated users to see all products (including inactive)
CREATE POLICY "Authenticated users can view all products"
ON public.affiliate_products
FOR SELECT
TO authenticated
USING (true);
