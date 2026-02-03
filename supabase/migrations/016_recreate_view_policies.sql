-- Recreate RLS policies for profile viewing
-- After deleting "Users select own" and "Admins select all"

-- Policy 1: Users can view their own profile
CREATE POLICY "Users view own profile"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
-- Uses is_admin() function with SECURITY DEFINER to avoid circular dependency
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT TO authenticated 
  USING (is_admin(auth.uid()));

-- Ensure is_admin function has proper permissions
-- SECURITY DEFINER allows it to bypass RLS when checking admin status
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

SELECT 'RLS policies recreated successfully' as status;
