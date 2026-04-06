CREATE POLICY "Users can update own analyses"
ON public.analysis_history
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);