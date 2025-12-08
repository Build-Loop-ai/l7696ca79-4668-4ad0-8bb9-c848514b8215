-- Update the handle_invitation_acceptance function to mark onboarding as complete
-- since invited users join an already-configured organization
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    
    -- Update user's profile with organization and mark onboarding as complete
    -- (invited users join an already-configured organization)
    UPDATE public.profiles
    SET 
      organization_id = invitation_record.organization_id,
      onboarding_completed = true
    WHERE id = NEW.id AND organization_id IS NULL;
    
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_record.id;
  END LOOP;
  
  RETURN NEW;
END;
$function$;