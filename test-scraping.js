// Test script to verify the updated scraping function
const testScraping = async () => {
  const SUPABASE_URL = 'https://iyfnoiqnyvwjyughdfym.supabase.co';
  const SUPABASE_ANON_KEY = 'your_anon_key_here'; // Replace with your actual key
  
  try {
    console.log('🧪 Testing updated scraping function...');
    
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
    
    const data = await response.json();
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.tickets && data.tickets.length > 0) {
      console.log('✅ Found tickets!');
      data.tickets.forEach((ticket, index) => {
        console.log(`\n🎫 Ticket ${index + 1}:`);
        console.log(`   Citation: ${ticket.citationNo}`);
        console.log(`   Violation: ${ticket.violation}`);
        console.log(`   Amount: $${ticket.fineAmount}`);
        console.log(`   Due Date: ${ticket.dueDate}`);
        console.log(`   Court: ${ticket.courtName}`);
      });
    } else {
      console.log('❌ No tickets found');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

// Run the test
testScraping();
