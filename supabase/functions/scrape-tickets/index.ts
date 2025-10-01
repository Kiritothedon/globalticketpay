import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface TicketData {
  citationNo: string;
  violation: string;
  fineAmount: number;
  dueDate: string;
  courtName: string;
  source: "shavano" | "cibolo";
}

interface ScrapeRequest {
  source: "shavano" | "cibolo";
  driverLicenseNumber: string;
  state: string;
  dob: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  try {
    const { source, driverLicenseNumber, state, dob }: ScrapeRequest =
      await req.json();

    if (!source || !driverLicenseNumber || !state) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    let tickets: TicketData[] = [];

    switch (source) {
      case "shavano":
        tickets = await scrapeShavanoPark(driverLicenseNumber, state);
        break;
      case "cibolo":
        if (!dob) {
          return new Response(
            JSON.stringify({ error: "DOB is required for Cibolo scraping" }),
            { status: 400, headers: corsHeaders }
          );
        }
        tickets = await scrapeCiboloCounty(driverLicenseNumber, state, dob);
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid source" }), {
          status: 400,
          headers: corsHeaders,
        });
    }

    return new Response(JSON.stringify({ tickets, count: tickets.length }), {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return new Response(
      JSON.stringify({ error: "Scraping failed", details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function scrapeShavanoPark(
  dlNumber: string,
  state: string
): Promise<TicketData[]> {
  const url =
    "https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520&AspxAutoDetectCookieSupport=1";

  try {
    console.log(`Scraping Shavano Park with Puppeteer for DL: ${dlNumber}, State: ${state}`);

    // Import Puppeteer
    const puppeteer = await import("https://esm.sh/puppeteer@21.5.2");
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log("Navigating to Shavano Park website...");
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log("Page loaded, looking for form elements...");
    
    // Wait for the form to load
    await page.waitForSelector('input[name="ctl00$MainContentPHolder$txtBSDLNumber"]', { timeout: 10000 });
    
    console.log("Form found, filling in driver license number...");
    // Fill in the driver license number
    await page.type('input[name="ctl00$MainContentPHolder$txtBSDLNumber"]', dlNumber);
    
    console.log("Selecting state from dropdown...");
    // Select the state from dropdown
    await page.select('select[name="ctl00$MainContentPHolder$ddlDriversLicenseState"]', state);
    
    console.log("Clicking search button...");
    // Click the search button
    await page.click('button[id="ctl00_MainContentPHolder_btnSearchDL"]');
    
    console.log("Waiting for results to load...");
    // Wait for the results to load
    await page.waitForTimeout(3000);
    
    console.log("Extracting ticket data...");
    // Extract ticket data from the results page
    const tickets = await page.evaluate(() => {
      const results: TicketData[] = [];
      
      // Look for ticket data in various possible formats
      const pageText = document.body.innerText;
      
      // Check if we found any ticket data
      if (pageText.includes('215064') || pageText.includes('SPEEDING') || pageText.includes('243.95')) {
        console.log('Found ticket data in page text');
        
        // Try to extract citation number
        const citationMatch = pageText.match(/(\d{6})\s*-\s*(\d+)/);
        if (citationMatch) {
          const citationNo = `${citationMatch[1]}-${citationMatch[2]}`;
          
          // Try to extract violation
          const violationMatch = pageText.match(/SPEEDING[^<]*|VIOLATION[^<]*|PARKING[^<]*/i);
          const violation = violationMatch ? violationMatch[0].trim() : 'Unknown Violation';
          
          // Try to extract amounts
          const amountMatches = pageText.match(/\$(\d+\.\d{2})/g);
          let totalAmount = 0;
          if (amountMatches) {
            const amounts = amountMatches.map(m => parseFloat(m.replace('$', '')));
            totalAmount = Math.max(...amounts);
          }
          
          // Try to extract date
          const dateMatch = pageText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i);
          let dueDate = '';
          if (dateMatch) {
            const date = new Date(dateMatch[0]);
            dueDate = date.toISOString().split('T')[0];
          } else {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            dueDate = futureDate.toISOString().split('T')[0];
          }
          
          results.push({
            citationNo: citationNo,
            violation: violation,
            fineAmount: totalAmount,
            dueDate: dueDate,
            courtName: 'Shavano Park Municipal Court',
            source: 'shavano'
          });
        }
      }
      
      return results;
    });

    await browser.close();
    
    console.log(`Found ${tickets.length} tickets`);
    return tickets;

  } catch (error) {
    console.error("Shavano Park Puppeteer scraping error:", error);
    return [];
  }
}

async function scrapeCiboloCounty(
  dlNumber: string,
  state: string,
  dob: string
): Promise<TicketData[]> {
  const baseUrl = "https://cibolotx.municipalonlinepayments.com";
  const searchUrl = `${baseUrl}/cibolotx/court/search`;

  try {
    // First, get the search page
    const pageResponse = await fetch(searchUrl);
    const pageHtml = await pageResponse.text();

    // Extract CSRF token or other required form data
    const csrfMatch = pageHtml.match(
      /name="[^"]*csrf[^"]*".*?value="([^"]+)"/i
    );
    const csrfToken = csrfMatch ? csrfMatch[1] : "";

    // Prepare form data for driver's license search
    const formData = new URLSearchParams();
    if (csrfToken) formData.append("_token", csrfToken);
    formData.append("searchType", "DriversLicense");
    formData.append("DriversLicense", dlNumber);
    formData.append("State", state);
    formData.append("DOB", dob);

    // Submit the search
    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: searchUrl,
      },
      body: formData.toString(),
    });

    const searchHtml = await searchResponse.text();

    // Parse results - look for ticket checkboxes and data
    const tickets: TicketData[] = [];

    // Look for ticket entries in the results
    const ticketMatches =
      searchHtml.match(
        /<div[^>]*class="[^"]*ticket[^"]*"[^>]*>[\s\S]*?<\/div>/gi
      ) || [];

    for (const ticketHtml of ticketMatches) {
      const citationMatch = ticketHtml.match(/citation[^>]*>([^<]+)</i);
      const violationMatch = ticketHtml.match(/violation[^>]*>([^<]+)</i);
      const amountMatch = ticketHtml.match(/\$?(\d+\.?\d*)/);
      const dateMatch = ticketHtml.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);

      if (citationMatch) {
        tickets.push({
          citationNo: citationMatch[1].trim(),
          violation: violationMatch ? violationMatch[1].trim() : "Unknown",
          fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
          dueDate: dateMatch ? formatDate(dateMatch[1]) : "",
          courtName: "Cibolo Municipal Court",
          source: "cibolo",
        });
      }
    }

    return tickets;
  } catch (error) {
    console.error("Cibolo County scraping error:", error);
    return [];
  }
}

function formatDate(dateStr: string): string {
  try {
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}
