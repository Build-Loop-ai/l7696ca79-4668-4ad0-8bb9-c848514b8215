-- Add new columns to phone_numbers table
ALTER TABLE public.phone_numbers 
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS number_type TEXT DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS twilio_sid TEXT,
  ADD COLUMN IF NOT EXISTS twilio_monthly_cost_cents INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON public.phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_twilio_sid ON public.phone_numbers(twilio_sid);

-- Add forwarding columns to organizations table
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS customer_phone_number TEXT,
  ADD COLUMN IF NOT EXISTS phone_carrier TEXT,
  ADD COLUMN IF NOT EXISTS forwarding_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS forwarding_confirmed_at TIMESTAMPTZ;