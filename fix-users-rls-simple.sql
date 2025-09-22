-- Fix RLS policies on users table with simple insert/select policies
-- This ensures users can only insert and select their own records

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
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

-- Create simple insert policy
CREATE POLICY "Users can insert their own record"
ON users
FOR INSERT
WITH CHECK (id = auth.uid());

-- Create simple select policy
CREATE POLICY "Users can select their own record"
ON users
FOR SELECT
USING (id = auth.uid());

-- Verify policies were created
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
