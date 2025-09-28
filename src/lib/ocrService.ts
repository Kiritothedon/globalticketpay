import Tesseract from "tesseract.js";

export interface ParsedTicketData {
  court_name?: string;
  ticket_number?: string;
  violation?: string;
  due_date?: string;
  amount?: number;
  confidence: number;
  raw_text: string;
}

export class OCRService {
  static async parseTicketImage(imageFile: File): Promise<ParsedTicketData> {
    try {
      console.log("Starting OCR processing...");

      const {
        data: { text, confidence },
      } = await Tesseract.recognize(imageFile, "eng", {
        logger: (m) => console.log("OCR Progress:", m),
      });

      console.log("OCR completed. Confidence:", confidence);
      console.log("Raw text:", text);

      const parsedData = this.extractTicketData(text);

      return {
        ...parsedData,
        confidence: confidence || 0,
        raw_text: text,
      };
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw new Error(
        "Failed to process image. Please try again or enter details manually."
      );
    }
  }

  private static extractTicketData(text: string): Partial<ParsedTicketData> {
    const data: Partial<ParsedTicketData> = {};

    // Extract ticket number (look for patterns like "TICKET #12345" or "Citation No: 12345")
    const ticketNumberMatch = text.match(
      /(?:ticket|citation|violation)[\s#:]*(\d{4,})/i
    );
    if (ticketNumberMatch) {
      data.ticket_number = ticketNumberMatch[1];
    }

    // Extract court name (look for "Court of" or "County Court" patterns)
    const courtMatch = text.match(/([A-Z][^.]*Court[^.]*)/i);
    if (courtMatch) {
      data.court_name = courtMatch[1].trim();
    }

    // Extract violation (look for common violation keywords)
    const violationKeywords = [
      "speeding",
      "parking",
      "red light",
      "stop sign",
      "expired registration",
      "no insurance",
      "seat belt",
      "cell phone",
      "texting",
      "reckless driving",
    ];

    for (const keyword of violationKeywords) {
      const violationMatch = text.match(new RegExp(`(${keyword}[^.]*)`, "i"));
      if (violationMatch) {
        data.violation = violationMatch[1].trim();
        break;
      }
    }

    // Extract due date (look for date patterns)
    const datePatterns = [
      /due\s*date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /pay\s*by[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        data.due_date = this.formatDate(dateMatch[1]);
        break;
      }
    }

    // Extract amount (look for dollar amounts)
    const amountPatterns = [
      /\$(\d+\.?\d*)/g,
      /total[:\s]*\$?(\d+\.?\d*)/i,
      /amount[:\s]*\$?(\d+\.?\d*)/i,
      /fine[:\s]*\$?(\d+\.?\d*)/i,
    ];

    for (const pattern of amountPatterns) {
      const amountMatch = text.match(pattern);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        if (amount > 0 && amount < 10000) {
          // Reasonable ticket amount range
          data.amount = amount;
          break;
        }
      }
    }

    return data;
  }

  private static formatDate(dateStr: string): string {
    try {
      // Handle various date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr; // Return original if parsing fails
      }
      return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
    } catch {
      return dateStr;
    }
  }

  static validateParsedData(data: ParsedTicketData): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = [
      "ticket_number",
      "court_name",
      "violation",
      "due_date",
      "amount",
    ];
    const missingFields = requiredFields.filter(
      (field) => !data[field as keyof ParsedTicketData]
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}
