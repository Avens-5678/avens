
-- WhatsApp Sessions table
CREATE TABLE public.whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  user_id uuid,
  user_type text DEFAULT 'customer',
  current_flow text DEFAULT 'idle',
  flow_data jsonb DEFAULT '{}'::jsonb,
  assigned_employee_id uuid,
  assigned_at timestamptz,
  assignment_type text DEFAULT 'manual',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- WhatsApp Conversations (message history)
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  direction text NOT NULL DEFAULT 'inbound',
  message_text text NOT NULL,
  sent_by text NOT NULL DEFAULT 'customer',
  admin_user_id uuid,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- WhatsApp Contacts CRM
CREATE TABLE public.whatsapp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  user_id uuid,
  name text,
  tags text[] DEFAULT '{}',
  opted_in boolean DEFAULT false,
  opted_in_at timestamptz,
  last_message_at timestamptz,
  total_conversations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- WhatsApp Campaigns
CREATE TABLE public.whatsapp_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  audience_filter jsonb DEFAULT '{}'::jsonb,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  read_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  created_by uuid,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- WhatsApp Campaign Recipients
CREATE TABLE public.whatsapp_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- WhatsApp Assignment Rules
CREATE TABLE public.whatsapp_assignment_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_auto_assign boolean DEFAULT false,
  eligible_employee_ids uuid[] DEFAULT '{}',
  last_assigned_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_assignment_rules ENABLE ROW LEVEL SECURITY;

-- Admin full access policies
CREATE POLICY "Admins can manage whatsapp_sessions" ON public.whatsapp_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage whatsapp_conversations" ON public.whatsapp_conversations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage whatsapp_contacts" ON public.whatsapp_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage whatsapp_campaigns" ON public.whatsapp_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage whatsapp_campaign_recipients" ON public.whatsapp_campaign_recipients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage whatsapp_assignment_rules" ON public.whatsapp_assignment_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Employee access to assigned sessions
CREATE POLICY "Employees can view assigned sessions" ON public.whatsapp_sessions FOR SELECT TO authenticated USING (assigned_employee_id = auth.uid());
CREATE POLICY "Employees can update assigned sessions" ON public.whatsapp_sessions FOR UPDATE TO authenticated USING (assigned_employee_id = auth.uid()) WITH CHECK (assigned_employee_id = auth.uid());

-- Employee access to conversations of assigned sessions
CREATE POLICY "Employees can view assigned conversations" ON public.whatsapp_conversations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.whatsapp_sessions ws WHERE ws.id = session_id AND ws.assigned_employee_id = auth.uid())
);
CREATE POLICY "Employees can insert replies for assigned conversations" ON public.whatsapp_conversations FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.whatsapp_sessions ws WHERE ws.id = session_id AND ws.assigned_employee_id = auth.uid())
);

-- Insert default assignment rules row
INSERT INTO public.whatsapp_assignment_rules (is_auto_assign) VALUES (false);
