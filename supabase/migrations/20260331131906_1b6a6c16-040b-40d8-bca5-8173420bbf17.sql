
DROP POLICY IF EXISTS "Anyone can view shared analyses" ON public.analysis_history;

CREATE OR REPLACE FUNCTION public.get_shared_analysis(p_share_token uuid)
RETURNS SETOF public.analysis_history
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.analysis_history WHERE share_token = p_share_token LIMIT 1;
$$;
