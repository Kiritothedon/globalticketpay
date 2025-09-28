import { supabase, User, Ticket } from "./supabase";

export class SupabaseService {
  // Create user in Supabase after successful signup
  static async createUser(
    supabaseId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: supabaseId, // Use id instead of supabase_id
          email: email,
          first_name: firstName,
          last_name: lastName,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating user:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  // Get user by Supabase ID
  static async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseId) // Use id instead of supabase_id
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        console.error("Error fetching user:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  // Create or update user for Google OAuth
  static async createOrUpdateGoogleUser(
    supabaseId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ) {
    try {
      // First check if user exists
      const existingUser = await this.getUserBySupabaseId(supabaseId);

      if (existingUser) {
        // Update existing user if needed
        const { data, error } = await supabase
          .from("users")
          .update({
            email: email,
            first_name: firstName || existingUser.first_name,
            last_name: lastName || existingUser.last_name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supabaseId) // Use id instead of supabase_id
          .select()
          .single();

        if (error) {
          console.error("Error updating user:", error);
          throw error;
        }

        return data;
      } else {
        // Create new user
        return await this.createUser(supabaseId, email, firstName, lastName);
      }
    } catch (error) {
      console.error("Supabase service error:", error);
      throw error;
    }
  }

  // Test connection to Supabase
  static async testConnection() {
    try {
      const { error } = await supabase.from("users").select("count").limit(1);

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
      // First, ensure the user exists in the public.users table
      await this.ensureUserExists(ticketData.user_id);

      const { data, error } = await supabase
        .from("tickets")
        .insert(ticketData)
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

  // Ensure user exists in public.users table
  static async ensureUserExists(userId: string) {
    try {
      // Check if user exists in public.users table
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();

      // If user doesn't exist, create them
      if (!existingUser && checkError?.code === "PGRST116") {
        // Get user info from auth.users
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error("Unable to get user information");
        }

        // Create user in public.users table
        const { error: userError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email || "",
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
        });

        if (userError) {
          console.error("Error creating user profile:", userError);
          throw userError;
        }
      } else if (checkError && checkError.code !== "PGRST116") {
        // Some other error occurred
        throw checkError;
      }
    } catch (error) {
      console.error("Error ensuring user exists:", error);
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

  static async updateTicket(ticketId: string, updates: Partial<Ticket>) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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

      return true;
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
      console.error("Error in uploadTicketImage:", error);
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

      return true;
    } catch (error) {
      console.error("Error in deleteTicketImage:", error);
      throw error;
    }
  }
}
