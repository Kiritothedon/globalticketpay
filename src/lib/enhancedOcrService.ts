export interface ParsedTicketData {
  citation_no?: string;
  name?: string;
  address?: string;
  dl_no?: string;
  dob?: string;
  fine_amount?: number;
  due_date?: string;
  court_date?: string;
  violation?: string;
  court_name?: string;
  court_address?: string;
  confidence: number;
  raw_text: string;
  source: "ocr" | "scraped";
}

export class EnhancedOCRService {
  static async parseTicketImage(imageFile: File): Promise<ParsedTicketData> {
    try {
      console.log("Starting enhanced OCR processing...");

      // Import Tesseract dynamically to avoid SSR issues
      const Tesseract = (await import("tesseract.js")).default;

      const {
        data: { text, confidence },
      } = await Tesseract.recognize(imageFile, "eng", {
        logger: (m) => console.log("OCR Progress:", m),
      });

      console.log("OCR completed. Confidence:", confidence);
      console.log("Raw text:", text);

      const parsedData = this.extractTicketDataWithRegex(text);

      return {
        ...parsedData,
        confidence: confidence || 0,
        raw_text: text,
        source: "ocr",
      };
    } catch (error) {
      console.error("Enhanced OCR processing failed:", error);
      throw new Error(
        "Failed to process image. Please try again or enter details manually."
      );
    }
  }

  private static extractTicketDataWithRegex(
    text: string
  ): Partial<ParsedTicketData> {
    const data: Partial<ParsedTicketData> = {};

    // Normalize text for better matching
    const normalizedText = text.replace(/\s+/g, " ").trim();

    // Citation Number patterns
    const citationPatterns = [
      /citation\s*no[:\s]+([A-Za-z0-9-]+)/i,
      /ticket\s*no[:\s]+([A-Za-z0-9-]+)/i,
      /violation\s*no[:\s]+([A-Za-z0-9-]+)/i,
      /(?:citation|ticket|violation)[\s#:]*(\d{4,})/i,
    ];

    for (const pattern of citationPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.citation_no = match[1].trim();
        break;
      }
    }

    // Name patterns
    const namePatterns = [
      /name[:\s]+([A-Za-z\s]+?)(?:\n|address|dob|dl|fine|due|court)/i,
      /defendant[:\s]+([A-Za-z\s]+?)(?:\n|address|dob|dl|fine|due|court)/i,
      /driver[:\s]+([A-Za-z\s]+?)(?:\n|address|dob|dl|fine|due|court)/i,
    ];

    for (const pattern of namePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }

    // Address patterns
    const addressPatterns = [
      /address[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|dob|dl|fine|due|court)/i,
      /residence[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|dob|dl|fine|due|court)/i,
    ];

    for (const pattern of addressPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.address = match[1].trim();
        break;
      }
    }

    // Driver License patterns
    const dlPatterns = [
      /dl\s*no[:\s]+([A-Za-z0-9]+)/i,
      /driver\s*license[:\s]+([A-Za-z0-9]+)/i,
      /license\s*no[:\s]+([A-Za-z0-9]+)/i,
      /dl[:\s]+([A-Za-z0-9]+)/i,
    ];

    for (const pattern of dlPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.dl_no = match[1].trim();
        break;
      }
    }

    // Date of Birth patterns
    const dobPatterns = [
      /dob[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
      /date\s*of\s*birth[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
      /birth\s*date[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
      /(\d{2}\/\d{2}\/\d{4})/g,
    ];

    for (const pattern of dobPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.dob = this.formatDate(match[1]);
        break;
      }
    }

    // Fine Amount patterns
    const finePatterns = [
      /fine\s*amount[:\s]*\$?([\d.]+)/i,
      /total\s*amount[:\s]*\$?([\d.]+)/i,
      /amount\s*due[:\s]*\$?([\d.]+)/i,
      /total[:\s]*\$?([\d.]+)/i,
      /\$(\d+\.?\d*)/g,
    ];

    for (const pattern of finePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) {
          data.fine_amount = amount;
          break;
        }
      }
    }

    // Due Date patterns
    const dueDatePatterns = [
      /due\s*date[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
      /pay\s*by[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
      /payment\s*due[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    ];

    for (const pattern of dueDatePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.due_date = this.formatDate(match[1]);
        break;
      }
    }

    // Court Date patterns
    const courtDatePatterns = [
      /court\s*date[:\s]+(.+?)(?:\n|fine|due|address)/i,
      /hearing\s*date[:\s]+(.+?)(?:\n|fine|due|address)/i,
      /appearance\s*date[:\s]+(.+?)(?:\n|fine|due|address)/i,
    ];

    for (const pattern of courtDatePatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.court_date = match[1].trim();
        break;
      }
    }

    // Violation patterns
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
      "failure to yield",
      "improper turn",
      "following too closely",
      "no seat belt",
    ];

    for (const keyword of violationKeywords) {
      const violationMatch = normalizedText.match(
        new RegExp(`(${keyword}[^.]*)`, "i")
      );
      if (violationMatch) {
        data.violation = violationMatch[1].trim();
        break;
      }
    }

    // Court Name patterns
    const courtPatterns = [
      /court[:\s]+([A-Za-z\s,.-]+?)(?:\n|address|fine|due)/i,
      /municipal\s*court[:\s]+([A-Za-z\s,.-]+?)(?:\n|address|fine|due)/i,
      /justice\s*court[:\s]+([A-Za-z\s,.-]+?)(?:\n|address|fine|due)/i,
    ];

    for (const pattern of courtPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.court_name = match[1].trim();
        break;
      }
    }

    // Court Address patterns
    const courtAddressPatterns = [
      /court\s*address[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|fine|due)/i,
      /location[:\s]+([A-Za-z0-9\s,.-]+?)(?:\n|fine|due)/i,
    ];

    for (const pattern of courtAddressPatterns) {
      const match = normalizedText.match(pattern);
      if (match) {
        data.court_address = match[1].trim();
        break;
      }
    }

    return data;
  }

  private static formatDate(dateStr: string): string {
    try {
      // Handle MM/DD/YYYY format
      if (dateStr.includes("/")) {
        const [month, day, year] = dateStr.split("/");
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  static validateParsedData(data: ParsedTicketData): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = ["citation_no", "fine_amount", "due_date"];
    const missingFields = requiredFields.filter(
      (field) => !data[field as keyof ParsedTicketData]
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}
