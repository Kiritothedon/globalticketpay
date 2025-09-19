import { supabase, User } from "./supabase";

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
          supabase_id: supabaseId,
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
        .eq("supabase_id", supabaseId)
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
          .eq("supabase_id", supabaseId)
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

      console.log("Supabase connection successful");
      return true;
    } catch (error) {
      console.error("Supabase connection test error:", error);
      return false;
    }
  }
}
