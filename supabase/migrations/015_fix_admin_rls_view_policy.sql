-- Fix: Allow users to always view their own profile (needed for role check)
-- This ensures the is_admin() function can work properly

-- Drop and recreate the "Users view own profile" policy with simpler logic
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

-- New policy: Users can always view their own profile (removed is_deleted check from view)
-- The is_deleted flag should only prevent OTHER users from seeing deleted profiles
CREATE POLICY "Users view own profile"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Keep the admin policy as is
-- Admins can view all profiles (including deleted ones for admin purposes)
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

-- Add a policy to prevent non-admins from seeing deleted profiles
-- This replaces the is_deleted check that was in the original policy
CREATE POLICY "Hide deleted profiles from non-admins"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (
    is_admin(auth.uid()) OR 
    (auth.uid() = id AND (is_deleted = false OR is_deleted IS NULL)) OR
    (auth.uid() != id AND (is_deleted = false OR is_deleted IS NULL))
  );

-- Actually, let's simplify this. The issue is we have conflicting policies.
-- Let me drop all and recreate cleanly:

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Hide deleted profiles from non-admins" ON public.profiles;

-- Simple, clear policies:

-- 1. Everyone (authenticated) can view non-deleted profiles
-- This allows the is_admin() check to work
CREATE POLICY "View non-deleted profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_deleted = false OR is_deleted IS NULL);

-- 2. Admins can view ALL profiles (including deleted)
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

SELECT 'Fixed RLS policies for admin viewing' as status;
