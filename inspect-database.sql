-- Step 1: Inspect the public.users table (schema + defaults + RLS)

-- 1. Columns + defaults
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='users';

-- 2. Check if RLS is enabled
SELECT c.relname, c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'users';

-- 3. See current policies (if any)
SELECT * FROM pg_policies WHERE schemaname='public' AND tablename='users';

-- 4. Check if there are any existing users and their ID alignment
SELECT 
  u.id as users_id,
  u.supabase_id,
  u.email,
  au.id as auth_users_id,
  au.email as auth_email
FROM users u
LEFT JOIN auth.users au ON u.supabase_id = au.id
LIMIT 5;
