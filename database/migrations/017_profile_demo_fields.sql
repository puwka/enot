ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS loans_demo jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS applications_demo jsonb NOT NULL DEFAULT '{"total":0,"approved":0,"rejected":0}'::jsonb;
