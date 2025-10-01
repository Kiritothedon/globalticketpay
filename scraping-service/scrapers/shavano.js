import { chromium } from "playwright";

export async function scrapeShavano(dlNumber, state) {
  console.log(
    `[ShavanoScraper] Starting search for DL: ${dlNumber}, State: ${state}`
  );

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    console.log("[ShavanoScraper] Navigating to website...");
    await page.goto(
      "https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520&AspxAutoDetectCookieSupport=1",
      {
        waitUntil: "networkidle",
        timeout: 30000,
      }
    );

    console.log("[ShavanoScraper] Waiting for form elements...");

    // Wait for the driver license input field
    await page.waitForSelector(
      'input[name="ctl00$MainContentPHolder$txtBSDLNumber"]',
      {
        timeout: 15000,
      }
    );

    console.log("[ShavanoScraper] Filling driver license number...");
    // Clear and fill the driver license number
    await page.fill(
      'input[name="ctl00$MainContentPHolder$txtBSDLNumber"]',
      dlNumber
    );

    console.log("[ShavanoScraper] Selecting state from dropdown...");
    // Select the state from dropdown
    await page.selectOption(
      'select[name="ctl00$MainContentPHolder$ddlDriversLicenseState"]',
      state
    );

    console.log("[ShavanoScraper] Clicking search button...");
    // Click the search button
    await page.click('button[id="ctl00_MainContentPHolder_btnSearchDL"]');

    console.log("[ShavanoScraper] Waiting for results to load...");
    // Wait for results to load - look for either results or "no results" message
    try {
      await page.waitForSelector(
        'table, .no-results, .error, [id*="results"], [class*="result"]',
        {
          timeout: 10000,
        }
      );
    } catch (e) {
      console.log(
        "[ShavanoScraper] No specific results selector found, waiting for page to stabilize..."
      );
      await page.waitForTimeout(3000);
    }

    console.log("[ShavanoScraper] Extracting ticket data...");
    // Extract ticket data from the results page
    const tickets = await page.evaluate(() => {
      const results = [];

      // Get all text content from the page
      const pageText = document.body.innerText;
      console.log("Page text length:", pageText.length);

      // Look for citation number patterns (e.g., "215064 - 1", "215064-1")
      const citationPatterns = [
        /(\d{6})\s*-\s*(\d+)/g,
        /citation[^>]*>([^<]+)</gi,
        /ticket[^>]*>([^<]+)</gi,
      ];

      let citations = [];
      for (const pattern of citationPatterns) {
        const matches = [...pageText.matchAll(pattern)];
        citations = matches
          .map((match) => {
            if (match[1] && match[2]) {
              return `${match[1]}-${match[2]}`;
            }
            return match[1] || match[0];
          })
          .filter(Boolean);
        if (citations.length > 0) break;
      }

      console.log("Found citations:", citations);

      // If we found citations, extract data for each
      if (citations.length > 0) {
        for (const citation of citations) {
          // Look for violation description near the citation
          const violationPatterns = [
            /SPEEDING[^<>\n]*/gi,
            /VIOLATION[^<>\n]*/gi,
            /PARKING[^<>\n]*/gi,
            /RED LIGHT[^<>\n]*/gi,
            /STOP SIGN[^<>\n]*/gi,
          ];

          let violation = "Unknown Violation";
          for (const pattern of violationPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              violation = match[0].trim();
              break;
            }
          }

          // Look for amounts
          const amountPatterns = [/\$(\d+\.\d{2})/g, /(\d+\.\d{2})/g];

          let totalAmount = 0;
          for (const pattern of amountPatterns) {
            const matches = [...pageText.matchAll(pattern)];
            if (matches.length > 0) {
              const amounts = matches.map((m) => parseFloat(m[1] || m[0]));
              totalAmount = Math.max(...amounts);
              break;
            }
          }

          // Look for date
          const datePatterns = [
            /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/gi,
            /(\d{1,2}\/\d{1,2}\/\d{4})/g,
          ];

          let dueDate = "";
          for (const pattern of datePatterns) {
            const match = pageText.match(pattern);
            if (match) {
              const date = new Date(match[0]);
              if (!isNaN(date.getTime())) {
                dueDate = date.toISOString().split("T")[0];
                break;
              }
            }
          }

          if (!dueDate) {
            // Fallback to 30 days from now
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            dueDate = futureDate.toISOString().split("T")[0];
          }

          results.push({
            citationNo: citation,
            violation: violation,
            fineAmount: totalAmount,
            dueDate: dueDate,
            courtName: "Shavano Park Municipal Court",
            source: "shavano",
          });
        }
      }

      return results;
    });

    console.log(`[ShavanoScraper] Found ${tickets.length} tickets`);
    return tickets;
  } catch (error) {
    console.error("[ShavanoScraper] Error:", error);
    throw new Error(`Shavano Park scraping failed: ${error.message}`);
  } finally {
    await browser.close();
  }
}
