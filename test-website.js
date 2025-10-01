// Test script to check what the Shavano Park website returns
const testWebsite = async () => {
  const url = 'https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520&AspxAutoDetectCookieSupport=1';
  
  try {
    console.log('🌐 Testing Shavano Park website...');
    
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
    
    console.log('Page response status:', pageResponse.status);
    const pageHtml = await pageResponse.text();
    console.log('Page HTML length:', pageHtml.length);
    
    // Check for form elements
    console.log('Contains __VIEWSTATE:', pageHtml.includes('__VIEWSTATE'));
    console.log('Contains txtDLNumber:', pageHtml.includes('txtDLNumber'));
    console.log('Contains ddlState:', pageHtml.includes('ddlState'));
    console.log('Contains btnSearch:', pageHtml.includes('btnSearch'));
    
    // Look for any input fields
    const inputMatches = pageHtml.match(/<input[^>]*name="[^"]*"[^>]*>/gi) || [];
    console.log('Found input fields:', inputMatches.length);
    inputMatches.forEach((input, index) => {
      const nameMatch = input.match(/name="([^"]*)"/);
      if (nameMatch) {
        console.log(`Input ${index + 1}:`, nameMatch[1]);
      }
    });
    
    // Look for select fields
    const selectMatches = pageHtml.match(/<select[^>]*name="[^"]*"[^>]*>/gi) || [];
    console.log('Found select fields:', selectMatches.length);
    selectMatches.forEach((select, index) => {
      const nameMatch = select.match(/name="([^"]*)"/);
      if (nameMatch) {
        console.log(`Select ${index + 1}:`, nameMatch[1]);
      }
    });
    
    // Look for button elements
    const buttonMatches = pageHtml.match(/<input[^>]*type="submit"[^>]*>/gi) || [];
    console.log('Found submit buttons:', buttonMatches.length);
    buttonMatches.forEach((button, index) => {
      const nameMatch = button.match(/name="([^"]*)"/);
      const valueMatch = button.match(/value="([^"]*)"/);
      if (nameMatch) {
        console.log(`Button ${index + 1}:`, nameMatch[1], valueMatch ? `(${valueMatch[1]})` : '');
      }
    });
    
    // Look for any button elements (including regular buttons)
    const allButtonMatches = pageHtml.match(/<button[^>]*>/gi) || [];
    console.log('Found all buttons:', allButtonMatches.length);
    allButtonMatches.forEach((button, index) => {
      const nameMatch = button.match(/name="([^"]*)"/);
      const idMatch = button.match(/id="([^"]*)"/);
      if (nameMatch || idMatch) {
        console.log(`Button ${index + 1}:`, nameMatch ? nameMatch[1] : idMatch[1]);
      }
    });
    
    // Look for any input with type button
    const inputButtonMatches = pageHtml.match(/<input[^>]*type="button"[^>]*>/gi) || [];
    console.log('Found input buttons:', inputButtonMatches.length);
    inputButtonMatches.forEach((button, index) => {
      const nameMatch = button.match(/name="([^"]*)"/);
      const valueMatch = button.match(/value="([^"]*)"/);
      if (nameMatch) {
        console.log(`Input Button ${index + 1}:`, nameMatch[1], valueMatch ? `(${valueMatch[1]})` : '');
      }
    });
    
    // Extract viewstate
    const viewStateMatch = pageHtml.match(/__VIEWSTATE.*?value="([^"]+)"/);
    const viewState = viewStateMatch ? viewStateMatch[1] : '';
    console.log('ViewState found:', viewState ? 'Yes' : 'No');
    console.log('ViewState length:', viewState.length);
    
    if (viewState) {
      console.log('ViewState sample:', viewState.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testWebsite();
