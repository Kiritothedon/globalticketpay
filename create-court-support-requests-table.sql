-- Create court_support_requests table for the court support request form
-- This table stores requests from users for court support in their area

CREATE TABLE IF NOT EXISTS court_support_requests (
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

-- Add comments to columns
COMMENT ON TABLE court_support_requests IS 'Stores requests from users for court support in their area';
COMMENT ON COLUMN court_support_requests.name IS 'Full name of the person making the request';
COMMENT ON COLUMN court_support_requests.email IS 'Email address for confirmation and follow-up';
COMMENT ON COLUMN court_support_requests.state IS 'State where court support is requested (2-letter code)';
COMMENT ON COLUMN court_support_requests.city IS 'City where court support is requested';
COMMENT ON COLUMN court_support_requests.court_name IS 'Name of the specific court';
COMMENT ON COLUMN court_support_requests.message IS 'Additional information about the request';
COMMENT ON COLUMN court_support_requests.status IS 'Current status of the request';
COMMENT ON COLUMN court_support_requests.created_at IS 'When the request was submitted';
COMMENT ON COLUMN court_support_requests.updated_at IS 'When the request was last updated';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_court_support_requests_state ON court_support_requests(state);
CREATE INDEX IF NOT EXISTS idx_court_support_requests_status ON court_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_court_support_requests_created_at ON court_support_requests(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE court_support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert court support requests (no authentication required)
CREATE POLICY "Anyone can submit court support requests" ON court_support_requests
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view requests (for admin purposes)
CREATE POLICY "Authenticated users can view court support requests" ON court_support_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT, INSERT ON court_support_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON court_support_requests TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_court_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_court_support_requests_updated_at
  BEFORE UPDATE ON court_support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_court_support_requests_updated_at();

-- Verify the table was created
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'court_support_requests' 
ORDER BY ordinal_position;
