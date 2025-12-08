-- Create email_config table for admin email settings
CREATE TABLE public.email_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email text NOT NULL DEFAULT 'notifications@resend.dev',
  from_name text NOT NULL DEFAULT 'AI Receptionist',
  reply_to_email text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Enable RLS
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- Only super admins can view and manage email config
CREATE POLICY "Super admins can view email config"
  ON public.email_config FOR SELECT
  USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can update email config"
  ON public.email_config FOR UPDATE
  USING (is_system_admin(auth.uid()));

CREATE POLICY "Super admins can insert email config"
  ON public.email_config FOR INSERT
  WITH CHECK (is_system_admin(auth.uid()));

-- Insert default config
INSERT INTO public.email_config (from_email, from_name) 
VALUES ('notifications@resend.dev', 'AI Receptionist');