import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import DatabaseService, { Member } from './database';

// Load environment variables
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

// Create bot instance and database service
const bot = new Telegraf(BOT_TOKEN);
const db = new DatabaseService();

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
    `Welcome to Toastmasters Glagol Members Bot! 🎤\n\n` +
    `I help manage our club member list. Here's what I can do:\n\n` +
    `📋 *Member Management:*\n` +
    `• /add - Add a new member\n` +
    `• /remove - Remove a member\n` +
    `• /list - Show all members\n` +
    `• /find - Find a specific member\n` +
    `• /stats - Show member statistics\n\n` +
    `ℹ️ *Other Commands:*\n` +
    `• /help - Show this help message\n` +
    `• /about - About this bot\n\n` +
    `Ready to help manage our Toastmasters community! 🚀`,
    { parse_mode: 'Markdown' }
  );
});

// Help command
bot.help((ctx) => {
  logUserAction(ctx, 'COMMAND: /help', 'User requested help');
  
  ctx.reply(
    `🎤 *Toastmasters Glagol Members Bot*\n\n` +
    `📋 *Member Management Commands:*\n` +
    `• /add - Add a new member to our club\n` +
    `• /remove <name> - Remove a member by name\n` +
    `• /list - Show all active members\n` +
    `• /find <name> - Find member details\n` +
    `• /stats - Show club statistics\n\n` +
    `🔧 *Usage Examples:*\n` +
    `• \`/add\` - Follow the prompts to add a member\n` +
    `• \`/remove John Doe\` - Remove John Doe\n` +
    `• \`/find John\` - Find members named John\n\n` +
    `ℹ️ *General Commands:*\n` +
    `• /start - Welcome message\n` +
    `• /help - This help message\n` +
    `• /about - About the bot`,
    { parse_mode: 'Markdown' }
  );
});

// About command
bot.command('about', (ctx) => {
  logUserAction(ctx, 'COMMAND: /about', 'User requested bot info');
  
  ctx.reply(
    `🎤 *Toastmasters Glagol Members Bot*\n\n` +
    `This bot helps manage our Toastmasters club member database.\n\n` +
    `🛠️ *Built with:*\n` +
    `• TypeScript\n` +
    `• Telegraf.js\n` +
    `• Supabase Database\n` +
    `• Deployed on Render\n\n` +
    `📊 *Features:*\n` +
    `• Add/Remove members\n` +
    `• Member search and listing\n` +
    `• Club statistics\n` +
    `• Data persistence\n\n` +
    `Created for Toastmasters Glagol Club 🌟`,
    { parse_mode: 'Markdown' }
  );
});

// Add member command
bot.command('add', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const memberData = args.join(' ').trim();
  
  logUserAction(ctx, 'COMMAND: /add', memberData ? `Adding: "${memberData}"` : 'User wants to add a member');
  
  // If no arguments provided, show instructions
  if (!memberData) {
    ctx.reply(
      `🆕 *Add New Member*\n\n` +
      `Please provide member details in this format:\n` +
      `\`/add Name | Role | Email | Phone | Notes\`\n\n` +
      `📝 *Example:*\n` +
      `\`/add John Doe | VP Education | john@example.com | +1234567890 | Experienced speaker\`\n\n` +
      `✨ *Required:* Name\n` +
      `📋 *Optional:* Role, Email, Phone, Notes\n\n` +
      `You can also use just the name:\n` +
      `\`/add Jane Smith\``,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Process member data
  try {
    let member: Member;

    // Check if this looks like detailed member data (contains | separator)
    if (memberData.includes('|')) {
      console.log('🔍 DEBUG: Detected pipe separator in /add command, parsing as detailed member format');
      const parts = memberData.split('|').map(part => part.trim());
      
      if (parts.length < 1 || !parts[0]) {
        ctx.reply('❌ Please provide at least a name for the member.');
        return;
      }

      member = {
        name: parts[0],
        role: parts[1] || 'Member',
        email: parts[2] || undefined,
        phone: parts[3] || undefined,
        notes: parts[4] || undefined,
        telegram_username: ctx.from?.username,
        telegram_user_id: ctx.from?.id,
        status: 'Active'
      };
    } else {
      console.log('🔍 DEBUG: Simple name in /add command, adding basic member');
      // Simple name format
      member = {
        name: memberData,
        role: 'Member',
        telegram_username: ctx.from?.username,
        telegram_user_id: ctx.from?.id,
        status: 'Active'
      };
    }

    console.log('🔍 DEBUG: Attempting to add member via /add command:', JSON.stringify(member, null, 2));

    const result = await db.addMember(member);

    console.log('🔍 DEBUG: Database result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      ctx.reply(`❌ Failed to add member: ${result.error}`);
      console.log('❌ DEBUG: Add member failed:', result.error);
      return;
    }

    const addedMember = result.member!;
    
    ctx.reply(
      `✅ *Member Added Successfully*\n\n` +
      `📛 *Name:* ${addedMember.name}\n` +
      `📋 *Role:* ${addedMember.role}\n` +
      `🆔 *ID:* ${addedMember.id}\n` +
      `📅 *Added:* ${new Date().toLocaleDateString()}\n\n` +
      `Welcome to Toastmasters Glagol! 🎉`,
      { parse_mode: 'Markdown' }
    );

    logUserAction(ctx, 'MEMBER ADDED', `${addedMember.name} (ID: ${addedMember.id})`);
    console.log('✅ DEBUG: Member successfully added to database via /add command');

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Add member via /add failed: ${error}`);
    console.error('❌ DEBUG: Exception during /add member:', error);
    ctx.reply('❌ An error occurred while adding the member. Please try again.');
  }
});

// Remove member command
bot.command('remove', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const identifier = args.join(' ').trim();
  
  logUserAction(ctx, 'COMMAND: /remove', `Trying to remove: "${identifier}"`);

  if (!identifier) {
    ctx.reply(
      `❓ *Remove Member*\n\n` +
      `Please specify the member name or ID to remove:\n\n` +
      `📝 *Examples:*\n` +
      `• \`/remove John Doe\`\n` +
      `• \`/remove 5\` (member ID)\n\n` +
      `⚠️ *Warning:* This action cannot be undone!`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  try {
    // Check if identifier is a number (ID) or text (name)
    const memberId = parseInt(identifier);
    const searchTerm = isNaN(memberId) ? identifier : memberId;

    const result = await db.removeMember(searchTerm);

    if (!result.success) {
      ctx.reply(`❌ Failed to remove member: ${result.error}`);
      return;
    }

    ctx.reply(
      `✅ *Member Removed Successfully*\n\n` +
      `Member "${identifier}" has been removed from the club database.`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Remove member failed: ${error}`);
    ctx.reply('❌ An error occurred while removing the member. Please try again.');
  }
});

// List members command
bot.command('list', async (ctx) => {
  logUserAction(ctx, 'COMMAND: /list', 'User requested member list');

  try {
    const result = await db.getAllMembers();

    if (!result.success) {
      ctx.reply(`❌ Failed to fetch members: ${result.error}`);
      return;
    }

    const members = result.members || [];

    if (members.length === 0) {
      ctx.reply(
        `📭 *No Members Found*\n\n` +
        `The member database is empty.\n` +
        `Use /add to add the first member!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = `👥 *Toastmasters Glagol Members* (${members.length})\n\n`;
    
    members.forEach((member, index) => {
      const role = member.role || 'Member';
      const joinDate = member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'Unknown';
      
      message += `${index + 1}. *${member.name}*\n`;
      message += `   📋 Role: ${role}\n`;
      if (member.telegram_username) {
        message += `   💬 Telegram: @${member.telegram_username}\n`;
      }
      if (member.email) {
        message += `   📧 Email: ${member.email}\n`;
      }
      message += `   📅 Joined: ${joinDate}\n\n`;
    });

    message += `\n🔍 Use /find <name> for detailed info\n📊 Use /stats for club statistics`;

    // Split message if too long (Telegram limit ~4096 chars)
    if (message.length > 4000) {
      const chunks = message.match(/.{1,3900}/g) || [message];
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: 'Markdown' });
      }
    } else {
      ctx.reply(message, { parse_mode: 'Markdown' });
    }

  } catch (error) {
    logUserAction(ctx, 'ERROR', `List members failed: ${error}`);
    ctx.reply('❌ An error occurred while fetching the member list. Please try again.');
  }
});

// Find member command
bot.command('find', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const searchTerm = args.join(' ').trim();
  
  logUserAction(ctx, 'COMMAND: /find', `Searching for: "${searchTerm}"`);

  if (!searchTerm) {
    ctx.reply(
      `🔍 *Find Member*\n\n` +
      `Please specify the member name or ID to search:\n\n` +
      `📝 *Examples:*\n` +
      `• \`/find John\`\n` +
      `• \`/find John Doe\`\n` +
      `• \`/find 5\` (member ID)`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  try {
    // Check if searchTerm is a number (ID) or text (name)
    const memberId = parseInt(searchTerm);
    const identifier = isNaN(memberId) ? searchTerm : memberId;

    const result = await db.findMember(identifier);

    if (!result.success) {
      ctx.reply(`❌ Member not found: ${result.error}`);
      return;
    }

    const member = result.member!;
    const joinDate = member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'Unknown';
    const role = member.role || 'Member';

    let message = `👤 *Member Details*\n\n`;
    message += `📛 *Name:* ${member.name}\n`;
    message += `🆔 *ID:* ${member.id}\n`;
    message += `📋 *Role:* ${role}\n`;
    message += `📅 *Joined:* ${joinDate}\n`;
    message += `📊 *Status:* ${member.status || 'Active'}\n`;

    if (member.telegram_username) {
      message += `💬 *Telegram:* @${member.telegram_username}\n`;
    }
    if (member.email) {
      message += `📧 *Email:* ${member.email}\n`;
    }
    if (member.phone) {
      message += `📞 *Phone:* ${member.phone}\n`;
    }
    if (member.notes) {
      message += `📝 *Notes:* ${member.notes}\n`;
    }

    ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Find member failed: ${error}`);
    ctx.reply('❌ An error occurred while searching for the member. Please try again.');
  }
});

// Stats command
bot.command('stats', async (ctx) => {
  logUserAction(ctx, 'COMMAND: /stats', 'User requested club statistics');

  try {
    const result = await db.getMemberStats();

    if (!result.success) {
      ctx.reply(`❌ Failed to fetch statistics: ${result.error}`);
      return;
    }

    const stats = result.stats!;
    const { totalMembers, roles } = stats;

    let message = `📊 *Toastmasters Glagol Club Statistics*\n\n`;
    message += `👥 *Total Active Members:* ${totalMembers}\n\n`;
    
    if (Object.keys(roles).length > 0) {
      message += `📋 *Members by Role:*\n`;
      Object.entries(roles).forEach(([role, count]) => {
        message += `• ${role}: ${count}\n`;
      });
    }

    message += `\n📅 *Last updated:* ${new Date().toLocaleDateString()}\n`;
    message += `\n💡 Use /list to see all members`;

    ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Get stats failed: ${error}`);
    ctx.reply('❌ An error occurred while fetching statistics. Please try again.');
  }
});

// Handle text messages for adding members
bot.on('text', async (ctx) => {
  const message = ctx.message.text.trim();
  logUserAction(ctx, 'TEXT MESSAGE', `"${message}"`);

  // Skip if it's a command
  if (message.startsWith('/')) {
    return;
  }

  // Check if this looks like member data (contains | separator)
  if (message.includes('|')) {
    console.log('🔍 DEBUG: Detected pipe separator, parsing as detailed member format');
    // Parse member data format: Name | Role | Email | Phone | Notes
    const parts = message.split('|').map(part => part.trim());
    
    if (parts.length < 1 || !parts[0]) {
      ctx.reply('❌ Please provide at least a name for the member.');
      return;
    }

    const member: Member = {
      name: parts[0],
      role: parts[1] || 'Member',
      email: parts[2] || undefined,
      phone: parts[3] || undefined,
      notes: parts[4] || undefined,
      telegram_username: ctx.from?.username,
      telegram_user_id: ctx.from?.id,
      status: 'Active'
    };

    console.log('🔍 DEBUG: Attempting to add member:', JSON.stringify(member, null, 2));

    try {
      const result = await db.addMember(member);

      console.log('🔍 DEBUG: Database result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        ctx.reply(`❌ Failed to add member: ${result.error}`);
        console.log('❌ DEBUG: Add member failed:', result.error);
        return;
      }

      const addedMember = result.member!;
      
      ctx.reply(
        `✅ *Member Added Successfully*\n\n` +
        `📛 *Name:* ${addedMember.name}\n` +
        `📋 *Role:* ${addedMember.role}\n` +
        `🆔 *ID:* ${addedMember.id}\n` +
        `📅 *Added:* ${new Date().toLocaleDateString()}\n\n` +
        `Welcome to Toastmasters Glagol! 🎉`,
        { parse_mode: 'Markdown' }
      );

      logUserAction(ctx, 'MEMBER ADDED', `${addedMember.name} (ID: ${addedMember.id})`);
      console.log('✅ DEBUG: Member successfully added to database');

    } catch (error) {
      logUserAction(ctx, 'ERROR', `Add member failed: ${error}`);
      console.error('❌ DEBUG: Exception during add member:', error);
      ctx.reply('❌ An error occurred while adding the member. Please try again.');
    }
    
    return;
  }

  // Check if it's just a name (simple member addition)
  if (message.length > 2 && message.length < 50 && !message.includes('\n')) {
    console.log('🔍 DEBUG: Detected simple name format, adding basic member');
    
    const member: Member = {
      name: message,
      role: 'Member',
      telegram_username: ctx.from?.username,
      telegram_user_id: ctx.from?.id,
      status: 'Active'
    };

    console.log('🔍 DEBUG: Attempting to add simple member:', JSON.stringify(member, null, 2));

    try {
      const result = await db.addMember(member);

      console.log('🔍 DEBUG: Database result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        ctx.reply(`❌ Failed to add member: ${result.error}`);
        console.log('❌ DEBUG: Add member failed:', result.error);
        return;
      }

      const addedMember = result.member!;
      
      ctx.reply(
        `✅ *Member Added Successfully*\n\n` +
        `📛 *Name:* ${addedMember.name}\n` +
        `📋 *Role:* Member\n` +
        `🆔 *ID:* ${addedMember.id}\n\n` +
        `Welcome to Toastmasters Glagol! 🎉\n\n` +
        `💡 *Tip:* Use the format \`Name | Role | Email | Phone | Notes\` for more details next time.`,
        { parse_mode: 'Markdown' }
      );

      logUserAction(ctx, 'MEMBER ADDED', `${addedMember.name} (ID: ${addedMember.id})`);
      console.log('✅ DEBUG: Member successfully added to database');

    } catch (error) {
      logUserAction(ctx, 'ERROR', `Add member failed: ${error}`);
      console.error('❌ DEBUG: Exception during add member:', error);
      ctx.reply('❌ An error occurred while adding the member. Please try again.');
    }
    
    return;
  }

  // Default response for other text messages
  console.log('🔍 DEBUG: Message not recognized as member data, sending help response');
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    ctx.reply(
      `Hello ${ctx.from?.first_name}! 👋\n\n` +
      `I'm the Toastmasters Glagol Members Bot.\n` +
      `Use /help to see what I can do!`
    );
  } else {
    ctx.reply(
      `Thanks for your message! 💬\n\n` +
      `📋 To add a member, use the format:\n` +
      `\`Name | Role | Email | Phone | Notes\`\n\n` +
      `Or just send a name like: \`John Doe\`\n\n` +
      `Use /help to see all available commands.`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Handle stickers
bot.on('sticker', (ctx) => {
  logUserAction(ctx, 'STICKER', 'User sent a sticker');
  ctx.reply(
    `Nice sticker! 😄\n\n` +
    `Use /help to see how to manage club members.`
  );
});

// Handle photos
bot.on('photo', (ctx) => {
  logUserAction(ctx, 'PHOTO', 'User sent a photo');
  ctx.reply(
    `Great photo! 📸\n\n` +
    `Use /help to see member management commands.`
  );
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
  
  ctx.reply(
    '❌ Something went wrong! Please try again.\n\n' +
    'If the problem persists, contact the club admin.'
  );
});

// Start the bot
const startBot = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🎤 Starting Toastmasters Glagol Members Bot...');
    console.log(`🔑 Bot Token: ${BOT_TOKEN?.substring(0, 10)}...${BOT_TOKEN?.substring(-5)}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    
    // Test database connection
    try {
      console.log('🔄 Testing database connection...');
      const testResult = await db.getMemberStats();
      if (testResult.success) {
        console.log('✅ Database connection successful');
        console.log(`📊 Current members: ${testResult.stats?.totalMembers || 0}`);
      } else {
        console.log('⚠️ Database connection warning:', testResult.error);
        console.log('   Bot will start but database operations may fail');
      }
    } catch (dbError) {
      console.log('⚠️ Database connection failed:', dbError);
      console.log('   Bot will start but database operations may fail');
    }
    
    console.log('='.repeat(60));
    
    await bot.launch();
    
    console.log('✅ Bot is running and ready to manage members!');
    console.log('📝 Activity log:');
    console.log('');
    
    // Enable graceful stop
    process.once('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, stopping bot...');
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, stopping bot...');
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ Failed to start bot:');
    console.error(error);
    console.error('='.repeat(60));
    process.exit(1);
  }
};

startBot();