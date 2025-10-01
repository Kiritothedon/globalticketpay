# Traffic Ticket Scraping Architecture

## Overview

This document outlines the modular scraping architecture implemented for the Traffic Ticket Pay application, designed to handle multiple counties with a clean, extensible interface.

## Architecture Components

### 1. County Scraper Interface

```typescript
interface CountyScraper {
  name: string;
  searchTickets(params: { driverLicenseNumber: string; state: string; dob?: string }): Promise<TicketData[]>;
}
```

This interface allows for easy addition of new counties by implementing the `CountyScraper` interface.

### 2. Scraper Registry

```typescript
const scraperRegistry: Record<string, CountyScraper> = {
  shavano: new ShavanoParkScraper(),
  cibolo: new CiboloCountyScraper()
};
```

The registry pattern allows for dynamic scraper selection based on the `source` parameter.

### 3. Current Implementations

#### Shavano Park Scraper
- **URL**: `https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520`
- **Method**: Playwright (with HTTP fallback)
- **Required Fields**: Driver License Number, State
- **Optional Fields**: Date of Birth

#### Cibolo County Scraper
- **Status**: Placeholder implementation
- **Required Fields**: Driver License Number, State, Date of Birth

## Technical Implementation

### Edge Function Structure

The main Edge Function (`supabase/functions/scrape-tickets/index.ts`) handles:

1. **CORS Preflight**: Handles OPTIONS requests for cross-origin access
2. **Request Validation**: Validates required parameters
3. **Scraper Selection**: Routes requests to appropriate county scraper
4. **Error Handling**: Provides fallback messages for better UX

### Playwright Integration

The Shavano Park scraper uses Playwright for:
- **Headless Browser Automation**: Launches Chromium in headless mode
- **Form Interaction**: Fills driver license number and selects state
- **Button Clicking**: Clicks the search button
- **Data Extraction**: Parses results page for ticket information

### Fallback Mechanism

When Playwright fails (common in serverless environments), the system:
1. **Logs the Error**: Records the specific failure reason
2. **Returns Empty Results**: Allows UI to show helpful fallback message
3. **Suggests Manual Entry**: Guides users to add tickets manually

## Deployment Considerations

### Supabase Edge Functions Limitations

**Current Issue**: Playwright may not work reliably in Supabase Edge Functions due to:
- Import path resolution issues
- Limited runtime environment
- Memory constraints

**Recommended Solutions**:

1. **External Scraping Service**:
   - Use ScrapingBee, Bright Data, or similar
   - More reliable for headless browser automation
   - Better suited for production environments

2. **Separate Microservice**:
   - Deploy Playwright/Selenium on a dedicated server
   - Use Docker containers for consistent environment
   - Call via HTTP API from Edge Function

3. **API Integration**:
   - If counties provide APIs, use direct integration
   - More reliable than web scraping
   - Better performance and maintainability

### Example External Service Integration

```typescript
// Example using ScrapingBee
class ShavanoParkScraperExternal implements CountyScraper {
  private readonly apiKey = process.env.SCRAPINGBEE_API_KEY;
  private readonly baseUrl = 'https://app.scrapingbee.com/api/v1/';

  async searchTickets(params: SearchParams): Promise<TicketData[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        url: this.targetUrl,
        render_js: true,
        wait: 3000,
        // ... other parameters
      })
    });
    // Process response...
  }
}
```

## Adding New Counties

### Step 1: Create Scraper Class

```typescript
class NewCountyScraper implements CountyScraper {
  name = "newcounty";
  private readonly baseUrl = "https://newcounty.example.com/search";

  async searchTickets(params: SearchParams): Promise<TicketData[]> {
    // Implement scraping logic
    // Handle form submission
    // Extract ticket data
    // Return formatted results
  }
}
```

### Step 2: Register Scraper

```typescript
const scraperRegistry: Record<string, CountyScraper> = {
  shavano: new ShavanoParkScraper(),
  cibolo: new CiboloCountyScraper(),
  newcounty: new NewCountyScraper() // Add new scraper
};
```

### Step 3: Update Frontend

Add the new county to the UI dropdown and ensure the source parameter is passed correctly.

## Error Handling Strategy

### User-Facing Messages

- **No Tickets Found**: "No tickets found in [County]. This could be because: [reasons]"
- **Scraping Failed**: "We couldn't retrieve your ticket automatically. Please add it manually."
- **Network Error**: "Network connectivity issues. Please try again or add tickets manually."

### Developer Logging

- **Debug Level**: Detailed scraping process logs
- **Error Level**: Specific failure reasons and stack traces
- **Info Level**: High-level operation status

## Testing Strategy

### Unit Tests
- Test individual scraper methods
- Mock external dependencies
- Validate data transformation

### Integration Tests
- Test full scraping workflow
- Verify error handling
- Test fallback mechanisms

### End-to-End Tests
- Test complete user journey
- Verify UI integration
- Test with real data (when available)

## Performance Considerations

### Timeout Handling
- **Page Load**: 30 seconds
- **Form Submission**: 10 seconds
- **Data Extraction**: 5 seconds

### Resource Management
- **Browser Cleanup**: Always close browser instances
- **Memory Usage**: Monitor for memory leaks
- **Concurrent Requests**: Limit simultaneous scraping operations

### Caching Strategy
- **Results Caching**: Cache successful results for short periods
- **Rate Limiting**: Implement delays between requests
- **Retry Logic**: Exponential backoff for failed requests

## Security Considerations

### Data Protection
- **PII Handling**: Minimize storage of personal information
- **Secure Transmission**: Use HTTPS for all communications
- **Data Retention**: Implement appropriate data retention policies

### Rate Limiting
- **Request Throttling**: Limit requests per user/IP
- **Circuit Breaker**: Stop requests if service is down
- **Monitoring**: Track usage patterns and anomalies

## Monitoring and Alerting

### Key Metrics
- **Success Rate**: Percentage of successful scraping operations
- **Response Time**: Average time for scraping operations
- **Error Rate**: Frequency of different error types

### Alerts
- **High Error Rate**: Alert when error rate exceeds threshold
- **Service Down**: Alert when scraping service is unavailable
- **Performance Degradation**: Alert when response times increase

## Future Enhancements

### Planned Features
1. **Multi-County Support**: Add more counties
2. **Real-time Updates**: WebSocket-based live updates
3. **Advanced Filtering**: More sophisticated search criteria
4. **Batch Processing**: Handle multiple searches simultaneously

### Technical Improvements
1. **Better Error Recovery**: More sophisticated retry logic
2. **Performance Optimization**: Faster scraping operations
3. **Enhanced Monitoring**: More detailed metrics and alerting
4. **API Integration**: Direct API access where available

## Conclusion

The current architecture provides a solid foundation for traffic ticket scraping with room for growth. The modular design allows for easy addition of new counties, and the fallback mechanisms ensure a good user experience even when scraping fails.

For production deployment, consider using external scraping services or dedicated microservices for more reliable headless browser automation.
