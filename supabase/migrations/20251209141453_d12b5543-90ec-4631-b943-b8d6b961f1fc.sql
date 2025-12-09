-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view site assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

-- Allow super admins to upload
CREATE POLICY "Super admins can upload site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-assets' AND is_system_admin(auth.uid()));

-- Allow super admins to update
CREATE POLICY "Super admins can update site assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-assets' AND is_system_admin(auth.uid()));

-- Allow super admins to delete
CREATE POLICY "Super admins can delete site assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-assets' AND is_system_admin(auth.uid()));