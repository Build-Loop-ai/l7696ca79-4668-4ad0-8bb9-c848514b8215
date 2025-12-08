-- Create a function to get invitation details by token
-- This function uses SECURITY DEFINER to bypass RLS for unauthenticated invitees
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invite_token uuid)
RETURNS TABLE (
  id uuid,
  email text,
  role app_role,
  status text,
  expires_at timestamptz,
  organization_name text,
  inviter_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.role,
    i.status,
    i.expires_at,
    o.name as organization_name,
    p.full_name as inviter_name
  FROM invitations i
  LEFT JOIN organizations o ON o.id = i.organization_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = invite_token
  LIMIT 1;
END;
$$;