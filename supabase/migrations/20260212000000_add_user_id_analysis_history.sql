-- Add user_id to analysis_history for anonymous user isolation.
-- Client stores anonymous_user_id in localStorage and sends it on insert; list filters by it.

ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS user_id text;

-- Optional: backfill existing rows so they don't appear in any user's filtered list.
-- Uncomment to set existing rows to a sentinel (they stay visible in Dashboard):
-- UPDATE public.analysis_history SET user_id = '__legacy__' WHERE user_id IS NULL;
