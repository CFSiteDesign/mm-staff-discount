
CREATE TABLE public.staff_passes (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  photo text,
  photo_url text,
  code text NOT NULL UNIQUE,
  date_issued timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timestamp timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  details text NOT NULL
);

-- Public read/write since this app uses no auth for pass creation
ALTER TABLE public.staff_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read staff_passes" ON public.staff_passes FOR SELECT USING (true);
CREATE POLICY "Allow public insert staff_passes" ON public.staff_passes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update staff_passes" ON public.staff_passes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);
