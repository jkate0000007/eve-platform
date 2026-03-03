-- Add country field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Update the RLS policy to allow users to update their own country
-- (This should already be covered by the existing policy, but just in case)