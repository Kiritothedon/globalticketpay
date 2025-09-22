-- Clean up duplicate RLS policies and create clean ones
-- This will remove all existing policies and create only the necessary ones

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;
DROP POLICY IF EXISTS "User select own" ON users;
DROP POLICY IF EXISTS "User insert own" ON users;
DROP POLICY IF EXISTS "User update own" ON users;
DROP POLICY IF EXISTS "User delete own" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can select their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create ONLY the essential policies
CREATE POLICY "Users can insert their own record"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can select their own record"
ON users
FOR SELECT
USING (id = auth.uid());

-- Verify only the correct policies exist
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;
