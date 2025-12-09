-- Create assessment_leads table for storing quiz responses
CREATE TABLE public.assessment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (lead capture)
CREATE POLICY "Anyone can submit assessment" 
ON public.assessment_leads 
FOR INSERT 
WITH CHECK (true);

-- Super admins can view all assessment leads
CREATE POLICY "Super admins can view assessment leads" 
ON public.assessment_leads 
FOR SELECT 
USING (is_system_admin(auth.uid()));

-- Super admins can delete assessment leads
CREATE POLICY "Super admins can delete assessment leads" 
ON public.assessment_leads 
FOR DELETE 
USING (is_system_admin(auth.uid()));