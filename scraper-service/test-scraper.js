#!/usr/bin/env node

// Test script for the ticket scraper service

const testScraping = async () => {
  const baseUrl = "http://localhost:3005";

  console.log("🧪 Testing Ticket Scraper Service...\n");

  // Test health endpoint
  console.log("1. Testing health endpoint...");
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check passed:", healthData);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return;
  }

  // Test Shavano Park scraping
  console.log("\n2. Testing Shavano Park scraping...");
  try {
    const shavanoResponse = await fetch(`${baseUrl}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "shavano",
        driverLicenseNumber: "D123456789",
        state: "TX",
      }),
    });

    const shavanoData = await shavanoResponse.json();
    console.log("✅ Shavano Park test completed");
    console.log(`   Found ${shavanoData.count} tickets`);
    if (shavanoData.tickets.length > 0) {
      console.log("   Sample ticket:", shavanoData.tickets[0]);
    }
  } catch (error) {
    console.log("❌ Shavano Park test failed:", error.message);
  }

  // Test Cibolo County scraping
  console.log("\n3. Testing Cibolo County scraping...");
  try {
    const ciboloResponse = await fetch(`${baseUrl}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "cibolo",
        driverLicenseNumber: "D123456789",
        state: "TX",
        dob: "1990-01-01",
      }),
    });

    const ciboloData = await ciboloResponse.json();
    console.log("✅ Cibolo County test completed");
    console.log(`   Found ${ciboloData.count} tickets`);
    if (ciboloData.tickets.length > 0) {
      console.log("   Sample ticket:", ciboloData.tickets[0]);
    }
  } catch (error) {
    console.log("❌ Cibolo County test failed:", error.message);
  }

  // Test error handling
  console.log("\n4. Testing error handling...");
  try {
    const errorResponse = await fetch(`${baseUrl}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "invalid",
        driverLicenseNumber: "D123456789",
        state: "TX",
      }),
    });

    const errorData = await errorResponse.json();
    console.log("✅ Error handling test completed");
    console.log("   Error response:", errorData);
  } catch (error) {
    console.log("❌ Error handling test failed:", error.message);
  }

  console.log("\n🎉 All tests completed!");
};

// Run tests
testScraping().catch(console.error);
