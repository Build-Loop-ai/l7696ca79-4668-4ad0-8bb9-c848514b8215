-- Create system-level role enum (separate from organization roles)
CREATE TYPE public.system_role AS ENUM ('super_admin', 'support');

-- System roles table for platform-wide admins
CREATE TABLE public.system_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role system_role NOT NULL DEFAULT 'support',
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check system admin status
CREATE OR REPLACE FUNCTION public.is_system_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.system_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- RLS: Only super admins can view system roles
CREATE POLICY "Super admins can view system roles"
ON public.system_roles FOR SELECT
USING (is_system_admin(auth.uid()));

-- RLS: Only super admins can manage system roles  
CREATE POLICY "Super admins can manage system roles"
ON public.system_roles FOR ALL
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL organizations (cross-org access)
CREATE POLICY "Super admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL call logs
CREATE POLICY "Super admins can view all call logs"
ON public.call_logs FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL phone numbers
CREATE POLICY "Super admins can view all phone numbers"
ON public.phone_numbers FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL organization settings
CREATE POLICY "Super admins can view all org settings"
ON public.organization_settings FOR SELECT
USING (is_system_admin(auth.uid()));

-- Allow super admins to view ALL appointments
CREATE POLICY "Super admins can view all appointments"
ON public.appointments FOR SELECT
USING (is_system_admin(auth.uid()));