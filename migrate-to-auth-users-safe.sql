-- Safe Migration: Remove custom users table and use auth.users only
-- This script safely handles existing constraints and tables

-- Step 1: Drop the custom public.users table if it exists
-- This removes the conflicting table with password_hash column
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Ensure tickets table has proper foreign key to auth.users
-- First, drop any existing foreign key constraints to avoid conflicts
ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;

-- Make sure user_id column exists and is properly typed
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add the foreign key constraint to reference auth.users(id) directly
ALTER TABLE tickets 
ADD CONSTRAINT tickets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Add a check constraint to ensure user_id is never NULL (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_tickets_user_id_not_null'
    ) THEN
        ALTER TABLE tickets 
        ADD CONSTRAINT check_tickets_user_id_not_null 
        CHECK (user_id IS NOT NULL);
    END IF;
END $$;

-- Step 3: Update RLS policies to work with auth.users
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;

-- Create new RLS policies that work with auth.users
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets" ON tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO anon;

-- Step 5: Clean up any references to public.users in other tables
-- Drop court_support_requests table if it exists
DROP TABLE IF EXISTS court_support_requests CASCADE;

-- Recreate court_support_requests without user references
CREATE TABLE court_support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  city VARCHAR(255) NOT NULL,
  court_name VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for court_support_requests
ALTER TABLE court_support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert court support requests (no authentication required)
CREATE POLICY "Anyone can submit court support requests" ON court_support_requests
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON court_support_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON court_support_requests TO authenticated;

-- Step 6: Verify the setup
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='tickets'
  AND kcu.column_name = 'user_id';

-- Verify no public.users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'users';
