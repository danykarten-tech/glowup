
ALTER TABLE public.analysis_history ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_analysis_history_share_token ON public.analysis_history(share_token) WHERE share_token IS NOT NULL;

CREATE POLICY "Anyone can view shared analyses" ON public.analysis_history FOR SELECT USING (share_token IS NOT NULL AND share_token = share_token);
