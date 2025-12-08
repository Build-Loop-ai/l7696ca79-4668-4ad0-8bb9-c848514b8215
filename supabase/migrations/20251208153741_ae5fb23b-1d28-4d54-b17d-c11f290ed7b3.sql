-- Create email_logs table for tracking all sent emails
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  sent_by uuid,
  resend_id text,
  status text DEFAULT 'sent',
  metadata jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view all email logs
CREATE POLICY "Super admins can view all email logs"
  ON public.email_logs FOR SELECT
  USING (is_system_admin(auth.uid()));

-- Service role can insert email logs (from edge functions)
CREATE POLICY "Service can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);