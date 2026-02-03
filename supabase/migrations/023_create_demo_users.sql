-- Create 5 demo accounts with password 12345678
-- Using individual inserts without ON CONFLICT

-- Demo User 1
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo1@example.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'demo1@example.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Demo User One", "phone": "1111111111", "address_street": "Demo St 1", "address_city": "Demo City", "address_state": "DS", "address_postal": "11111"}'::jsonb
    );
  END IF;
END $$;

-- Demo User 2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo2@example.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'demo2@example.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Demo User Two", "phone": "2222222222", "address_street": "Demo St 2", "address_city": "Demo City", "address_state": "DS", "address_postal": "22222"}'::jsonb
    );
  END IF;
END $$;

-- Demo User 3
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo3@example.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'demo3@example.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Demo User Three", "phone": "3333333333", "address_street": "Demo St 3", "address_city": "Demo City", "address_state": "DS", "address_postal": "33333"}'::jsonb
    );
  END IF;
END $$;

-- Demo User 4
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo4@example.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'demo4@example.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Demo User Four", "phone": "4444444444", "address_street": "Demo St 4", "address_city": "Demo City", "address_state": "DS", "address_postal": "44444"}'::jsonb
    );
  END IF;
END $$;

-- Demo User 5
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo5@example.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'demo5@example.com',
      crypt('12345678', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Demo User Five", "phone": "5555555555", "address_street": "Demo St 5", "address_city": "Demo City", "address_state": "DS", "address_postal": "55555"}'::jsonb
    );
  END IF;
END $$;

-- Verify
SELECT email, created_at FROM auth.users WHERE email LIKE 'demo%@example.com' ORDER BY email;
