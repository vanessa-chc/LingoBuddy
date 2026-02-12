-- Enable Row Level Security (RLS) on analysis_history so access is explicit.
-- MVP: no auth — anon key can insert (save analysis) and select (list history).
-- Never expose service_role key in the client.

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (client) to insert rows when using the publishable anon key.
CREATE POLICY "Allow anon insert"
  ON public.analysis_history
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous to select all rows (history list). No auth = no per-user filtering.
CREATE POLICY "Allow anon select"
  ON public.analysis_history
  FOR SELECT
  TO anon
  USING (true);

-- Optional: deny anon update/delete so only inserts and reads are allowed.
-- Uncomment if you want to lock down updates/deletes until you add auth:
-- CREATE POLICY "Deny anon update" ON public.analysis_history FOR UPDATE TO anon USING (false);
-- CREATE POLICY "Deny anon delete" ON public.analysis_history FOR DELETE TO anon USING (false);
