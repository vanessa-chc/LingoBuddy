-- Global analysis feedback (thumbs up/down) for Issue #10.
-- One feedback per analysis; anon can insert.

CREATE TABLE IF NOT EXISTS public.analysis_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL,
  user_id uuid,
  is_helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  context text,
  slang_terms text[],
  UNIQUE(analysis_id)
);

CREATE INDEX IF NOT EXISTS idx_analysis_feedback_created_at ON public.analysis_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_helpful ON public.analysis_feedback(is_helpful);

ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.analysis_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own feedback"
  ON public.analysis_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);
