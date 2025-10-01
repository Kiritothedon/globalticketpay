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

// County scraper interface for future extensibility
interface CountyScraper {
  name: string;
  searchTickets(params: { driverLicenseNumber: string; state: string; dob?: string }): Promise<TicketData[]>;
}

// Shavano Park scraper implementation
class ShavanoParkScraper implements CountyScraper {
  name = "shavano";
  private readonly baseUrl = "https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520&AspxAutoDetectCookieSupport=1";

  async searchTickets(params: { driverLicenseNumber: string; state: string; dob?: string }): Promise<TicketData[]> {
    try {
      console.log(`[ShavanoParkScraper] Starting search for DL: ${params.driverLicenseNumber}, State: ${params.state}`);

      // Import Playwright
      const { chromium } = await import("https://esm.sh/playwright@1.40.0");
      
      // Launch browser
      const browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 720 }
      });

      const page = await context.newPage();

      console.log("[ShavanoParkScraper] Navigating to website...");
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      console.log("[ShavanoParkScraper] Waiting for form elements...");
      
      // Wait for the driver license input field
      await page.waitForSelector('input[name="ctl00$MainContentPHolder$txtBSDLNumber"]', { 
        timeout: 15000 
      });

      console.log("[ShavanoParkScraper] Filling driver license number...");
      // Clear and fill the driver license number
      await page.fill('input[name="ctl00$MainContentPHolder$txtBSDLNumber"]', params.driverLicenseNumber);

      console.log("[ShavanoParkScraper] Selecting state from dropdown...");
      // Select the state from dropdown
      await page.selectOption('select[name="ctl00$MainContentPHolder$ddlDriversLicenseState"]', params.state);

      console.log("[ShavanoParkScraper] Clicking search button...");
      // Click the search button
      await page.click('button[id="ctl00_MainContentPHolder_btnSearchDL"]');

      console.log("[ShavanoParkScraper] Waiting for results to load...");
      // Wait for results to load - look for either results or "no results" message
      try {
        await page.waitForSelector('table, .no-results, .error, [id*="results"], [class*="result"]', { 
          timeout: 10000 
        });
      } catch (e) {
        console.log("[ShavanoParkScraper] No specific results selector found, waiting for page to stabilize...");
        await page.waitForTimeout(3000);
      }

      console.log("[ShavanoParkScraper] Extracting ticket data...");
      // Extract ticket data from the results page
      const tickets = await page.evaluate(() => {
        const results: TicketData[] = [];
        
        // Get all text content from the page
        const pageText = document.body.innerText;
        console.log('Page text length:', pageText.length);
        
        // Look for citation number patterns (e.g., "215064 - 1", "215064-1")
        const citationPatterns = [
          /(\d{6})\s*-\s*(\d+)/g,
          /citation[^>]*>([^<]+)</gi,
          /ticket[^>]*>([^<]+)</gi
        ];

        let citations: string[] = [];
        for (const pattern of citationPatterns) {
          const matches = [...pageText.matchAll(pattern)];
          citations = matches.map(match => {
            if (match[1] && match[2]) {
              return `${match[1]}-${match[2]}`;
            }
            return match[1] || match[0];
          }).filter(Boolean);
          if (citations.length > 0) break;
        }

        console.log('Found citations:', citations);

        // If we found citations, extract data for each
        if (citations.length > 0) {
          for (const citation of citations) {
            // Look for violation description near the citation
            const violationPatterns = [
              /SPEEDING[^<>\n]*/gi,
              /VIOLATION[^<>\n]*/gi,
              /PARKING[^<>\n]*/gi,
              /RED LIGHT[^<>\n]*/gi,
              /STOP SIGN[^<>\n]*/gi
            ];

            let violation = 'Unknown Violation';
            for (const pattern of violationPatterns) {
              const match = pageText.match(pattern);
              if (match) {
                violation = match[0].trim();
                break;
              }
            }

            // Look for amounts
            const amountPatterns = [
              /\$(\d+\.\d{2})/g,
              /(\d+\.\d{2})/g
            ];

            let totalAmount = 0;
            for (const pattern of amountPatterns) {
              const matches = [...pageText.matchAll(pattern)];
              if (matches.length > 0) {
                const amounts = matches.map(m => parseFloat(m[1] || m[0]));
                totalAmount = Math.max(...amounts);
                break;
              }
            }

            // Look for date
            const datePatterns = [
              /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/gi,
              /(\d{1,2}\/\d{1,2}\/\d{4})/g
            ];

            let dueDate = '';
            for (const pattern of datePatterns) {
              const match = pageText.match(pattern);
              if (match) {
                const date = new Date(match[0]);
                if (!isNaN(date.getTime())) {
                  dueDate = date.toISOString().split('T')[0];
                  break;
                }
              }
            }

            if (!dueDate) {
              // Fallback to 30 days from now
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + 30);
              dueDate = futureDate.toISOString().split('T')[0];
            }

            results.push({
              citationNo: citation,
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
      
      console.log(`[ShavanoParkScraper] Found ${tickets.length} tickets`);
      return tickets;

    } catch (error) {
      console.error("[ShavanoParkScraper] Error:", error);
      throw new Error(`Shavano Park scraping failed: ${error.message}`);
    }
  }
}

// Cibolo County scraper (placeholder for future implementation)
class CiboloCountyScraper implements CountyScraper {
  name = "cibolo";
  
  async searchTickets(params: { driverLicenseNumber: string; state: string; dob?: string }): Promise<TicketData[]> {
    // TODO: Implement Cibolo County scraping
    console.log("[CiboloCountyScraper] Not implemented yet");
    return [];
  }
}

// Scraper registry for easy county additions
const scraperRegistry: Record<string, CountyScraper> = {
  shavano: new ShavanoParkScraper(),
  cibolo: new CiboloCountyScraper()
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  try {
    const { source, driverLicenseNumber, state, dob }: ScrapeRequest = await req.json();

    if (!source || !driverLicenseNumber || !state) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get the appropriate scraper
    const scraper = scraperRegistry[source];
    if (!scraper) {
      return new Response(
        JSON.stringify({ error: `Unsupported source: ${source}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[EdgeFunction] Using ${scraper.name} scraper for ${source}`);

    // Search for tickets
    const tickets = await scraper.searchTickets({
      driverLicenseNumber,
      state,
      dob
    });

    return new Response(JSON.stringify({ 
      tickets, 
      count: tickets.length,
      source: scraper.name 
    }), {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("[EdgeFunction] Scraping error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Scraping failed", 
        details: error.message,
        fallback: "We couldn't retrieve your ticket automatically. Please add it manually."
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
