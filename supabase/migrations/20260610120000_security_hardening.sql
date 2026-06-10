-- Security hardening
--
-- 1. Remove privilege-escalation hole: the "Users can insert own role" policy
--    let any authenticated user insert themselves into user_roles with any role
--    for ANY organization (the only check was user_id = auth.uid()). Roles are
--    assigned by onboarding (service role) and the invitation-acceptance trigger
--    (SECURITY DEFINER), so no legitimate client path needs this.
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- 2. call_logs could be fabricated by any authenticated user (WITH CHECK true).
--    Only the vapi-webhook writes them, using the service role.
DROP POLICY IF EXISTS "Service can insert call logs" ON public.call_logs;
CREATE POLICY "Service can insert call logs"
  ON public.call_logs FOR INSERT
  WITH CHECK (public.is_service_role());

-- 3. Lock down increment_minutes_used: it was executable by any authenticated
--    user and accepted negative values, letting anyone reset billed minutes.
CREATE OR REPLACE FUNCTION public.increment_minutes_used(org_id uuid, minutes_to_add integer)
RETURNS void AS $$
BEGIN
  IF minutes_to_add IS NULL OR minutes_to_add <= 0 THEN
    RAISE EXCEPTION 'minutes_to_add must be a positive integer';
  END IF;

  UPDATE public.subscriptions
  SET minutes_used = COALESCE(minutes_used, 0) + minutes_to_add
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_minutes_used(uuid, integer) TO service_role;

-- 4. Guard against negative balances at the data layer too.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_minutes_used_nonneg') THEN
    UPDATE public.subscriptions SET minutes_used = 0 WHERE minutes_used < 0;
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_minutes_used_nonneg CHECK (minutes_used >= 0);
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping minutes_used check: %', SQLERRM;
END $$;

-- 5. Referential integrity: invitations and system_roles were created without
--    foreign keys, leaving orphaned rows when an org or user is deleted.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_organization_id_fkey') THEN
    ALTER TABLE public.invitations
      ADD CONSTRAINT invitations_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping invitations FK: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_roles_user_id_fkey') THEN
    ALTER TABLE public.system_roles
      ADD CONSTRAINT system_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping system_roles FK: %', SQLERRM;
END $$;

-- 6. Invitation acceptance applied the invited role only if the user had none
--    (ON CONFLICT DO NOTHING). Apply the invited role on conflict instead.
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  FOR invitation_record IN
    SELECT * FROM public.invitations
    WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  LOOP
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, invitation_record.organization_id, invitation_record.role)
    ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role;

    UPDATE public.profiles
    SET
      organization_id = invitation_record.organization_id,
      onboarding_completed = true
    WHERE id = NEW.id AND organization_id IS NULL;

    UPDATE public.invitations
    SET status = 'accepted', accepted_at = now()
    WHERE id = invitation_record.id;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- 7. Webhook idempotency: dedupe call_logs and enforce uniqueness on
--    vapi_call_id so retried end-of-call reports cannot double-bill.
DO $$
BEGIN
  DELETE FROM public.call_logs a
  USING public.call_logs b
  WHERE a.vapi_call_id IS NOT NULL
    AND a.vapi_call_id = b.vapi_call_id
    AND a.created_at > b.created_at;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_call_logs_vapi_call_id') THEN
    CREATE UNIQUE INDEX uq_call_logs_vapi_call_id
      ON public.call_logs (vapi_call_id)
      WHERE vapi_call_id IS NOT NULL;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping call_logs unique index: %', SQLERRM;
END $$;

-- 8. Indexes for invitation lookups (acceptance trigger + admin list).
CREATE INDEX IF NOT EXISTS idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email_pending
  ON public.invitations(email) WHERE status = 'pending';
