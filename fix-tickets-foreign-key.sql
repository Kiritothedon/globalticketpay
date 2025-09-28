-- Fix tickets table foreign key constraints
-- This script ensures the tickets table has proper foreign key relationships

-- First, check if the tickets table exists and has the correct structure
-- If not, create it with the proper schema

-- Drop existing foreign key constraint if it exists (to avoid conflicts)
ALTER TABLE IF EXISTS tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey;

-- Ensure the tickets table has the user_id column with proper foreign key
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;

-- Add the foreign key constraint to reference auth.users(id)
ALTER TABLE tickets 
ADD CONSTRAINT tickets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Update any existing tickets that might have NULL user_id
-- This is a safety measure - in practice, all tickets should have user_id
UPDATE tickets 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Add a check constraint to ensure user_id is never NULL
ALTER TABLE tickets 
ADD CONSTRAINT check_tickets_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- Ensure RLS policies are in place
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;

-- Recreate RLS policies
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets" ON tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO anon;

-- Verify the foreign key constraint was created
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
