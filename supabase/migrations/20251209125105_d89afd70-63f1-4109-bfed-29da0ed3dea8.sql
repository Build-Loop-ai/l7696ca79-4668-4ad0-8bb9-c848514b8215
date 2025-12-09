-- Create contact_requests table
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Service/edge functions can insert (public form)
CREATE POLICY "Anyone can submit contact request"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);

-- Super admins can view all contact requests
CREATE POLICY "Super admins can view contact requests"
ON public.contact_requests
FOR SELECT
USING (is_system_admin(auth.uid()));

-- Super admins can update contact requests
CREATE POLICY "Super admins can update contact requests"
ON public.contact_requests
FOR UPDATE
USING (is_system_admin(auth.uid()));

-- Super admins can delete contact requests
CREATE POLICY "Super admins can delete contact requests"
ON public.contact_requests
FOR DELETE
USING (is_system_admin(auth.uid()));