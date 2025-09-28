import { EnhancedOCRService, ParsedTicketData } from "./enhancedOcrService";
import { CountyScrapers, ScrapedTicketData } from "./countyScrapers";

export interface UnifiedTicketData {
  citation_no: string;
  name?: string;
  address?: string;
  dl_no?: string;
  dob?: string;
  fine_amount: number;
  due_date?: string;
  court_date?: string;
  violation?: string;
  court_name?: string;
  court_address?: string;
  confidence: number;
  source: "ocr" | "shavano" | "cibolo";
  raw_data?: any;
}

export interface TicketIntakeOptions {
  imageFile?: File;
  scrapeSources?: Array<"shavano" | "cibolo">;
  scrapeParams?: {
    dlNumber: string;
    state: string;
    dob: string;
  };
}

export class TicketIntakeService {
  static async processTicketIntake(
    options: TicketIntakeOptions
  ): Promise<UnifiedTicketData[]> {
    const results: UnifiedTicketData[] = [];

    try {
      // Process OCR if image provided
      if (options.imageFile) {
        const ocrResult = await EnhancedOCRService.parseTicketImage(
          options.imageFile
        );
        const unifiedOcrData = this.convertOcrToUnified(ocrResult);
        results.push(unifiedOcrData);
      }

      // Process scraping if sources provided
      if (options.scrapeSources && options.scrapeParams) {
        for (const source of options.scrapeSources) {
          try {
            const scrapedTickets = await CountyScrapers.fetchTicketsFromSource(
              source,
              options.scrapeParams
            );
            const unifiedScrapedData = scrapedTickets.map((ticket) =>
              this.convertScrapedToUnified(ticket)
            );
            results.push(...unifiedScrapedData);
          } catch (error) {
            console.error(`Failed to scrape ${source}:`, error);
            // Continue with other sources even if one fails
          }
        }
      }

      // Remove duplicates based on citation number
      const uniqueResults = this.removeDuplicates(results);

      return uniqueResults;
    } catch (error) {
      console.error("Ticket intake processing failed:", error);
      throw new Error("Failed to process ticket intake. Please try again.");
    }
  }

  private static convertOcrToUnified(
    ocrData: ParsedTicketData
  ): UnifiedTicketData {
    return {
      citation_no: ocrData.citation_no || "",
      name: ocrData.name,
      address: ocrData.address,
      dl_no: ocrData.dl_no,
      dob: ocrData.dob,
      fine_amount: ocrData.fine_amount || 0,
      due_date: ocrData.due_date,
      court_date: ocrData.court_date,
      violation: ocrData.violation,
      court_name: ocrData.court_name,
      court_address: ocrData.court_address,
      confidence: ocrData.confidence,
      source: "ocr",
      raw_data: {
        raw_text: ocrData.raw_text,
        processed_at: new Date().toISOString(),
      },
    };
  }

  private static convertScrapedToUnified(
    scrapedData: ScrapedTicketData
  ): UnifiedTicketData {
    return {
      citation_no: scrapedData.citation_no,
      name: scrapedData.name,
      address: scrapedData.address,
      dl_no: scrapedData.dl_no,
      dob: scrapedData.dob,
      fine_amount: scrapedData.fine_amount,
      due_date: scrapedData.due_date,
      court_date: scrapedData.court_date,
      violation: scrapedData.violation,
      court_name: scrapedData.court_name,
      court_address: scrapedData.court_address,
      confidence: scrapedData.confidence,
      source: scrapedData.source,
      raw_data: scrapedData.raw_data,
    };
  }

  private static removeDuplicates(
    tickets: UnifiedTicketData[]
  ): UnifiedTicketData[] {
    const seen = new Set<string>();
    return tickets.filter((ticket) => {
      if (seen.has(ticket.citation_no)) {
        return false;
      }
      seen.add(ticket.citation_no);
      return true;
    });
  }

  static validateIntakeOptions(options: TicketIntakeOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      !options.imageFile &&
      (!options.scrapeSources || options.scrapeSources.length === 0)
    ) {
      errors.push("Either an image file or scrape sources must be provided");
    }

    if (options.scrapeSources && options.scrapeSources.length > 0) {
      if (!options.scrapeParams) {
        errors.push("Scrape parameters are required when using scrape sources");
      } else {
        if (!options.scrapeParams.dlNumber) {
          errors.push("Driver license number is required for scraping");
        }
        if (!options.scrapeParams.state) {
          errors.push("State is required for scraping");
        }
        if (
          options.scrapeSources.includes("cibolo") &&
          (!options.scrapeParams.dob || options.scrapeParams.dob.trim() === "")
        ) {
          errors.push("Date of birth is required for Cibolo scraping");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getAvailableSources() {
    return CountyScrapers.getAvailableSources();
  }

  static formatTicketForDisplay(ticket: UnifiedTicketData): {
    id: string;
    displayName: string;
    amount: string;
    dueDate: string;
    source: string;
    confidence: string;
  } {
    return {
      id: ticket.citation_no,
      displayName: `${ticket.citation_no} - ${
        ticket.violation || "Unknown Violation"
      }`,
      amount: `$${ticket.fine_amount.toFixed(2)}`,
      dueDate: ticket.due_date || "Not specified",
      source: this.getSourceDisplayName(ticket.source),
      confidence: `${Math.round(ticket.confidence * 100)}%`,
    };
  }

  private static getSourceDisplayName(source: string): string {
    switch (source) {
      case "ocr":
        return "Image Upload";
      case "shavano":
        return "Shavano Park";
      case "cibolo":
        return "Cibolo County";
      default:
        return "Unknown";
    }
  }
}
