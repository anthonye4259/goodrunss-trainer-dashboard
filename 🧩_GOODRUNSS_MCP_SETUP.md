# 🧩 GoodRunss MCP - Setup & Usage

## Run the MCP server
```bash
cd /Users/anthonyedwards/Downloads/goodrunss-apps/goodrunss-trainer-dashboard
npm run mcp
```

This launches a stdio MCP server exposing GoodRunss tools.

## Tools
- `gia.chat` – Chat with GIA
- `bookings.create` – Create a booking
- `marketing.generate` – Generate trainer promo content
- `zapier.notify` – Send an event to Zapier

## Resources
- `goodrunss://docs/start` – short getting-started doc

## Prompts
- `player.findCourt`
- `trainer.promo`

## Register in MCP clients
- Claude Desktop/VSCode: add a custom MCP with `stdio` command `node mcp/server.js`
- MCP Inspector: choose stdio and point to the same command

## Environment
- `GOODRUNSS_BASE_URL` (default `http://localhost:3000`)
- Reuses existing `.env.local` for API keys used by your Next.js app

## Extend
Add more tools by editing `mcp/server.js` and proxying to your internal endpoints.

