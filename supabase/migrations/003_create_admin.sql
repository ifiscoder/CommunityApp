-- STEP 3: Create Admin User
-- Run this AFTER creating the user in Auth UI

-- Instructions:
-- 1. Go to Authentication → Users in Supabase
-- 2. Click "Add user"
-- 3. Email: admin@community.local
-- 4. Password: Admin123!
-- 5. Check "Auto-confirm email"
-- 6. Click "Create user"
-- 7. Then run this SQL

INSERT INTO public.profiles (
  id, email, role, full_name, phone, 
  address_street, address_city, address_state, address_postal,
  is_verified, is_approved, is_deleted
)
SELECT 
  id,
  email,
  'admin',
  'System Administrator',
  '+1-000-000-0000',
  'Admin Office',
  'Admin City',
  'Admin State',
  '00000',
  true,
  true,
  false
FROM auth.users 
WHERE email = 'admin@community.local'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  is_approved = true;

-- Verify admin was created
SELECT email, role, is_verified, is_approved 
FROM public.profiles 
WHERE email = 'admin@community.local';
