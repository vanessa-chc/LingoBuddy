-- Client-side error log for debugging "Leon is taking a nap" and other user-facing failures.
-- Anon can only INSERT; only Dashboard / service_role can SELECT so users cannot see others' errors.

CREATE TABLE IF NOT EXISTS public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  code text,
  message text NOT NULL,
  context jsonb,
  raw_error text
);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert error_log"
  ON public.error_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for anon: only you (Dashboard) and service_role can read logs.
