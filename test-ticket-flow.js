// Test script to verify ticket submission functionality
const testData = {
  dlNumber: "46894084",
  state: "TX",
  dob: "2001-12-09",
};

console.log("🧪 Testing Ticket Submission Flow");
console.log("=================================");
console.log(
  `Test Data: DL ${testData.dlNumber}, State ${testData.state}, DOB ${testData.dob}`
);
console.log("");

// Test 1: Verify scraper service is running
async function testScraperService() {
  console.log("1️⃣ Testing Scraper Service...");

  try {
    const response = await fetch("http://localhost:3005/health");
    const data = await response.json();
    console.log("✅ Scraper service is running:", data.status);
    return true;
  } catch (error) {
    console.log("❌ Scraper service is not running:", error.message);
    return false;
  }
}

// Test 2: Test Shavano Park scraping
async function testShavanoScraping() {
  console.log("\n2️⃣ Testing Shavano Park Scraping...");

  try {
    const response = await fetch("http://localhost:3005/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "shavano",
        driverLicenseNumber: testData.dlNumber,
        state: testData.state,
        dob: testData.dob,
      }),
    });

    const data = await response.json();
    console.log(`✅ Shavano Park: Found ${data.count} ticket(s)`);
    if (data.tickets.length > 0) {
      console.log(`   - Citation: ${data.tickets[0].citationNo}`);
      console.log(`   - Violation: ${data.tickets[0].violation}`);
      console.log(`   - Amount: $${data.tickets[0].fineAmount}`);
    }
    return true;
  } catch (error) {
    console.log("❌ Shavano Park scraping failed:", error.message);
    return false;
  }
}

// Test 3: Test Cibolo County scraping
async function testCiboloScraping() {
  console.log("\n3️⃣ Testing Cibolo County Scraping...");

  try {
    const response = await fetch("http://localhost:3005/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "cibolo",
        driverLicenseNumber: testData.dlNumber,
        state: testData.state,
        dob: testData.dob,
      }),
    });

    const data = await response.json();
    console.log(`✅ Cibolo County: Found ${data.count} ticket(s)`);
    if (data.tickets.length > 0) {
      data.tickets.forEach((ticket, index) => {
        console.log(
          `   - Ticket ${index + 1}: ${ticket.citationNo} - ${
            ticket.violation
          } - $${ticket.fineAmount}`
        );
      });
    }
    return true;
  } catch (error) {
    console.log("❌ Cibolo County scraping failed:", error.message);
    return false;
  }
}

// Test 4: Test frontend connection
async function testFrontendConnection() {
  console.log("\n4️⃣ Testing Frontend Connection...");

  try {
    const response = await fetch("http://localhost:3001");
    if (response.ok) {
      console.log("✅ Frontend is accessible");
      return true;
    } else {
      console.log("❌ Frontend returned error:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Frontend is not accessible:", error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting comprehensive ticket submission test...\n");

  const results = {
    scraperService: await testScraperService(),
    shavanoScraping: await testShavanoScraping(),
    ciboloScraping: await testCiboloScraping(),
    frontendConnection: await testFrontendConnection(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  console.log(
    `Scraper Service: ${results.scraperService ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Shavano Park: ${results.shavanoScraping ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Cibolo County: ${results.ciboloScraping ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `Frontend: ${results.frontendConnection ? "✅ PASS" : "❌ FAIL"}`
  );

  const allPassed = Object.values(results).every((result) => result);

  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("✅ Backend scraping is working with your test data");
    console.log("✅ Frontend is accessible and ready for testing");
    console.log("✅ You can now test the full flow in the browser");
    console.log("\n📝 Next Steps:");
    console.log("1. Open http://localhost:3001 in your browser");
    console.log("2. Create an account or sign in");
    console.log("3. Go to 'Add New Ticket' → 'Enhanced Search'");
    console.log("4. Use the test data: DL 46894084, State TX, DOB 2001-12-09");
    console.log("5. Select both Shavano Park and Cibolo County sources");
    console.log("6. Click 'Process Tickets' and verify tickets are found");
  } else {
    console.log("\n❌ Some tests failed. Please check the issues above.");
  }
}

// Run the tests
runAllTests().catch(console.error);
