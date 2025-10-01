# Traffic Ticket Scraping Service

A standalone microservice for scraping traffic tickets from various county websites using Playwright.

## Features

- 🎭 **Playwright Integration**: Reliable headless browser automation
- 🏛️ **Multi-County Support**: Modular architecture for easy county additions
- 🚀 **Express API**: RESTful endpoints for scraping operations
- 🔄 **Graceful Fallbacks**: Handles errors with helpful user messages
- 📊 **Health Monitoring**: Built-in health check endpoint

## Quick Start

### 1. Install Dependencies

```bash
cd scraping-service
npm install
```

### 2. Set Environment Variables

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

The service will start on `http://localhost:3001`

## API Endpoints

### Health Check

```bash
GET /health
```

### Scrape Tickets (GET)

```bash
GET /scrape/shavano?dl=46894084&state=TX
```

### Scrape Tickets (POST)

```bash
POST /scrape/shavano
Content-Type: application/json

{
  "driverLicenseNumber": "46894084",
  "state": "TX",
  "dob": ""
}
```

### List Available Counties

```bash
GET /counties
```

## Response Format

```json
{
  "success": true,
  "tickets": [
    {
      "citationNo": "215064-1",
      "violation": "SPEEDING10% OVER 57 MPH in a 45 MPH zone",
      "fineAmount": 243.95,
      "dueDate": "2024-11-03",
      "courtName": "Shavano Park Municipal Court",
      "source": "shavano"
    }
  ],
  "count": 1,
  "county": "shavano",
  "message": "Tickets found successfully"
}
```

## Deployment

### Railway

1. Connect your GitHub repository
2. Set the root directory to `scraping-service`
3. Deploy automatically

### Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `cd scraping-service && npm install`
4. Set start command: `cd scraping-service && npm start`

### Fly.io

1. Install Fly CLI
2. Run `fly launch` in the scraping-service directory
3. Deploy with `fly deploy`

### Heroku

1. Create a new app
2. Set buildpacks: `heroku/nodejs` and `jontewks/puppeteer`
3. Deploy from the scraping-service directory

## Adding New Counties

1. Create a new scraper file: `scrapers/newcounty.js`
2. Implement the scraper function
3. Add it to `scrapers/index.js`
4. Update the counties list

Example:

```javascript
// scrapers/newcounty.js
export async function scrapeNewCounty(dlNumber, state, dob) {
  // Implementation here
}

// scrapers/index.js
import { scrapeNewCounty } from "./newcounty.js";

const scrapers = {
  shavano: scrapeShavano,
  newcounty: scrapeNewCounty,
};
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Error Handling

The service includes comprehensive error handling:

- Network timeouts
- Browser launch failures
- Form submission errors
- Data extraction failures

All errors return a consistent JSON response with helpful messages.

## Monitoring

- Health check endpoint for uptime monitoring
- Structured logging for debugging
- Graceful shutdown handling

## Security

- CORS enabled for cross-origin requests
- Input validation for all parameters
- No sensitive data logging
- Rate limiting recommended for production
