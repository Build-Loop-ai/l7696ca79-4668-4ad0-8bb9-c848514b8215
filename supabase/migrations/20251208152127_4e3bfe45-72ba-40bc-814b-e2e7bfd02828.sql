-- Create invitations table for team member invites
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL,
  token uuid DEFAULT gen_random_uuid() UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  CONSTRAINT unique_pending_invite UNIQUE (organization_id, email, status)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Org admins can view invitations for their org
CREATE POLICY "Admins can view org invitations"
ON public.invitations
FOR SELECT
USING (is_org_admin(auth.uid(), organization_id));

-- Org admins can create invitations
CREATE POLICY "Admins can create invitations"
ON public.invitations
FOR INSERT
WITH CHECK (is_org_admin(auth.uid(), organization_id));

-- Org admins can update invitations (cancel, etc.)
CREATE POLICY "Admins can update invitations"
ON public.invitations
FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

-- Org admins can delete invitations
CREATE POLICY "Admins can delete invitations"
ON public.invitations
FOR DELETE
USING (is_org_admin(auth.uid(), organization_id));

-- Super admins can view all invitations
CREATE POLICY "Super admins can view all invitations"
ON public.invitations
FOR SELECT
USING (is_system_admin(auth.uid()));

-- Create function to auto-accept invitations when user signs up
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Find pending invitations for this email
  FOR invitation_record IN
    SELECT * FROM public.invitations
    WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LOOP
    -- Add user to organization with the invited role
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, invitation_record.organization_id, invitation_record.role)
    ON CONFLICT (user_id, organization_id) DO NOTHING;
    
    -- Update user's profile with organization
    UPDATE public.profiles
    SET organization_id = invitation_record.organization_id
    WHERE id = NEW.id AND organization_id IS NULL;
    
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_record.id;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user is created
CREATE TRIGGER on_auth_user_created_check_invitations
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_invitation_acceptance();