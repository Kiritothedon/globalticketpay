import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SupabaseService } from "@/lib/supabaseService";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle Google OAuth users
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;

        // Check if this is a Google OAuth user
        if (user.app_metadata?.provider === "google") {
          try {
            // Extract name from user metadata
            const fullName = user.user_metadata?.full_name || "";
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || user.user_metadata?.first_name;
            const lastName =
              nameParts.slice(1).join(" ") || user.user_metadata?.last_name;

            // Create or update user in our database
            await SupabaseService.createOrUpdateGoogleUser(
              user.id,
              user.email || "",
              firstName,
              lastName
            );
          } catch (error) {
            console.error("Error handling Google OAuth user:", error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
}
