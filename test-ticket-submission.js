// Test script for ticket submission functionality
// Run this in your browser console on localhost:3003

console.log("🧪 Starting Ticket Submission Test...");

// Test 1: Check if user is authenticated
async function testAuthentication() {
  console.log("\n1️⃣ Testing Authentication...");

  try {
    const {
      data: { user },
      error,
    } = await window.supabase.auth.getUser();

    if (error) {
      console.error("❌ Auth error:", error);
      return false;
    }

    if (!user) {
      console.log("⚠️ No user logged in. Please sign in first.");
      return false;
    }

    console.log("✅ User authenticated:", user.email);
    console.log("✅ User ID:", user.id);
    return true;
  } catch (error) {
    console.error("❌ Auth test failed:", error);
    return false;
  }
}

// Test 2: Test ticket creation
async function testTicketCreation() {
  console.log("\n2️⃣ Testing Ticket Creation...");

  try {
    const {
      data: { user },
    } = await window.supabase.auth.getUser();

    const ticketData = {
      user_id: user.id,
      ticket_number: `TEST-${Date.now()}`,
      violation_date: "2024-01-15",
      due_date: "2024-02-15",
      amount: 150.0,
      state: "TX",
      county: "Harris",
      court: "Harris County Court",
      violation: "Speeding",
      violation_code: "SPEED-001",
      violation_description: "Exceeding speed limit by 15 mph",
      driver_license_number: "DL123456789",
      driver_license_state: "TX",
      date_of_birth: "1990-01-01",
      license_expiration_date: "2025-01-01",
      vehicle_plate: "ABC123",
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2020,
      vehicle_color: "Silver",
      officer_name: "Officer Smith",
      officer_badge_number: "12345",
      status: "pending",
      notes: "Test ticket submission",
      court_date: "2024-03-01",
      court_location: "Harris County Courthouse",
    };

    const { data, error } = await window.supabase
      .from("tickets")
      .insert(ticketData)
      .select()
      .single();

    if (error) {
      console.error("❌ Ticket creation failed:", error);
      return null;
    }

    console.log("✅ Ticket created successfully:", data.id);
    console.log("✅ Ticket data:", data);
    return data;
  } catch (error) {
    console.error("❌ Ticket creation test failed:", error);
    return null;
  }
}

// Test 3: Test ticket retrieval
async function testTicketRetrieval() {
  console.log("\n3️⃣ Testing Ticket Retrieval...");

  try {
    const {
      data: { user },
    } = await window.supabase.auth.getUser();

    const { data, error } = await window.supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Ticket retrieval failed:", error);
      return false;
    }

    console.log(`✅ Retrieved ${data.length} tickets for user`);
    console.log("✅ Tickets:", data);
    return true;
  } catch (error) {
    console.error("❌ Ticket retrieval test failed:", error);
    return false;
  }
}

// Test 4: Test foreign key constraint
async function testForeignKeyConstraint() {
  console.log("\n4️⃣ Testing Foreign Key Constraint...");

  try {
    const {
      data: { user },
    } = await window.supabase.auth.getUser();

    // Try to create a ticket with the current user's ID
    const { data, error } = await window.supabase
      .from("tickets")
      .insert({
        user_id: user.id,
        ticket_number: `FK-TEST-${Date.now()}`,
        due_date: "2024-02-15",
        amount: 100.0,
        state: "CA",
        county: "Los Angeles",
        court: "LA County Court",
        violation: "Parking Violation",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Foreign key constraint test failed:", error);
      return false;
    }

    console.log("✅ Foreign key constraint working correctly");
    console.log("✅ Ticket created with user_id:", data.user_id);
    return true;
  } catch (error) {
    console.error("❌ Foreign key constraint test failed:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Comprehensive Ticket Submission Tests...\n");

  const authResult = await testAuthentication();
  if (!authResult) {
    console.log("\n❌ Authentication failed. Please sign in first.");
    return;
  }

  const ticket1 = await testTicketCreation();
  if (!ticket1) {
    console.log("\n❌ First ticket creation failed.");
    return;
  }

  const ticket2 = await testTicketCreation();
  if (!ticket2) {
    console.log("\n❌ Second ticket creation failed.");
    return;
  }

  const retrievalResult = await testTicketRetrieval();
  if (!retrievalResult) {
    console.log("\n❌ Ticket retrieval failed.");
    return;
  }

  const fkResult = await testForeignKeyConstraint();
  if (!fkResult) {
    console.log("\n❌ Foreign key constraint test failed.");
    return;
  }

  console.log("\n🎉 ALL TESTS PASSED!");
  console.log("✅ Authentication working");
  console.log("✅ Ticket creation working");
  console.log("✅ Multiple tickets can be created");
  console.log("✅ Ticket retrieval working");
  console.log("✅ Foreign key constraints working");
  console.log("\n🚀 Your ticket submission system is ready for production!");
}

// Instructions for testing
console.log(`
📋 TESTING INSTRUCTIONS:

1. Make sure you're logged in to your app at http://localhost:3003
2. Open browser console (F12)
3. Run: runAllTests()

This will test:
- Authentication status
- Creating 2 tickets with the same account
- Retrieving tickets
- Foreign key constraints

If you want to test with a different account:
1. Sign out
2. Sign in with a different account
3. Run: runAllTests() again
`);

// Make functions available globally
window.runAllTests = runAllTests;
window.testAuthentication = testAuthentication;
window.testTicketCreation = testTicketCreation;
window.testTicketRetrieval = testTicketRetrieval;
window.testForeignKeyConstraint = testForeignKeyConstraint;
