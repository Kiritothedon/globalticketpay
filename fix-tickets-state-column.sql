-- Fix missing 'state' column in tickets table
-- This script adds the missing 'state' column that's causing the PGRST204 error

-- Add the missing 'state' column to the tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS state VARCHAR(2);

-- Add a comment to the column
COMMENT ON COLUMN tickets.state IS 'State where the violation occurred (2-letter state code)';

-- Update any existing records with a default state if needed
-- You can modify this based on your data requirements
UPDATE tickets 
SET state = 'TX' 
WHERE state IS NULL;

-- Add a check constraint to ensure valid state codes (optional)
-- This ensures only valid 2-letter state codes are entered
ALTER TABLE tickets 
ADD CONSTRAINT check_state_code 
CHECK (state ~ '^[A-Z]{2}$');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO anon;

-- Update RLS policies to include the new column
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;

-- Recreate policies with the new column
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets" ON tickets
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name = 'state';
