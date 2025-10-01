// Test script to actually submit the form and see what happens
import fs from 'fs';

const testFormSubmission = async () => {
  const url = 'https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520&AspxAutoDetectCookieSupport=1';
  
  try {
    console.log('🌐 Testing form submission...');
    
    // First, get the page
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    const pageHtml = await pageResponse.text();
    console.log('Page HTML length:', pageHtml.length);
    
    // Extract form data
    const viewStateMatch = pageHtml.match(/__VIEWSTATE.*?value="([^"]+)"/);
    const viewStateGeneratorMatch = pageHtml.match(/__VIEWSTATEGENERATOR.*?value="([^"]+)"/);
    const eventValidationMatch = pageHtml.match(/__EVENTVALIDATION.*?value="([^"]+)"/);
    
    const viewState = viewStateMatch ? viewStateMatch[1] : '';
    const viewStateGenerator = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : '';
    const eventValidation = eventValidationMatch ? eventValidationMatch[1] : '';
    
    console.log('Form data extracted:', {
      viewState: viewState ? 'present' : 'missing',
      viewStateGenerator: viewStateGenerator ? 'present' : 'missing',
      eventValidation: eventValidation ? 'present' : 'missing',
    });
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('ctl00$MainContentPHolder$txtBSDLNumber', '46894084');
    formData.append('ctl00$MainContentPHolder$ddlDriversLicenseState', 'TX');
    formData.append('ctl00$MainContentPHolder$btnSearchDL', 'Search');
    
    console.log('Submitting form...');
    
    // Submit the form
    const searchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': url,
        'Origin': 'https://www.trafficpayment.com',
      },
      body: formData.toString(),
    });
    
    console.log('Search response status:', searchResponse.status);
    const searchHtml = await searchResponse.text();
    console.log('Search response length:', searchHtml.length);
    
    // Check for results
    console.log('Contains 215064:', searchHtml.includes('215064'));
    console.log('Contains SPEEDING:', searchHtml.includes('SPEEDING'));
    console.log('Contains 243.95:', searchHtml.includes('243.95'));
    console.log('Contains 46894084:', searchHtml.includes('46894084'));
    
    // Look for any error messages
    if (searchHtml.includes('error') || searchHtml.includes('Error')) {
      console.log('❌ Error found in response');
      const errorMatch = searchHtml.match(/error[^>]*>([^<]+)</i);
      if (errorMatch) {
        console.log('Error message:', errorMatch[1]);
      }
    }
    
    // Look for any success indicators
    if (searchHtml.includes('ticket') || searchHtml.includes('citation') || searchHtml.includes('violation')) {
      console.log('✅ Found ticket-related content');
    }
    
    // Save the response to a file for inspection
    fs.writeFileSync('search-response.html', searchHtml);
    console.log('📄 Response saved to search-response.html');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testFormSubmission();
