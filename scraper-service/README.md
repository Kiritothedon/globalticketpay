# Ticket Scraper Service

A Node.js service that scrapes traffic ticket data from Shavano Park and Cibolo County websites using Puppeteer.

## Features

- **Shavano Park Scraping**: Searches tickets by driver license number and state
- **Cibolo County Scraping**: Searches tickets by driver license number, state, and date of birth
- **Puppeteer-based**: Uses headless Chrome for reliable scraping
- **REST API**: Simple HTTP endpoints for integration
- **Docker Support**: Easy deployment with Docker
- **Error Handling**: Graceful fallbacks and comprehensive error reporting

## Quick Start

### Using Docker (Recommended)

1. **Deploy the service:**
   ```bash
   ./deploy.sh
   ```

2. **Test the service:**
   ```bash
   curl http://localhost:3005/health
   ```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the service:**
   ```bash
   npm start
   ```

3. **For development:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Scrape Tickets
```http
POST /scrape
Content-Type: application/json

{
  "source": "shavano" | "cibolo",
  "driverLicenseNumber": "D123456789",
  "state": "TX",
  "dob": "1990-01-01"  // Required for Cibolo only
}
```

**Response:**
```json
{
  "tickets": [
    {
      "citationNo": "SP-123456",
      "violation": "Speeding",
      "fineAmount": 150.00,
      "dueDate": "2024-02-01",
      "courtName": "Shavano Park Municipal Court",
      "source": "shavano"
    }
  ],
  "count": 1
}
```

## Supported Sources

### 1. Shavano Park
- **URL**: https://www.trafficpayment.com/SearchByInvoiceInfo.aspx?csdId=520
- **Required Fields**: `driverLicenseNumber`, `state`
- **Optional Fields**: `dob` (not used but accepted)

### 2. Cibolo County
- **URL**: https://cibolotx.municipalonlinepayments.com/cibolotx/court/search
- **Required Fields**: `driverLicenseNumber`, `state`, `dob`
- **Search Type**: Driver's License

## Configuration

### Environment Variables

- `PORT`: Service port (default: 3005)
- `NODE_ENV`: Environment (development/production)

### Docker Configuration

The service runs in a Docker container with:
- Node.js 18 Alpine
- Chromium browser for Puppeteer
- Non-root user for security
- Health checks enabled

## Integration with Frontend

The frontend automatically tries multiple scraping methods:

1. **Supabase Edge Function** (if available)
2. **External Scraper Service** (this service)
3. **Mock Data** (fallback)

Set the scraper service URL in your frontend environment:
```env
VITE_SCRAPER_SERVICE_URL=http://localhost:3005
```

## Error Handling

The service includes comprehensive error handling:

- **Network errors**: Retries and graceful degradation
- **Parsing errors**: Continues with available data
- **Timeout errors**: Returns empty results
- **Invalid parameters**: Returns 400 with error details

## Monitoring

### Health Checks
```bash
# Check service health
curl http://localhost:3005/health

# Check Docker container
docker ps | grep ticket-scraper-service
```

### Logs
```bash
# View service logs
docker logs ticket-scraper-service

# Follow logs
docker logs -f ticket-scraper-service
```

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# Test scraping
curl -X POST http://localhost:3005/scrape \
  -H "Content-Type: application/json" \
  -d '{"source":"shavano","driverLicenseNumber":"D123456789","state":"TX"}'
```

### Testing
```bash
# Test Shavano Park
curl -X POST http://localhost:3005/scrape \
  -H "Content-Type: application/json" \
  -d '{"source":"shavano","driverLicenseNumber":"D123456789","state":"TX"}'

# Test Cibolo County
curl -X POST http://localhost:3005/scrape \
  -H "Content-Type: application/json" \
  -d '{"source":"cibolo","driverLicenseNumber":"D123456789","state":"TX","dob":"1990-01-01"}'
```

## Troubleshooting

### Common Issues

1. **Service won't start**
   - Check if port 3005 is available
   - Verify Docker is running
   - Check logs: `docker logs ticket-scraper-service`

2. **Scraping fails**
   - Verify target websites are accessible
   - Check if website structure has changed
   - Review browser console logs

3. **No tickets found**
   - Verify driver license number format
   - Check if state code is correct
   - Ensure DOB is provided for Cibolo

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Security Considerations

- Service runs as non-root user
- No sensitive data is logged
- CORS is enabled for frontend integration
- Input validation on all endpoints

## Performance

- Headless browser instances are reused when possible
- Automatic cleanup of browser resources
- Configurable timeouts for different operations
- Memory-efficient ticket parsing

## License

This service is part of the GlobalTicketPay project.
