
-- Glow Challenges table
CREATE TABLE public.glow_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  challenger_name text,
  challenger_score integer NOT NULL,
  challenged_friend_name text,
  challenged_friend_contact text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.glow_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" ON public.glow_challenges
  FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id);

CREATE POLICY "Users can create challenges" ON public.glow_challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Anyone can view for leaderboard" ON public.glow_challenges
  FOR SELECT TO authenticated
  USING (true);
