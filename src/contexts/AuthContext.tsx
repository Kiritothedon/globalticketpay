import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle user profile creation for new signups only
      if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;

        // Only create user profile for new signups (not existing signins)
        if (event === "SIGNED_IN" && !user.app_metadata?.provider) {
          try {
            // Check if user already exists in our database
            const { data: existingUser, error: checkError } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .single();

            // If user doesn't exist, create them
            if (!existingUser && !checkError) {
              const { error: userError } = await supabase.from("users").insert({
                id: user.id,
                email: user.email || "",
                first_name: user.user_metadata?.first_name || "",
                last_name: user.user_metadata?.last_name || "",
              });

              if (userError) {
                console.error("Error creating user profile:", userError);
              } else {
              }
            } else if (existingUser) {
            }
          } catch (error) {
            console.error("Error handling new user:", error);
          }
        }

        // Handle Google OAuth users
        if (user.app_metadata?.provider === "google") {
          try {
            // Extract name from user metadata
            const fullName = user.user_metadata?.full_name || "";
            const nameParts = fullName.split(" ");
            const firstName = nameParts[0] || user.user_metadata?.first_name;
            const lastName =
              nameParts.slice(1).join(" ") || user.user_metadata?.last_name;

            // Create or update user in our database
            const { error: userError } = await supabase.from("users").upsert({
              id: user.id,
              email: user.email || "",
              first_name: firstName,
              last_name: lastName,
            });

            if (userError) {
              console.error(
                "Error creating/updating Google user profile:",
                userError
              );
            }
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

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
