CREATE TABLE public.approved_creator_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  creator_id TEXT,
  source TEXT NOT NULL DEFAULT 'creator_hub',
  is_active BOOLEAN NOT NULL DEFAULT true,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_approved_creator_emails_email ON public.approved_creator_emails (email);
CREATE INDEX idx_approved_creator_emails_active ON public.approved_creator_emails (is_active) WHERE is_active = true;

ALTER TABLE public.approved_creator_emails ENABLE ROW LEVEL SECURITY;

-- Public read for active creators (needed for client-side sync)
CREATE POLICY "Allow public read approved_creator_emails"
ON public.approved_creator_emails
FOR SELECT
USING (true);

-- Public insert/update so admin panel and edge function (anon) can write
CREATE POLICY "Allow public insert approved_creator_emails"
ON public.approved_creator_emails
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update approved_creator_emails"
ON public.approved_creator_emails
FOR UPDATE
USING (true)
WITH CHECK (true);