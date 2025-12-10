-- Security Fix: Update appointments RLS policy to require service role or authenticated org member
DROP POLICY IF EXISTS "Service can insert appointments" ON public.appointments;

-- Only allow inserts from service role (edge functions) - this uses a function that checks if current role is service_role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('role', true) = 'service_role'
$$;

-- Recreate policy: Only service role (webhooks) can insert appointments
CREATE POLICY "Service role can insert appointments"
ON public.appointments
FOR INSERT
WITH CHECK (is_service_role());

-- Security Fix: Limit organization creation to one per user
-- First drop existing policy
DROP POLICY IF EXISTS "Users can insert organization" ON public.organizations;

-- Create function to check if user already has an organization
CREATE OR REPLACE FUNCTION public.user_has_organization(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND organization_id IS NOT NULL
  )
$$;

-- Recreate policy: Users can only create org if they don't have one
CREATE POLICY "Users can insert organization if none exists"
ON public.organizations
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND NOT user_has_organization(auth.uid())
);