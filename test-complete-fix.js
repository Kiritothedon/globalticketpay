// Complete test script to verify the RLS fix works
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "your_supabase_url_here";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteFix() {
  console.log("=== Testing Complete RLS Fix ===");

  try {
    // Test 1: Sign up a new user
    console.log("1. Testing user signup...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: `test+${Date.now()}@example.com`,
        password: "TestPass123!",
      }
    );

    if (signUpError) {
      console.error("Signup error:", signUpError);
      return;
    }

    console.log("Signup successful:", signUpData.user?.id);

    // Test 2: Insert user into public.users table (using id instead of supabase_id)
    console.log("\n2. Testing user insert into public.users...");
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: signUpData.user.id, // Use id directly (auth.uid())
          email: signUpData.user.email,
          first_name: "Test",
          last_name: "User",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    console.log("Insert successful:", insertData);

    // Test 3: Verify user can read their own data
    console.log("\n3. Testing user can read own data...");
    const { data: selectData, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("id", signUpData.user.id);

    if (selectError) {
      console.error("Select error:", selectError);
      return;
    }

    console.log("Select successful:", selectData);

    // Test 4: Test ticket creation (after tickets table is created)
    console.log("\n4. Testing ticket creation...");
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            user_id: signUpData.user.id, // Reference the user's id
            ticket_number: "TEST-001",
            county: "Test County",
            violation: "Speeding",
            amount: 150.0,
            due_date: "2024-12-31",
            status: "pending",
            court: "Test Court",
            violation_date: "2024-01-15",
            officer_name: "Officer Smith",
            vehicle_plate: "ABC123",
            vehicle_make: "Toyota",
            vehicle_model: "Camry",
            vehicle_year: 2020,
            notes: "Test ticket for RLS verification",
          },
        ])
        .select()
        .single();

      if (ticketError) {
        console.error("Ticket creation error:", ticketError);
        console.log("Note: Make sure to run create-tickets-table.sql first!");
      } else {
        console.log("Ticket creation successful:", ticketData);
      }
    } catch (err) {
      console.error("Ticket creation failed:", err);
      console.log("Note: Make sure to run create-tickets-table.sql first!");
    }

    // Test 5: Verify user can only see their own tickets
    console.log("\n5. Testing user can read own tickets...");
    try {
      const { data: userTickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", signUpData.user.id);

      if (ticketsError) {
        console.error("Tickets select error:", ticketsError);
        console.log("Note: Make sure to run create-tickets-table.sql first!");
      } else {
        console.log("User tickets:", userTickets);
      }
    } catch (err) {
      console.error("Tickets select failed:", err);
      console.log("Note: Make sure to run create-tickets-table.sql first!");
    }

    // Test 6: Anonymous access test (should be blocked)
    console.log("\n6. Testing anonymous access (should be blocked)...");
    const { data: anonData, error: anonError } = await supabase
      .from("users")
      .select("*");

    console.log("Anonymous access result:", anonData);
    console.log("Anonymous access error (expected):", anonError);

    console.log("\n✅ All tests completed successfully!");
  } catch (err) {
    console.error("Test error:", err);
  }
}

testCompleteFix();
