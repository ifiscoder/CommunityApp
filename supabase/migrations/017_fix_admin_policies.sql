-- Fix: Update policies to use is_admin() instead of is_admin_safe(), then drop is_admin_safe

-- Step 1: Update all policies to use is_admin()
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;

-- Recreate policies using the correct is_admin() function
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins update all profiles"
  ON public.profiles
  FOR UPDATE TO authenticated 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins delete profiles"
  ON public.profiles
  FOR DELETE TO authenticated 
  USING (is_admin(auth.uid()));

-- Step 2: Now drop is_admin_safe (no dependencies)
DROP FUNCTION IF EXISTS is_admin_safe();

-- Step 3: Ensure is_admin is correct
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$;

SELECT 'Fixed: Policies now use is_admin(), removed is_admin_safe' as status;
