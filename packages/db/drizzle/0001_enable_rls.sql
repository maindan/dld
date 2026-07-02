-- Single-user internal app: Drizzle (server-side, direct Postgres connection as the
-- `postgres` role) bypasses RLS entirely and is the only writer for business data.
-- RLS here exists for two reasons: (1) Supabase auto-exposes every public-schema
-- table over PostgREST and flags unprotected ones as a security advisory, and
-- (2) Realtime postgres_changes subscriptions are evaluated against RLS for the
-- `authenticated` role, so orcamentos needs a SELECT-permitting policy for the
-- approval notification to reach the browser live.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY authenticated_full_access ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- Let the browser (logged in as the authenticated user) receive live changes on
-- orçamentos, which is how "cliente aprova" shows up as a notification without a poll.
ALTER PUBLICATION supabase_realtime ADD TABLE public.orcamentos;
