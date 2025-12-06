-- Create appointments table for booking via AI
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  call_id uuid REFERENCES public.call_logs(id),
  patient_name text NOT NULL,
  phone_number text,
  email text,
  scheduled_at timestamptz NOT NULL,
  service_type text,
  notes text,
  status text DEFAULT 'confirmed',
  google_calendar_event_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX appointments_org_date_idx ON public.appointments(organization_id, scheduled_at);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS policies for appointments
CREATE POLICY "Members can view own org appointments" ON public.appointments
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Members can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Members can update appointments" ON public.appointments
  FOR UPDATE USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Service can insert appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to increment minutes used for billing
CREATE OR REPLACE FUNCTION public.increment_minutes_used(org_id uuid, minutes_to_add integer)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET minutes_used = COALESCE(minutes_used, 0) + minutes_to_add
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for call_logs to show live call updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;