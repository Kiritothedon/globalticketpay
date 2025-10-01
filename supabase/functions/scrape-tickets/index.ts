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
    console.log(`Scraping Shavano Park for DL: ${dlNumber}, State: ${state}`);

    // First, get the page to extract form data and viewstate
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status}`);
    }

    const pageHtml = await pageResponse.text();
    console.log("Page fetched successfully, length:", pageHtml.length);

    // Extract viewstate and other form fields
    const viewStateMatch = pageHtml.match(/__VIEWSTATE.*?value="([^"]+)"/);
    const viewStateGeneratorMatch = pageHtml.match(
      /__VIEWSTATEGENERATOR.*?value="([^"]+)"/
    );
    const eventValidationMatch = pageHtml.match(
      /__EVENTVALIDATION.*?value="([^"]+)"/
    );
    const tssmMatch = pageHtml.match(/ctl00_RadStyleSheetManager1_TSSM.*?value="([^"]+)"/);
    const tsmMatch = pageHtml.match(/ctl00_scriptManager1_TSM.*?value="([^"]+)"/);

    const viewState = viewStateMatch ? viewStateMatch[1] : "";
    const viewStateGenerator = viewStateGeneratorMatch
      ? viewStateGeneratorMatch[1]
      : "";
    const eventValidation = eventValidationMatch ? eventValidationMatch[1] : "";
    const tssm = tssmMatch ? tssmMatch[1] : "";
    const tsm = tsmMatch ? tsmMatch[1] : "";

    console.log("Form fields extracted:", {
      viewState: viewState ? "present" : "missing",
      viewStateGenerator: viewStateGenerator ? "present" : "missing",
      eventValidation: eventValidation ? "present" : "missing",
      tssm: tssm ? "present" : "missing",
      tsm: tsm ? "present" : "missing",
    });

    // Prepare form data with correct field names
    const formData = new URLSearchParams();
    formData.append("__VIEWSTATE", viewState);
    formData.append("__VIEWSTATEGENERATOR", viewStateGenerator);
    formData.append("__EVENTVALIDATION", eventValidation);
    formData.append("ctl00$RadStyleSheetManager1$TSSM", tssm);
    formData.append("ctl00$scriptManager1$TSM", tsm);
    formData.append("ctl00$MainContentPHolder$txtBSDLNumber", dlNumber);
    formData.append("ctl00$MainContentPHolder$ddlDriversLicenseState", state);
    formData.append("ctl00$MainContentPHolder$btnSearchDL", "Search");

    // Submit the form
    const searchResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        Referer: url,
        Origin: "https://www.trafficpayment.com",
      },
      body: formData.toString(),
    });

    if (!searchResponse.ok) {
      throw new Error(`Search request failed: ${searchResponse.status}`);
    }

    const searchHtml = await searchResponse.text();
    console.log("Search response received, length:", searchHtml.length);

    // Parse results - look for ticket data in the response
    const tickets: TicketData[] = [];

    console.log("Parsing search results...");
    console.log("Response length:", searchHtml.length);
    console.log("Response contains '215064':", searchHtml.includes("215064"));
    console.log("Response contains 'SPEEDING':", searchHtml.includes("SPEEDING"));
    console.log("Response contains '$243.95':", searchHtml.includes("243.95"));

    // Check if there's a "no results" message
    if (
      searchHtml.includes("No tickets found") ||
      searchHtml.includes("No records found") ||
      searchHtml.includes("No results") ||
      searchHtml.includes("No violations found")
    ) {
      console.log("No tickets found in response");
      return tickets;
    }

    // Look for the specific Shavano Park ticket data structure
    // Based on your example: "215064 - 1" citation format
    const citationPattern = /(\d{6})\s*-\s*(\d+)/g;
    const citationMatches = [...searchHtml.matchAll(citationPattern)];

    console.log(`Found ${citationMatches.length} citation matches`);

    for (const match of citationMatches) {
      const citationNo = `${match[1]}-${match[2]}`;
      console.log(`Processing citation: ${citationNo}`);

      // Look for the ticket data around this citation
      const citationIndex = match.index || 0;
      const contextStart = Math.max(0, citationIndex - 2000);
      const contextEnd = Math.min(searchHtml.length, citationIndex + 2000);
      const context = searchHtml.substring(contextStart, contextEnd);

      // Extract violation description - look for patterns like "SPEEDING10% OVER 57 MPH in a 45 MPH zone"
      const violationMatch = context.match(
        /SPEEDING[^<]*|VIOLATION[^<]*|PARKING[^<]*|RED LIGHT[^<]*/i
      );
      const violation = violationMatch
        ? violationMatch[0].trim()
        : "Unknown Violation";

      // Extract amounts - look for patterns like "$229.00", "$14.95", "$243.95"
      const amountMatches = context.match(/\$(\d+\.\d{2})/g);
      let fineAmount = 0;
      let processingFee = 0;
      let totalAmount = 0;

      if (amountMatches) {
        const amounts = amountMatches.map((m) =>
          parseFloat(m.replace("$", ""))
        );
        console.log(`Found amounts: ${amounts.join(", ")}`);

        // The total amount is usually the highest value
        totalAmount = Math.max(...amounts);

        // Fine amount is usually the second highest or a specific pattern
        if (amounts.length >= 2) {
          const sortedAmounts = amounts.sort((a, b) => b - a);
          fineAmount = sortedAmounts[1] || sortedAmounts[0];
          processingFee = totalAmount - fineAmount;
        } else {
          fineAmount = totalAmount;
        }
      }

      // Extract date - look for "October 03, 2024" format
      const dateMatch = context.match(
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i
      );
      let dueDate = "";
      if (dateMatch) {
        const dateStr = dateMatch[0];
        // Convert to YYYY-MM-DD format
        const date = new Date(dateStr);
        dueDate = date.toISOString().split("T")[0];
      } else {
        // Fallback to 30 days from now
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        dueDate = futureDate.toISOString().split("T")[0];
      }

      // Extract name - look for "DE JA QUEZ ZIMMERMAN" pattern
      const nameMatch = context.match(/([A-Z\s]{10,50})/);
      const name = nameMatch ? nameMatch[1].trim() : "";

      console.log(`Extracted ticket data:`, {
        citationNo,
        violation,
        fineAmount,
        processingFee,
        totalAmount,
        dueDate,
        name,
      });

      tickets.push({
        citationNo: citationNo,
        violation: violation,
        fineAmount: totalAmount, // Use total amount as the main amount
        dueDate: dueDate,
        courtName: "Shavano Park Municipal Court",
        source: "shavano",
      });
    }

    // If no citations found with the specific pattern, try alternative parsing
    if (tickets.length === 0) {
      console.log(
        "No citations found with specific pattern, trying alternative parsing"
      );

      // Look for any table structure
      const tableRows = searchHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      console.log(`Found ${tableRows.length} table rows`);

      for (const row of tableRows) {
        // Look for citation number patterns
        const citationPatterns = [
          /(\d{6})\s*-\s*(\d+)/,
          /citation[^>]*>([^<]+)</i,
          /ticket[^>]*>([^<]+)</i,
        ];

        let citationNo = "";
        for (const pattern of citationPatterns) {
          const match = row.match(pattern);
          if (match && match[1] && match[2]) {
            citationNo = `${match[1]}-${match[2]}`;
            break;
          } else if (match && match[1]) {
            citationNo = match[1].trim();
            break;
          }
        }

        if (citationNo) {
          // Extract other ticket information
          const violationMatch =
            row.match(/SPEEDING[^<]*|VIOLATION[^<]*|PARKING[^<]*/i) ||
            row.match(/violation[^>]*>([^<]+)</i) ||
            row.match(/description[^>]*>([^<]+)</i);

          const amountMatches = row.match(/\$(\d+\.\d{2})/g);
          let totalAmount = 0;
          if (amountMatches) {
            const amounts = amountMatches.map((m) =>
              parseFloat(m.replace("$", ""))
            );
            totalAmount = Math.max(...amounts);
          }

          const dateMatch = row.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
          const dueDate = dateMatch
            ? formatDate(dateMatch[1])
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

          tickets.push({
            citationNo: citationNo,
            violation: violationMatch
              ? violationMatch[0].trim()
              : "Unknown Violation",
            fineAmount: totalAmount,
            dueDate: dueDate,
            courtName: "Shavano Park Municipal Court",
            source: "shavano",
          });

          console.log(
            `Found ticket: ${citationNo} - ${
              violationMatch ? violationMatch[0].trim() : "Unknown"
            } - $${totalAmount}`
          );
        }
      }
    }

    console.log(`Returning ${tickets.length} tickets`);
    return tickets;
  } catch (error) {
    console.error("Shavano Park scraping error:", error);
    // Return empty array instead of mock data
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
