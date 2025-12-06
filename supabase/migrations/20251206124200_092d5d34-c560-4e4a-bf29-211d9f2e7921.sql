-- Add language and voice configuration columns to organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en-US';

ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS voice_provider VARCHAR(50) DEFAULT 'azure';

ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS voice_id VARCHAR(100) DEFAULT 'en-US-AriaNeural';

ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS custom_greeting TEXT;

ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS transcriber_language VARCHAR(20) DEFAULT 'en-US';