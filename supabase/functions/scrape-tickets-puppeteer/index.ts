import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"

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
        tickets = await scrapeShavanoParkWithPuppeteer(driverLicenseNumber, state)
        break
      case 'cibolo':
        if (!dob) {
          return new Response(
            JSON.stringify({ error: 'DOB is required for Cibolo scraping' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        tickets = await scrapeCiboloCountyWithPuppeteer(driverLicenseNumber, state, dob)
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

async function scrapeShavanoParkWithPuppeteer(dlNumber: string, state: string): Promise<TicketData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    const url = 'https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520'
    await page.goto(url, { waitUntil: 'networkidle2' })
    
    // Fill in the form
    await page.type('input[name="ctl00$ContentPlaceHolder1$txtDLNumber"]', dlNumber)
    await page.select('select[name="ctl00$ContentPlaceHolder1$ddlState"]', state)
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('input[type="submit"][value="Search"]')
    ])
    
    // Wait for results to load
    await page.waitForTimeout(2000)
    
    // Extract ticket data
    const tickets = await page.evaluate(() => {
      const results: TicketData[] = []
      
      // Look for ticket rows in various possible table structures
      const ticketRows = document.querySelectorAll('tr[class*="ticket"], .ticket-row, .result-row, tr:has(td:contains("Citation"))')
      
      ticketRows.forEach((row) => {
        const cells = row.querySelectorAll('td')
        if (cells.length >= 3) {
          const citationNo = cells[0]?.textContent?.trim() || ''
          const violation = cells[1]?.textContent?.trim() || 'Unknown'
          const amountText = cells[2]?.textContent?.trim() || '0'
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0
          
          if (citationNo && citationNo !== 'Citation No') {
            results.push({
              citationNo,
              violation,
              fineAmount: amount,
              dueDate: '', // Will be filled from other cells if available
              courtName: 'Shavano Park Municipal Court',
              source: 'shavano'
            })
          }
        }
      })
      
      // Also look for tickets in other possible formats
      const ticketCards = document.querySelectorAll('.ticket-card, .violation-item, [class*="ticket"]')
      ticketCards.forEach((card) => {
        const citationMatch = card.textContent?.match(/citation[:\s]*([A-Z0-9-]+)/i)
        const amountMatch = card.textContent?.match(/\$?(\d+\.?\d*)/)
        
        if (citationMatch) {
          results.push({
            citationNo: citationMatch[1],
            violation: 'Unknown',
            fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
            dueDate: '',
            courtName: 'Shavano Park Municipal Court',
            source: 'shavano'
          })
        }
      })
      
      return results
    })
    
    return tickets
    
  } catch (error) {
    console.error('Shavano Park scraping error:', error)
    return []
  } finally {
    await browser.close()
  }
}

async function scrapeCiboloCountyWithPuppeteer(dlNumber: string, state: string, dob: string): Promise<TicketData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    const url = 'https://cibolotx.municipalonlinepayments.com/cibolotx/court/search'
    await page.goto(url, { waitUntil: 'networkidle2' })
    
    // Click on Driver's License option
    try {
      await page.click('#option-DriversLicense > div')
      await page.waitForTimeout(1000)
    } catch {
      // Try alternative selector
      await page.evaluate(() => {
        const element = document.querySelector('[data-search-type="DriversLicense"], .search-type-drivers-license')
        if (element) (element as HTMLElement).click()
      })
    }
    
    // Fill in the form
    await page.type('input[name="DriversLicense"]', dlNumber)
    await page.select('select[name="State"]', state)
    await page.type('input[name="DOB"]', dob)
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"], input[type="submit"]')
    ])
    
    // Wait for results
    await page.waitForTimeout(3000)
    
    // Extract ticket data
    const tickets = await page.evaluate(() => {
      const results: TicketData[] = []
      
      // Look for ticket checkboxes and their associated data
      const ticketCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="ticket"], input[type="checkbox"][name*="citation"]')
      
      ticketCheckboxes.forEach((checkbox) => {
        const row = checkbox.closest('tr, .ticket-row, .violation-row')
        if (row) {
          const citationNo = row.querySelector('[data-citation], .citation-number, .ticket-number')?.textContent?.trim() || 
                           checkbox.getAttribute('value') || 
                           checkbox.getAttribute('data-citation') || ''
          
          const violation = row.querySelector('[data-violation], .violation, .offense')?.textContent?.trim() || 'Unknown'
          
          const amountText = row.querySelector('[data-amount], .amount, .fine')?.textContent?.trim() || '0'
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0
          
          const dueDateText = row.querySelector('[data-due-date], .due-date, .payment-due')?.textContent?.trim() || ''
          const dueDate = dueDateText ? formatDate(dueDateText) : ''
          
          if (citationNo) {
            results.push({
              citationNo,
              violation,
              fineAmount: amount,
              dueDate,
              courtName: 'Cibolo Municipal Court',
              source: 'cibolo'
            })
          }
        }
      })
      
      // Also look for tickets in other formats
      const ticketElements = document.querySelectorAll('.ticket-item, .violation-item, [class*="ticket"]')
      ticketElements.forEach((element) => {
        const citationMatch = element.textContent?.match(/citation[:\s]*([A-Z0-9-]+)/i)
        const amountMatch = element.textContent?.match(/\$?(\d+\.?\d*)/)
        
        if (citationMatch) {
          results.push({
            citationNo: citationMatch[1],
            violation: 'Unknown',
            fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
            dueDate: '',
            courtName: 'Cibolo Municipal Court',
            source: 'cibolo'
          })
        }
      })
      
      return results
    })
    
    return tickets
    
  } catch (error) {
    console.error('Cibolo County scraping error:', error)
    return []
  } finally {
    await browser.close()
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
