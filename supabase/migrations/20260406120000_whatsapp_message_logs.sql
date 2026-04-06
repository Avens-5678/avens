-- Create whatsapp_message_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  template_name text,
  recipient_phone text NOT NULL,
  recipient_name text,
  recipient_type text,
  parameters jsonb DEFAULT '{}'::jsonb,
  message_type text NOT NULL DEFAULT 'template',
  status text NOT NULL DEFAULT 'queued',
  meta_message_id text,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add message_type column if table already exists but column is missing
DO $$ BEGIN
  ALTER TABLE public.whatsapp_message_logs ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'template';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- Admin full access
DROP POLICY IF EXISTS "Admin full access to whatsapp_message_logs" ON public.whatsapp_message_logs;
CREATE POLICY "Admin full access to whatsapp_message_logs"
  ON public.whatsapp_message_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Service role (edge functions) can insert/update
DROP POLICY IF EXISTS "Service role access to whatsapp_message_logs" ON public.whatsapp_message_logs;
CREATE POLICY "Service role access to whatsapp_message_logs"
  ON public.whatsapp_message_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_message_logs;

-- Expand check constraints to allow incoming messages
ALTER TABLE public.whatsapp_message_logs DROP CONSTRAINT IF EXISTS whatsapp_message_logs_message_type_check;
ALTER TABLE public.whatsapp_message_logs ADD CONSTRAINT whatsapp_message_logs_message_type_check CHECK (message_type = ANY (ARRAY['template', 'broadcast', 'reply', 'incoming']));

ALTER TABLE public.whatsapp_message_logs DROP CONSTRAINT IF EXISTS whatsapp_message_logs_status_check;
ALTER TABLE public.whatsapp_message_logs ADD CONSTRAINT whatsapp_message_logs_status_check CHECK (status = ANY (ARRAY['queued', 'sent', 'delivered', 'read', 'failed', 'received']));

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wml_meta_message_id ON public.whatsapp_message_logs(meta_message_id);
CREATE INDEX IF NOT EXISTS idx_wml_recipient_phone ON public.whatsapp_message_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_wml_message_type ON public.whatsapp_message_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_wml_sent_at ON public.whatsapp_message_logs(sent_at DESC);
