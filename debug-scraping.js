// Debug script to test the scraping function
import fs from 'fs';

const testScraping = async () => {
  const SUPABASE_URL = 'https://iyfnoiqnyvwjyughdfym.supabase.co';
  
  // Get the anon key from .env.local
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  const SUPABASE_ANON_KEY = anonKeyMatch ? anonKeyMatch[1] : '';

  if (!SUPABASE_ANON_KEY) {
    console.log('❌ No Supabase anon key found in .env.local');
    return;
  }

  try {
    console.log('🧪 Testing scraping function...');
    console.log('Using anon key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'shavano',
        driverLicenseNumber: '46894084',
        state: 'TX',
        dob: ''
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testScraping();
