import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Scrape tickets endpoint
app.post("/scrape", async (req, res) => {
  try {
    const { source, driverLicenseNumber, state, dob } = req.body;

    if (!source || !driverLicenseNumber || !state) {
      return res.status(400).json({
        error:
          "Missing required parameters: source, driverLicenseNumber, state",
      });
    }

    if (source === "cibolo" && !dob) {
      return res.status(400).json({
        error: "DOB is required for Cibolo scraping",
      });
    }

    let tickets = [];

    switch (source) {
      case "shavano":
        tickets = await scrapeShavanoPark(driverLicenseNumber, state);
        break;
      case "cibolo":
        tickets = await scrapeCiboloCounty(driverLicenseNumber, state, dob);
        break;
      default:
        return res.status(400).json({ error: "Invalid source" });
    }

    res.json({ tickets, count: tickets.length });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({
      error: "Scraping failed",
      details: error.message,
    });
  }
});

async function scrapeShavanoPark(dlNumber, state) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const url =
      "https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520";
    await page.goto(url, { waitUntil: "networkidle2" });

    // Fill in the form
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtDLNumber"]',
      dlNumber
    );
    await page.select(
      'select[name="ctl00$ContentPlaceHolder1$ddlState"]',
      state
    );

    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('input[type="submit"][value="Search"]'),
    ]);

    // Wait for results to load
    await page.waitForTimeout(2000);

    // Extract ticket data
    const tickets = await page.evaluate(() => {
      const results = [];

      // Look for ticket rows in various possible table structures
      const ticketRows = document.querySelectorAll(
        'tr[class*="ticket"], .ticket-row, .result-row, tr:has(td:contains("Citation"))'
      );

      ticketRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 3) {
          const citationNo = cells[0]?.textContent?.trim() || "";
          const violation = cells[1]?.textContent?.trim() || "Unknown";
          const amountText = cells[2]?.textContent?.trim() || "0";
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, "")) || 0;

          if (citationNo && citationNo !== "Citation No") {
            results.push({
              citationNo,
              violation,
              fineAmount: amount,
              dueDate: "", // Will be filled from other cells if available
              courtName: "Shavano Park Municipal Court",
              source: "shavano",
            });
          }
        }
      });

      // Also look for tickets in other possible formats
      const ticketCards = document.querySelectorAll(
        '.ticket-card, .violation-item, [class*="ticket"]'
      );
      ticketCards.forEach((card) => {
        const citationMatch = card.textContent?.match(
          /citation[:\s]*([A-Z0-9-]+)/i
        );
        const amountMatch = card.textContent?.match(/\$?(\d+\.?\d*)/);

        if (citationMatch) {
          results.push({
            citationNo: citationMatch[1],
            violation: "Unknown",
            fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
            dueDate: "",
            courtName: "Shavano Park Municipal Court",
            source: "shavano",
          });
        }
      });

      return results;
    });

    return tickets;
  } catch (error) {
    console.error("Shavano Park scraping error:", error);
    return [];
  } finally {
    await browser.close();
  }
}

async function scrapeCiboloCounty(dlNumber, state, dob) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const url =
      "https://cibolotx.municipalonlinepayments.com/cibolotx/court/search";
    await page.goto(url, { waitUntil: "networkidle2" });

    // Click on Driver's License option
    try {
      await page.click("#option-DriversLicense > div");
      await page.waitForTimeout(1000);
    } catch {
      // Try alternative selector
      await page.evaluate(() => {
        const element = document.querySelector(
          '[data-search-type="DriversLicense"], .search-type-drivers-license'
        );
        if (element) element.click();
      });
    }

    // Fill in the form
    await page.type('input[name="DriversLicense"]', dlNumber);
    await page.select('select[name="State"]', state);
    await page.type('input[name="DOB"]', dob);

    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click('button[type="submit"], input[type="submit"]'),
    ]);

    // Wait for results
    await page.waitForTimeout(3000);

    // Extract ticket data
    const tickets = await page.evaluate(() => {
      const results = [];

      // Look for ticket checkboxes and their associated data
      const ticketCheckboxes = document.querySelectorAll(
        'input[type="checkbox"][name*="ticket"], input[type="checkbox"][name*="citation"]'
      );

      ticketCheckboxes.forEach((checkbox) => {
        const row = checkbox.closest("tr, .ticket-row, .violation-row");
        if (row) {
          const citationNo =
            row
              .querySelector(
                "[data-citation], .citation-number, .ticket-number"
              )
              ?.textContent?.trim() ||
            checkbox.getAttribute("value") ||
            checkbox.getAttribute("data-citation") ||
            "";

          const violation =
            row
              .querySelector("[data-violation], .violation, .offense")
              ?.textContent?.trim() || "Unknown";

          const amountText =
            row
              .querySelector("[data-amount], .amount, .fine")
              ?.textContent?.trim() || "0";
          const amount = parseFloat(amountText.replace(/[^0-9.]/g, "")) || 0;

          const dueDateText =
            row
              .querySelector("[data-due-date], .due-date, .payment-due")
              ?.textContent?.trim() || "";
          const dueDate = dueDateText ? formatDate(dueDateText) : "";

          if (citationNo) {
            results.push({
              citationNo,
              violation,
              fineAmount: amount,
              dueDate,
              courtName: "Cibolo Municipal Court",
              source: "cibolo",
            });
          }
        }
      });

      // Also look for tickets in other formats
      const ticketElements = document.querySelectorAll(
        '.ticket-item, .violation-item, [class*="ticket"]'
      );
      ticketElements.forEach((element) => {
        const citationMatch = element.textContent?.match(
          /citation[:\s]*([A-Z0-9-]+)/i
        );
        const amountMatch = element.textContent?.match(/\$?(\d+\.?\d*)/);

        if (citationMatch) {
          results.push({
            citationNo: citationMatch[1],
            violation: "Unknown",
            fineAmount: amountMatch ? parseFloat(amountMatch[1]) : 0,
            dueDate: "",
            courtName: "Cibolo Municipal Court",
            source: "cibolo",
          });
        }
      });

      return results;
    });

    return tickets;
  } catch (error) {
    console.error("Cibolo County scraping error:", error);
    return [];
  } finally {
    await browser.close();
  }
}

function formatDate(dateStr) {
  try {
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

app.listen(PORT, () => {
  console.log(`Ticket scraper service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Scrape endpoint: http://localhost:${PORT}/scrape`);
});
