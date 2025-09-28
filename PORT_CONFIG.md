# Port Configuration

## Traffic Ticket App (This Project)

- **Default Port**: 3004
- **URL**: http://localhost:3004
- **Commands**:
  - `npm run dev` - Start on port 3004
  - `npm run dev:3001` - Start on port 3001 (if needed)
  - `npm run dev:3002` - Start on port 3002 (if needed)
  - `npm run dev:3003` - Start on port 3003 (if needed)

## Other Project

- **Recommended Port**: 3001
- **URL**: http://localhost:3001

## Port Usage Summary

- **3000**: Reserved/In Use
- **3001**: Available for other project
- **3002**: Available
- **3003**: Available
- **3004**: Traffic Ticket App (this project)

## Quick Start

1. For this project: `npm run dev` (uses port 3004)
2. For other project: Use port 3001
3. Both projects can run simultaneously without conflicts

## Troubleshooting

If you get port conflicts:

1. Check what's running: `lsof -i :3001` (or any port)
2. Kill process if needed: `kill -9 <PID>`
3. Use different ports as needed
