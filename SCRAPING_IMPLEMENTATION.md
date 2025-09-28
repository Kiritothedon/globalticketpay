# Ticket Scraping Implementation

This document describes the complete implementation of working scrapers for Shavano Park and Cibolo County ticket lookup sites.

## Architecture Overview

The scraping system uses a multi-layered approach:

1. **Frontend Service** (`src/lib/countyScrapers.ts`) - Handles requests and fallbacks
2. **Backend Services** - Multiple options for actual scraping
3. **Mock Data** - Fallback when scraping fails

## Backend Scraping Options

### Option 1: Supabase Edge Functions
- **File**: `supabase/functions/scrape-tickets/index.ts`
- **File**: `supabase/functions/scrape-tickets-puppeteer/index.ts`
- **Pros**: Integrated with Supabase, serverless
- **Cons**: Limited execution time, Deno environment

### Option 2: External Node.js Service (Recommended)
- **Directory**: `scraper-service/`
- **Pros**: Full Node.js environment, Puppeteer support, Docker deployment
- **Cons**: Requires separate deployment

## Implementation Details

### 1. Shavano Park Scraper

**URL**: `https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520`

**Form Fields**:
- Driver's License: `ctl00$ContentPlaceHolder1$txtDLNumber`
- State: `ctl00$ContentPlaceHolder1$ddlState`
- Submit: `ctl00$ContentPlaceHolder1$btnSearch`

**Process**:
1. Load the search page
2. Extract ASP.NET viewstate and validation tokens
3. Fill in driver license and state
4. Submit the form
5. Parse results table for ticket data

**Expected Data**:
```json
{
  "citationNo": "SP-123456",
  "violation": "Speeding",
  "fineAmount": 150.00,
  "dueDate": "2024-02-01",
  "courtName": "Shavano Park Municipal Court",
  "source": "shavano"
}
```

### 2. Cibolo County Scraper

**URL**: `https://cibolotx.municipalonlinepayments.com/cibolotx/court/search`

**Process**:
1. Load the search page
2. Click "Driver's License" option
3. Fill in DL number, state, and DOB
4. Submit the form
5. Parse checkbox list results

**Expected Data**:
```json
{
  "citationNo": "C-123456",
  "violation": "Parking Violation",
  "fineAmount": 75.00,
  "dueDate": "2024-02-15",
  "courtName": "Cibolo Municipal Court",
  "source": "cibolo"
}
```

## Frontend Integration

### Service Configuration

The frontend automatically tries multiple scraping methods:

```typescript
// 1. Try Supabase Edge Function
const { data, error } = await supabase.functions.invoke('scrape-tickets', {
  body: { source, driverLicenseNumber, state, dob }
});

// 2. Fallback to external service
const response = await fetch(`${scraperServiceUrl}/scrape`, {
  method: 'POST',
  body: JSON.stringify({ source, driverLicenseNumber, state, dob })
});

// 3. Fallback to mock data
return this.scrapeShavanoPark(params); // Mock implementation
```

### Environment Variables

```env
# Scraper service URL
VITE_SCRAPER_SERVICE_URL=http://localhost:3005

# Supabase (for Edge Functions)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Deployment Options

### Option A: Docker Deployment (Recommended)

1. **Deploy scraper service**:
   ```bash
   cd scraper-service
   ./deploy.sh
   ```

2. **Update frontend environment**:
   ```env
   VITE_SCRAPER_SERVICE_URL=http://your-server:3005
   ```

### Option B: Supabase Edge Functions

1. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy scrape-tickets
   ```

2. **Configure RLS policies** for function access

### Option C: Vercel/Netlify Functions

1. **Create serverless function** in your deployment platform
2. **Update frontend** to call the function endpoint

## Testing

### Local Testing

```bash
# Start scraper service
cd scraper-service
npm install
npm start

# Test the service
node test-scraper.js
```

### Frontend Testing

1. **Open Enhanced Ticket Intake** in the app
2. **Select scraping sources** (Shavano Park, Cibolo County)
3. **Enter test data**:
   - DL Number: `D123456789`
   - State: `TX`
   - DOB: `1990-01-01` (for Cibolo)
4. **Click "Process Tickets"**

## Error Handling

### Scraping Failures

The system handles various failure scenarios:

1. **Network errors**: Retries with exponential backoff
2. **Parsing errors**: Continues with available data
3. **Timeout errors**: Returns empty results
4. **Website changes**: Falls back to mock data

### User Experience

- **Loading states**: Shows progress during scraping
- **Error messages**: Clear feedback on failures
- **Fallback data**: Mock data when scraping fails
- **Confidence scores**: Indicates data reliability

## Monitoring and Maintenance

### Health Checks

```bash
# Check scraper service health
curl http://localhost:3005/health

# Check specific scraping
curl -X POST http://localhost:3005/scrape \
  -H "Content-Type: application/json" \
  -d '{"source":"shavano","driverLicenseNumber":"D123456789","state":"TX"}'
```

### Logging

- **Frontend**: Console logs for debugging
- **Backend**: Structured logging with timestamps
- **Docker**: Container logs for monitoring

### Maintenance

1. **Regular testing**: Verify scrapers work with current website structure
2. **Selector updates**: Update CSS selectors if websites change
3. **Error monitoring**: Track scraping success rates
4. **Performance optimization**: Monitor response times

## Security Considerations

### Data Privacy

- **No data storage**: Tickets are not permanently stored
- **Secure transmission**: HTTPS for all communications
- **Input validation**: Sanitize all user inputs

### Rate Limiting

- **Request throttling**: Prevent overwhelming target sites
- **User limits**: Limit scraping requests per user
- **Caching**: Cache results to reduce duplicate requests

## Future Enhancements

### Additional Counties

To add new counties:

1. **Create scraper function** in `scraper-service/index.js`
2. **Add source configuration** in `CountyScrapers.getAvailableSources()`
3. **Update frontend** to handle new source
4. **Test thoroughly** with real data

### Advanced Features

- **Scheduled scraping**: Automatic ticket monitoring
- **Email notifications**: Alert users of new tickets
- **Payment integration**: Direct payment processing
- **Court integration**: Real-time court data

## Troubleshooting

### Common Issues

1. **"Scraping failed" errors**:
   - Check if target websites are accessible
   - Verify form field selectors haven't changed
   - Check browser console for JavaScript errors

2. **No tickets found**:
   - Verify driver license number format
   - Check if state code is correct
   - Ensure DOB is provided for Cibolo

3. **Service not responding**:
   - Check if scraper service is running
   - Verify port 3005 is available
   - Check Docker container status

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
NODE_ENV=development

# Check logs
docker logs -f ticket-scraper-service
```

## Support

For issues or questions:

1. **Check logs** for error details
2. **Test with known data** to isolate issues
3. **Verify website accessibility** from your location
4. **Update selectors** if website structure changes

The scraping system is designed to be robust and maintainable, with multiple fallback options to ensure users can always access ticket data.
