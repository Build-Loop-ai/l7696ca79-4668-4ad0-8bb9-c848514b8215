-- Add Google Calendar integration columns to organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS google_calendar_refresh_token text,
ADD COLUMN IF NOT EXISTS google_calendar_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_email text,
ADD COLUMN IF NOT EXISTS google_calendar_id text DEFAULT 'primary';