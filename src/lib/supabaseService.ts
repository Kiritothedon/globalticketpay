import { supabase, Ticket } from "./supabase";

export class SupabaseService {
  // Test connection to Supabase
  static async testConnection() {
    try {
      const { error } = await supabase.from("tickets").select("count").limit(1);

      if (error) {
        console.error("Supabase connection test failed:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }
  }

  // Ticket management methods
  static async createTicket(
    ticketData: Omit<Ticket, "id" | "created_at" | "updated_at">
  ) {
    try {
      // Get the current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("User must be authenticated to create tickets");
      }

      // Ensure the ticket has the correct user_id
      const ticketWithUserId = {
        ...ticketData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("tickets")
        .insert(ticketWithUserId)
        .select()
        .single();

      if (error) {
        console.error("Error creating ticket:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  static async getUserTickets(userId: string): Promise<Ticket[]> {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  static async updateTicket(
    ticketId: string,
    updates: Partial<
      Omit<Ticket, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .update(updates)
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        console.error("Error updating ticket:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  static async deleteTicket(ticketId: string) {
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticketId);

      if (error) {
        console.error("Error deleting ticket:", error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  // Upload ticket image
  static async uploadTicketImage(file: File, ticketId: string, userId: string) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${ticketId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("ticket-images")
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading image:", error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("ticket-images")
        .getPublicUrl(fileName);

      return {
        path: data.path,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  // Delete ticket image
  static async deleteTicketImage(imagePath: string) {
    try {
      const { error } = await supabase.storage
        .from("ticket-images")
        .remove([imagePath]);

      if (error) {
        console.error("Error deleting image:", error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }
}
