import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TicketData {
  citationNo: string;
  violation: string;
  fineAmount: number;
  dueDate: string;
  courtName: string;
  source: 'shavano' | 'cibolo';
}

interface ScrapeRequest {
  source: 'shavano' | 'cibolo';
  driverLicenseNumber: string;
  state: string;
  dob: string;
}

serve(async (req) => {
  try {
    const { source, driverLicenseNumber, state, dob }: ScrapeRequest = await req.json()

    if (!source || !driverLicenseNumber || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let tickets: TicketData[] = []

    switch (source) {
      case 'shavano':
        tickets = await scrapeShavanoPark(driverLicenseNumber, state)
        break
      case 'cibolo':
        if (!dob) {
          return new Response(
            JSON.stringify({ error: 'DOB is required for Cibolo scraping' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        tickets = await scrapeCiboloCounty(driverLicenseNumber, state, dob)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid source' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ tickets, count: tickets.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ error: 'Scraping failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function scrapeShavanoPark(dlNumber: string, state: string): Promise<TicketData[]> {
  const url = 'https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520'
  
  try {
    // First, get the page to extract form data and viewstate
    const pageResponse = await fetch(url)
    const pageHtml = await pageResponse.text()
    
    // Extract viewstate and other form fields
    const viewStateMatch = pageHtml.match(/__VIEWSTATE.*?value="([^"]+)"/)
    const viewStateGeneratorMatch = pageHtml.match(/__VIEWSTATEGENERATOR.*?value="([^"]+)"/)
    const eventValidationMatch = pageHtml.match(/__EVENTVALIDATION.*?value="([^"]+)"/)
    
    const viewState = viewStateMatch ? viewStateMatch[1] : ''
    const viewStateGenerator = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : ''
    const eventValidation = eventValidationMatch ? eventValidationMatch[1] : ''
    
    // Prepare form data
    const formData = new URLSearchParams()
    formData.append('__VIEWSTATE', viewState)
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator)
    formData.append('__EVENTVALIDATION', eventValidation)
    formData.append('ctl00$ContentPlaceHolder1$txtDLNumber', dlNumber)
    formData.append('ctl00$ContentPlaceHolder1$ddlState', state)
    formData.append('ctl00$ContentPlaceHolder1$btnSearch', 'Search')
    
    // Submit the form
    const searchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    })
    
    const searchHtml = await searchResponse.text()
    
    // Parse results - look for ticket data in the response
    const tickets: TicketData[] = []
    
    // This is a simplified parser - you may need to adjust based on actual HTML structure
    const ticketRows = searchHtml.match(/<tr[^>]*class="[^"]*ticket[^"]*"[^>]*>[\s\S]*?<\/tr>/gi) || []
    
    for (const row of ticketRows) {
      const citationMatch = row.match(/citation[^>]*>([^<]+)</i)
      const violationMatch = row.match(/violation[^>]*>([^<]+)</i)
      const amountMatch = row.match(/\$?(\d+\.?\d*)/)
      const dateMatch = row.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
      
      if (citationMatch) {
        tickets.push({
          citationNo: citationMatch[1].trim(),
          violation: violationMatch ? violationMatch[1].trim() : 'Unknown',
          fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
          dueDate: dateMatch ? formatDate(dateMatch[1]) : '',
          courtName: 'Shavano Park Municipal Court',
          source: 'shavano'
        })
      }
    }
    
    return tickets
    
  } catch (error) {
    console.error('Shavano Park scraping error:', error)
    return []
  }
}

async function scrapeCiboloCounty(dlNumber: string, state: string, dob: string): Promise<TicketData[]> {
  const baseUrl = 'https://cibolotx.municipalonlinepayments.com'
  const searchUrl = `${baseUrl}/cibolotx/court/search`
  
  try {
    // First, get the search page
    const pageResponse = await fetch(searchUrl)
    const pageHtml = await pageResponse.text()
    
    // Extract CSRF token or other required form data
    const csrfMatch = pageHtml.match(/name="[^"]*csrf[^"]*".*?value="([^"]+)"/i)
    const csrfToken = csrfMatch ? csrfMatch[1] : ''
    
    // Prepare form data for driver's license search
    const formData = new URLSearchParams()
    if (csrfToken) formData.append('_token', csrfToken)
    formData.append('searchType', 'DriversLicense')
    formData.append('DriversLicense', dlNumber)
    formData.append('State', state)
    formData.append('DOB', dob)
    
    // Submit the search
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': searchUrl
      },
      body: formData.toString()
    })
    
    const searchHtml = await searchResponse.text()
    
    // Parse results - look for ticket checkboxes and data
    const tickets: TicketData[] = []
    
    // Look for ticket entries in the results
    const ticketMatches = searchHtml.match(/<div[^>]*class="[^"]*ticket[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || []
    
    for (const ticketHtml of ticketMatches) {
      const citationMatch = ticketHtml.match(/citation[^>]*>([^<]+)</i)
      const violationMatch = ticketHtml.match(/violation[^>]*>([^<]+)</i)
      const amountMatch = ticketHtml.match(/\$?(\d+\.?\d*)/)
      const dateMatch = ticketHtml.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
      
      if (citationMatch) {
        tickets.push({
          citationNo: citationMatch[1].trim(),
          violation: violationMatch ? violationMatch[1].trim() : 'Unknown',
          fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
          dueDate: dateMatch ? formatDate(dateMatch[1]) : '',
          courtName: 'Cibolo Municipal Court',
          source: 'cibolo'
        })
      }
    }
    
    return tickets
    
  } catch (error) {
    console.error('Cibolo County scraping error:', error)
    return []
  }
}

function formatDate(dateStr: string): string {
  try {
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  } catch {
    return dateStr
  }
}
