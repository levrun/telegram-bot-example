# Telegram Bot Example 🤖

A simple Telegram bot built with TypeScript and the Telegraf.js library.

## Features

- **Interactive Commands**: Start, help, about, echo, time, and random commands
- **Smart Responses**: Responds to common greetings and messages
- **Media Support**: Handles stickers and photos
- **TypeScript**: Full type safety and modern JavaScript features
- **Error Handling**: Graceful error handling and logging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Telegram account

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions to create your bot:
   - Choose a name for your bot (e.g., "My Awesome Bot")
   - Choose a username ending in "bot" (e.g., "my_awesome_bot")
4. BotFather will give you a **Bot Token** - save this for later!

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file and replace `YOUR_BOT_TOKEN_HERE` with your actual bot token:
   ```
   BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### 4. Build and Run

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript
- `npm run watch` - Compile TypeScript in watch mode
- `npm run clean` - Remove compiled files

## Bot Commands

Once your bot is running, you can interact with it using these commands:

- `/start` - Welcome message and command list
- `/help` - Show available commands
- `/about` - Information about the bot
- `/echo <message>` - Echo your message back
- `/time` - Get the current time
- `/random` - Get a random number (1-100)

The bot also responds to:
- Greetings (hello, hi)
- "How are you" questions
- Goodbyes
- Stickers and photos
- Any other text messages

## Project Structure

```
telegram-bot-example/
├── src/
│   └── index.ts          # Main bot code
├── dist/                 # Compiled JavaScript (after build)
├── .env.example          # Environment variables template
├── .env                  # Your environment variables (not in git)
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Where to Run Your Bot

You can run your Telegram bot in several ways:

### 1. **Local Development** (Current Setup)
- Run `npm run dev` on your local machine
- Great for testing and development
- Bot stops when you close the terminal

### 2. **Always Running Options:**

#### **Cloud Platforms:**
- **Heroku**: Easy deployment with git
- **Railway**: Simple Node.js deployment
- **Vercel**: Good for serverless functions
- **Netlify**: Supports Node.js functions
- **DigitalOcean App Platform**: Affordable and reliable

#### **VPS/Server:**
- **DigitalOcean Droplets**: Full control, affordable
- **AWS EC2**: Scalable cloud instances
- **Google Cloud Platform**: Robust infrastructure
- **Any VPS provider**: Vultr, Linode, etc.

#### **Free Options for Testing:**
- **Heroku Free Tier**: No longer available (as of 2022)
- **Railway**: Free tier with limitations
- **Render**: Free tier available
- **Glitch**: Free hosting for small projects

### 3. **Deployment Tips:**

For **production deployment**, you'll want to:
1. Set environment variables on your hosting platform
2. Use `npm start` instead of `npm run dev`
3. Set up proper logging
4. Consider using PM2 for process management on VPS

## Troubleshooting

### Common Issues:

1. **"BOT_TOKEN environment variable is required"**
   - Make sure you created the `.env` file
   - Check that your token is correctly set in `.env`

2. **"ETELEGRAM: 401 Unauthorized"**
   - Your bot token is invalid
   - Get a new token from @BotFather

3. **Bot doesn't respond**
   - Make sure the bot is running (`npm run dev`)
   - Check the console for error messages
   - Verify your bot token is correct

4. **TypeScript errors**
   - Run `npm run build` to check for compilation errors
   - Make sure all dependencies are installed

## Next Steps

Want to enhance your bot? Try adding:
- Database integration (MongoDB, PostgreSQL)
- More complex commands and conversations
- File uploads and downloads
- Inline keyboards and buttons
- User authentication and sessions
- Integration with external APIs
- Webhook support for production

## Contributing

Feel free to submit issues and enhancement requests!
