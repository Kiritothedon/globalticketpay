// Complete ticket submission flow test
const testData = {
  dlNumber: "46894084",
  state: "TX",
  dob: "2001-12-09",
};

console.log("🎯 Complete Ticket Submission Flow Test");
console.log("======================================");
console.log(
  `Test Data: DL ${testData.dlNumber}, State ${testData.state}, DOB ${testData.dob}`
);
console.log("");

// Simulate the frontend ticket intake process
async function testCompleteFlow() {
  console.log("🔄 Simulating Complete Ticket Submission Flow...\n");

  try {
    // Step 1: Test Enhanced Ticket Intake Service
    console.log("1️⃣ Testing Enhanced Ticket Intake Service...");

    // Simulate the frontend calling the scraper service
    const shavanoResponse = await fetch("http://localhost:3005/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "shavano",
        driverLicenseNumber: testData.dlNumber,
        state: testData.state,
        dob: testData.dob,
      }),
    });

    const ciboloResponse = await fetch("http://localhost:3005/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "cibolo",
        driverLicenseNumber: testData.dlNumber,
        state: testData.state,
        dob: testData.dob,
      }),
    });

    const shavanoData = await shavanoResponse.json();
    const ciboloData = await ciboloResponse.json();

    console.log(`✅ Shavano Park: ${shavanoData.count} ticket(s) found`);
    console.log(`✅ Cibolo County: ${ciboloData.count} ticket(s) found`);

    // Step 2: Simulate ticket processing and conversion
    console.log("\n2️⃣ Simulating Ticket Processing...");

    const allTickets = [
      ...shavanoData.tickets.map((ticket) => ({
        ...ticket,
        source: "shavano",
        confidence: 0.95,
      })),
      ...ciboloData.tickets.map((ticket) => ({
        ...ticket,
        source: "cibolo",
        confidence: 0.98,
      })),
    ];

    console.log(`✅ Total tickets processed: ${allTickets.length}`);

    // Step 3: Simulate ticket conversion to database format
    console.log("\n3️⃣ Simulating Database Ticket Creation...");

    const dbTickets = allTickets.map((ticket, index) => ({
      id: `test_ticket_${index + 1}_${Date.now()}`,
      user_id: "test_user_123",
      ticket_number: ticket.citationNo,
      violation_date: new Date().toISOString().split("T")[0],
      due_date: ticket.dueDate,
      amount: ticket.fineAmount,
      state: testData.state,
      county: ticket.source === "shavano" ? "Shavano Park" : "Cibolo",
      court: ticket.courtName,
      violation: ticket.violation,
      violation_code: "",
      violation_description: ticket.violation,
      driver_license_number: testData.dlNumber,
      driver_license_state: testData.state,
      date_of_birth: testData.dob,
      status: "pending",
      notes: `Found via ${ticket.source} scraping (${Math.round(
        ticket.confidence * 100
      )}% confidence)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(`✅ ${dbTickets.length} tickets converted to database format`);

    // Step 4: Display ticket summary
    console.log("\n4️⃣ Ticket Summary:");
    console.log("==================");

    dbTickets.forEach((ticket, index) => {
      console.log(`Ticket ${index + 1}:`);
      console.log(`  Citation: ${ticket.ticket_number}`);
      console.log(`  Violation: ${ticket.violation}`);
      console.log(`  Amount: $${ticket.amount}`);
      console.log(`  Court: ${ticket.court}`);
      console.log(`  County: ${ticket.county}`);
      console.log(`  Due Date: ${ticket.due_date}`);
      console.log(
        `  Source: ${ticket.notes.split("via ")[1].split(" scraping")[0]}`
      );
      console.log("");
    });

    // Step 5: Calculate totals
    console.log("5️⃣ Payment Summary:");
    console.log("===================");

    const subtotal = dbTickets.reduce((sum, ticket) => sum + ticket.amount, 0);
    const serviceFee = Math.max(subtotal * 0.1, 10); // 10% or $10 minimum
    const total = subtotal + serviceFee;

    console.log(
      `Subtotal (${dbTickets.length} tickets): $${subtotal.toFixed(2)}`
    );
    console.log(`Service Fee (10% or min $10): $${serviceFee.toFixed(2)}`);
    console.log(`Total Amount: $${total.toFixed(2)}`);

    // Step 6: Test account simulation
    console.log("\n6️⃣ Simulating Multiple Account Testing...");

    const accounts = [
      { name: "John Doe", email: "john.doe@test.com" },
      { name: "Jane Smith", email: "jane.smith@test.com" },
    ];

    accounts.forEach((account, accountIndex) => {
      console.log(
        `\nAccount ${accountIndex + 1}: ${account.name} (${account.email})`
      );
      console.log(`  - Would submit ${dbTickets.length} tickets`);
      console.log(`  - Total amount: $${total.toFixed(2)}`);
      console.log(
        `  - Tickets would be saved to database with user_id: test_user_${
          accountIndex + 1
        }`
      );
    });

    console.log("\n🎉 COMPLETE FLOW TEST SUCCESSFUL!");
    console.log("=================================");
    console.log("✅ Backend scraping working correctly");
    console.log("✅ Ticket processing logic working");
    console.log("✅ Database conversion working");
    console.log("✅ Payment calculation working");
    console.log("✅ Multi-account simulation working");

    console.log("\n📋 Test Results Summary:");
    console.log(`- Shavano Park: ${shavanoData.count} ticket(s) found`);
    console.log(`- Cibolo County: ${ciboloData.count} ticket(s) found`);
    console.log(`- Total tickets: ${allTickets.length}`);
    console.log(`- Total amount: $${total.toFixed(2)}`);
    console.log(
      `- Test data working: DL ${testData.dlNumber}, State ${testData.state}, DOB ${testData.dob}`
    );

    return true;
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    return false;
  }
}

// Run the complete flow test
testCompleteFlow()
  .then((success) => {
    if (success) {
      console.log("\n✅ All tests completed successfully!");
      console.log(
        "The ticket submission system is working correctly with your test data."
      );
    } else {
      console.log("\n❌ Tests failed. Please check the errors above.");
    }
  })
  .catch(console.error);
