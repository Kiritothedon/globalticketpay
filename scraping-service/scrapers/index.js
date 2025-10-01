// Scraper registry for easy county additions
import { scrapeShavano } from "./shavano.js";

const scrapers = {
  shavano: scrapeShavano,
  // Add more counties here as they're implemented
  // cibolo: scrapeCibolo,
  // bexar: scrapeBexar,
};

export async function scrapeTickets(county, dlNumber, state, dob = "") {
  const scraper = scrapers[county.toLowerCase()];

  if (!scraper) {
    throw new Error(`Unsupported county: ${county}`);
  }

  // Validate required parameters
  if (!dlNumber || !state) {
    throw new Error("Driver license number and state are required");
  }

  try {
    const tickets = await scraper(dlNumber, state, dob);
    return {
      success: true,
      tickets,
      count: tickets.length,
      county: county.toLowerCase(),
      message:
        tickets.length > 0
          ? "Tickets found successfully"
          : "No tickets found. Try manual entry.",
    };
  } catch (error) {
    console.error(`[ScraperRegistry] Error scraping ${county}:`, error);
    return {
      success: false,
      tickets: [],
      count: 0,
      county: county.toLowerCase(),
      message: `Scraping failed: ${error.message}. Please try manual entry.`,
    };
  }
}

export { scrapers };
