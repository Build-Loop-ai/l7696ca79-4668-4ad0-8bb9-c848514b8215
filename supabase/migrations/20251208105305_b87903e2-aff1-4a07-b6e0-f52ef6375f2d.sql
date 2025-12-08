-- Add description and special_instructions columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;