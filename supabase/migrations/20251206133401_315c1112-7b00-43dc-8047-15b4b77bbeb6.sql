-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Users can insert organization" ON public.organizations;

CREATE POLICY "Users can insert organization" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);