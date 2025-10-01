export interface ShavanoTicketData {
  citation_no: string;
  violation: string;
  fine_amount: number;
  due_date: string;
  court_name: string;
  court_address: string;
  confidence: number;
  source: "shavano";
  raw_data?: any;
}

export interface ShavanoSearchParams {
  driverLicenseNumber: string;
  state: string;
}

export class ShavanoScraper {
  static async searchTickets(
    params: ShavanoSearchParams
  ): Promise<ShavanoTicketData[]> {
    try {
      console.log(
        `Searching Shavano Park for DL: ${params.driverLicenseNumber}, State: ${params.state}`
      );

      // Try Supabase Edge Function first (works in production)
      const edgeFunctionTickets = await this.searchViaEdgeFunction(params);
      if (edgeFunctionTickets.length > 0) {
        return edgeFunctionTickets;
      }

      // Fallback to direct scraping (development only)
      if (process.env.NODE_ENV === "development") {
        return await this.searchDirectly(params);
      }

      // If no tickets found, return empty array
      return [];
    } catch (error) {
      console.error("Shavano scraping failed:", error);
      throw new Error(
        "Failed to search Shavano Park tickets. Please try again or add tickets manually."
      );
    }
  }

  private static async searchViaEdgeFunction(
    params: ShavanoSearchParams
  ): Promise<ShavanoTicketData[]> {
    try {
      const { supabase } = await import("./supabase");

      const { data, error } = await supabase.functions.invoke(
        "scrape-tickets",
        {
          body: {
            source: "shavano",
            driverLicenseNumber: params.driverLicenseNumber,
            state: params.state,
            dob: "", // Not required for Shavano
          },
        }
      );

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "We couldn't retrieve your ticket automatically. Please add it manually.");
      }

      if (data?.tickets?.length > 0) {
        console.log(
          `✅ Found ${data.tickets.length} tickets via Edge Function`
        );
        return this.convertEdgeFunctionTickets(data.tickets, params);
      }

      // If no tickets found, throw a specific error for better UX
      throw new Error("No tickets found in Shavano Park. This could be because:\n• The ticket data is not available in their system\n• The website structure has changed\n• There are no tickets for this license number\n\nYou can still add tickets manually using the form below.");
    } catch (error) {
      console.error("Edge function search failed:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("We couldn't retrieve your ticket automatically. Please add it manually.");
    }
  }

  private static convertEdgeFunctionTickets(
    tickets: Array<{
      citationNo: string;
      violation: string;
      fineAmount: number;
      dueDate: string;
      courtName: string;
      source: string;
    }>,
    params: ShavanoSearchParams
  ): ShavanoTicketData[] {
    return tickets.map((ticket) => ({
      citation_no: ticket.citationNo,
      violation: ticket.violation,
      fine_amount: ticket.fineAmount,
      due_date: ticket.dueDate,
      court_name: ticket.courtName,
      court_address: "Shavano Park, TX",
      confidence: 0.95, // High confidence for real scraping
      source: "shavano" as const,
      raw_data: {
        dlNumber: params.driverLicenseNumber,
        state: params.state,
        scrapedAt: new Date().toISOString(),
        method: "edge-function",
      },
    }));
  }

  private static async searchDirectly(
    params: ShavanoSearchParams
  ): Promise<ShavanoTicketData[]> {
    // This would be used in development with a local scraper service
    // For now, we'll return mock data to demonstrate the structure
    console.log("Using direct scraping (development mode)");

    // Simulate finding tickets 30% of the time
    if (Math.random() > 0.7) {
      const ticketTypes = [
        { violation: "Speeding", amount: 150 },
        { violation: "Red Light Violation", amount: 200 },
        { violation: "Stop Sign Violation", amount: 125 },
        { violation: "Parking Violation", amount: 75 },
      ];

      const ticketType =
        ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15);

      return [
        {
          citation_no: `SP-${Math.floor(Math.random() * 100000)}`,
          violation: ticketType.violation,
          fine_amount: ticketType.amount,
          due_date: dueDate.toISOString().split("T")[0],
          court_name: "Shavano Park Municipal Court",
          court_address: "Shavano Park, TX",
          confidence: 0.9,
          source: "shavano" as const,
          raw_data: {
            dlNumber: params.driverLicenseNumber,
            state: params.state,
            scrapedAt: new Date().toISOString(),
            method: "direct-scraping",
          },
        },
      ];
    }

    return [];
  }

  static validateSearchParams(params: ShavanoSearchParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!params.driverLicenseNumber?.trim()) {
      errors.push("Driver license number is required");
    } else if (!/^[A-Z0-9]{6,12}$/i.test(params.driverLicenseNumber)) {
      errors.push("Driver license number must be 6-12 alphanumeric characters");
    }

    if (!params.state?.trim()) {
      errors.push("State is required");
    } else if (!/^[A-Z]{2}$/.test(params.state)) {
      errors.push("State must be a 2-letter code (e.g., TX)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
