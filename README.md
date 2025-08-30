# Discord Bot with Express API

A Discord bot with an Express REST API for external interactions.

## Features

- ✅ Modern discord.js v14 implementation
- 🚀 Express API for sending messages and managing the bot
- 🔒 Security features (Helmet, rate limiting)
- 📊 Bot statistics and health endpoints
- 🎨 Rich embed support
- ⚡ Optimized caching and memory management
- 🛡️ Comprehensive error handling
- 📝 Request validation

## Setup

### Prerequisites
- Node.js v16.11.0 or higher
- A Discord bot token
- Discord Developer Application

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd discord-bot-api
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

4. Add your Discord bot token to `.env`
```env
DISCORD_BOT_TOKEN=your_bot_token_here
PORT=3000
```

5. Start the bot
```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

## API Endpoints

### Health Check
```http
GET /api/health
```
Returns bot status and health information.

### Send Message
```http
POST /api/sendmessage
Content-Type: application/json

{
  "channel_id": "123456789",
  "content": "Hello, world!",
  "embed": {
    "title": "Optional Embed",
    "description": "Embed description",
    "color": 3447003,
    "fields": [
      {
        "name": "Field 1",
        "value": "Value 1",
        "inline": true
      }
    ],
    "footer": "Footer text",
    "timestamp": true
  }
}
```

### Get Bot Statistics
```http
GET /api/stats
```
Returns bot statistics including guild count, uptime, and memory usage.

### Get Guild Information
```http
GET /api/guild/{guildId}
```
Returns information about a specific guild the bot is in.

## Discord Commands

The bot includes a simple ping command:
- `!ping` - Returns bot latency

## Key Improvements from Original Code

1. **Updated to discord.js v14**: Uses GatewayIntentBits instead of deprecated Intents.FLAGS
2. **Proper Intent Configuration**: Added necessary intents for message sending
3. **Comprehensive Error Handling**: Try-catch blocks and validation throughout
4. **Security Features**: 
   - Helmet for security headers
   - Rate limiting to prevent abuse
   - Input validation
5. **Permission Checking**: Verifies bot has permissions before sending
6. **Rich Embeds Support**: Full embed builder implementation
7. **Health & Stats Endpoints**: Monitor bot status and performance
8. **Graceful Shutdown**: Properly closes connections on SIGINT
9. **Environment Validation**: Checks for required env vars on startup
10. **Memory Optimization**: Message sweeper to prevent memory leaks

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_BOT_TOKEN` | Your Discord bot token | Yes |
| `PORT` | Express server port | Yes |
| `NODE_ENV` | Environment (production/development) | No |

## Rate Limits

- General API: 100 requests per 15 minutes per IP
- Message sending: 10 messages per minute per IP

## Error Responses

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `403` - Forbidden (missing permissions)
- `404` - Not Found (channel/guild not found)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (bot not ready)

## Security Considerations

1. Never commit your `.env` file
2. Use environment-specific tokens
3. Implement authentication for production use (API keys, JWT, etc.)
4. Consider using a reverse proxy (nginx) in production
5. Monitor rate limits and adjust as needed
6. Validate and sanitize all user inputs

## Production Deployment

For production deployment, consider:
- Using PM2 or similar process manager
- Setting up logging (Winston, Bunyan)
- Implementing authentication middleware
- Using a reverse proxy
- Setting up monitoring (Prometheus, Grafana)
- Database integration for persistence

## License

MIT
