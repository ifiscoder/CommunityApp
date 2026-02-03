-- NON-RECURSIVE RLS SETUP
-- This avoids recursion by checking auth.users metadata instead of profiles table

-- Step 1: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create a function that checks auth metadata (NOT the profiles table)
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if 'role' metadata is 'admin' inside the JWT
  -- This is instant and doesn't query any table
  RETURN (auth.jwt() ->> 'role') = 'admin' 
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create RLS Policies using the safe function

-- Policy 1: Users can insert their own profile (Registration)
CREATE POLICY "Users insert own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Users can select their own profile
CREATE POLICY "Users select own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can select ALL profiles
CREATE POLICY "Admins select all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (is_admin_safe());

-- Policy 5: Admins can update ALL profiles
CREATE POLICY "Admins update all"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin_safe());

-- Policy 6: Admins can delete profiles
CREATE POLICY "Admins delete"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (is_admin_safe());

-- Step 4: Important! Update existing admin user metadata
-- This is required for is_admin_safe() to work
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@community.local' OR email = 'admin@gmail.com';

-- Verify
SELECT 'RLS created without recursion!' as status;
