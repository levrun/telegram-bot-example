import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

// Create bot instance
const bot = new Telegraf(BOT_TOKEN);

// Logging helper function
const logUserAction = (ctx: any, action: string, details?: string) => {
  const timestamp = new Date().toLocaleString();
  const user = ctx.from;
  const username = user?.username ? `@${user.username}` : 'no-username';
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  
  console.log(`[${timestamp}] 👤 ${fullName} (${username}) - ${action}`);
  if (details) {
    console.log(`   └─ ${details}`);
  }
};

// Welcome message
bot.start((ctx) => {
  logUserAction(ctx, 'COMMAND: /start', 'New user started the bot');
  
  ctx.reply(
    `Welcome ${ctx.from?.first_name}! 🤖\n\n` +
    'I am a simple TypeScript Telegram bot. Here are some commands you can try:\n\n' +
    '• /help - Show this help message\n' +
    '• /about - Learn more about this bot\n' +
    '• /echo <message> - I\'ll echo your message\n' +
    '• /time - Get current time\n' +
    '• /random - Get a random number'
  );
});

// Help command
bot.help((ctx) => {
  logUserAction(ctx, 'COMMAND: /help', 'User requested help');
  
  ctx.reply(
    '🤖 *Available Commands:*\n\n' +
    '• /start - Welcome message\n' +
    '• /help - Show this help message\n' +
    '• /about - Learn more about this bot\n' +
    '• /echo <message> - I\'ll echo your message\n' +
    '• /time - Get current time\n' +
    '• /random - Get a random number\n\n' +
    'Just send me any message and I\'ll respond!',
    { parse_mode: 'Markdown' }
  );
});

// About command
bot.command('about', (ctx) => {
  logUserAction(ctx, 'COMMAND: /about', 'User requested bot info');
  
  ctx.reply(
    '🚀 *About This Bot*\n\n' +
    'This bot is built with:\n' +
    '• TypeScript\n' +
    '• Telegraf.js library\n' +
    '• Node.js\n\n' +
    'Created as a simple example of a Telegram bot!',
    { parse_mode: 'Markdown' }
  );
});

// Echo command
bot.command('echo', (ctx) => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  logUserAction(ctx, 'COMMAND: /echo', message ? `Message: "${message}"` : 'No message provided');
  
  if (message) {
    ctx.reply(`🔊 You said: "${message}"`);
  } else {
    ctx.reply('Please provide a message to echo! Example: /echo Hello World');
  }
});

// Time command
bot.command('time', (ctx) => {
  const now = new Date();
  logUserAction(ctx, 'COMMAND: /time', `Requested current time: ${now.toLocaleString()}`);
  
  ctx.reply(`⏰ Current time: ${now.toLocaleString()}`);
});

// Random number command
bot.command('random', (ctx) => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  logUserAction(ctx, 'COMMAND: /random', `Generated number: ${randomNumber}`);
  
  ctx.reply(`🎲 Your random number: ${randomNumber} (1-100)`);
});

// Handle any text message
bot.on('text', (ctx) => {
  const message = ctx.message.text.toLowerCase();
  logUserAction(ctx, 'TEXT MESSAGE', `"${ctx.message.text}"`);
  
  if (message.includes('hello') || message.includes('hi')) {
    ctx.reply(`Hello there, ${ctx.from?.first_name}! 👋`);
  } else if (message.includes('how are you')) {
    ctx.reply('I\'m doing great! Thanks for asking! 😊');
  } else if (message.includes('bye') || message.includes('goodbye')) {
    ctx.reply('Goodbye! Have a great day! 👋');
  } else {
    ctx.reply(
      `Thanks for your message: "${ctx.message.text}"\n\n` +
      'Try using one of my commands! Type /help to see what I can do.'
    );
  }
});

// Handle stickers
bot.on('sticker', (ctx) => {
  logUserAction(ctx, 'STICKER', 'User sent a sticker');
  ctx.reply('Nice sticker! 😄');
});

// Handle photos
bot.on('photo', (ctx) => {
  logUserAction(ctx, 'PHOTO', 'User sent a photo');
  ctx.reply('Great photo! 📸');
});

// Error handling
bot.catch((err, ctx) => {
  const timestamp = new Date().toLocaleString();
  console.error(`[${timestamp}] ❌ ERROR for ${ctx.updateType}:`, err);
  
  if (ctx.from) {
    const user = ctx.from;
    const username = user?.username ? `@${user.username}` : 'no-username';
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    console.error(`   ├─ User: ${fullName} (${username})`);
  }
  
  ctx.reply('Sorry, something went wrong! Please try again.');
});

// Start the bot
const startBot = async () => {
  try {
    console.log('='.repeat(50));
    console.log('🚀 Starting Telegram bot...');
    console.log(`🔑 Bot Token: ${BOT_TOKEN?.substring(0, 10)}...${BOT_TOKEN?.substring(-5)}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
    
    await bot.launch();
    
    console.log('✅ Bot is running and ready to receive messages!');
    console.log('📝 Activity log:');
    console.log('');
    
    // Enable graceful stop
    process.once('SIGINT', () => {
      console.log('\n🚫 Received SIGINT, stopping bot...');
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
      console.log('\n🚫 Received SIGTERM, stopping bot...');
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('='.repeat(50));
    console.error('❌ Failed to start bot:');
    console.error(error);
    console.error('='.repeat(50));
    process.exit(1);
  }
};

startBot();