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
    `Добро пожаловать в бота для участников Toastmasters Glagol! 🎤\n\n` +
    `Я помогаю управлять списком участников нашего клуба. Вот что я умею:\n\n` +
    `📋 *Управление участниками:*\n` +
    `• /add - Добавить нового участника\n` +
    `• /remove - Удалить участника\n` +
    `• /list - Показать всех участников\n` +
    `• /find - Найти конкретного участника\n` +
    `• /stats - Показать статистику участников\n\n` +
    `ℹ️ *Другие команды:*\n` +
    `• /help - Показать это справочное сообщение\n` +
    `• /about - О боте\n\n` +
    `Готов помочь управлять нашим сообществом Toastmasters! 🚀`,
    { parse_mode: 'Markdown' }
  );
});

// Help command
bot.help((ctx) => {
  logUserAction(ctx, 'COMMAND: /help', 'User requested help');
  
  ctx.reply(
    `🎤 *Бот участников Toastmasters Glagol*\n\n` +
    `📋 *Команды управления участниками:*\n` +
    `• /add - Добавить нового участника в наш клуб\n` +
    `• /remove <имя> - Удалить участника по имени\n` +
    `• /list - Показать всех активных участников\n` +
    `• /find <имя> - Найти детали участника\n` +
    `• /stats - Показать статистику клуба\n\n` +
    `🔧 *Примеры использования:*\n` +
    `• \`/add\` - Следуй подсказкам для добавления участника\n` +
    `• \`/remove Иван Петров\` - Удалить Ивана Петрова\n` +
    `• \`/find Иван\` - Найти участников с именем Иван\n\n` +
    `ℹ️ *Общие команды:*\n` +
    `• /start - Приветственное сообщение\n` +
    `• /help - Это справочное сообщение\n` +
    `• /about - О боте`,
    { parse_mode: 'Markdown' }
  );
});

// About command
bot.command('about', (ctx) => {
  logUserAction(ctx, 'COMMAND: /about', 'User requested bot info');
  
  ctx.reply(
    `🎤 *Бот участников Toastmasters Glagol*\n\n` +
    `Этот бот помогает управлять базой данных участников нашего клуба Toastmasters.\n\n` +
    `🛠️ *Создан с помощью:*\n` +
    `• TypeScript\n` +
    `• Telegraf.js\n` +
    `• База данных Supabase\n` +
    `• Размещён на Render\n\n` +
    `📊 *Возможности:*\n` +
    `• Добавление/удаление участников\n` +
    `• Поиск и список участников\n` +
    `• Статистика клуба\n` +
    `• Сохранение данных\n\n` +
    `Создано для клуба Toastmasters Glagol 🌟`,
    { parse_mode: 'Markdown' }
  );
});

// Add member command
bot.command('add', (ctx) => {
  logUserAction(ctx, 'COMMAND: /add', 'User wants to add a member');
  
  ctx.reply(
    `🆕 *Добавить нового участника*\n\n` +
    `Пожалуйста, предоставьте детали участника в таком формате:\n` +
    `\`Имя | Роль | Email | Телефон | Заметки\`\n\n` +
    `📝 *Пример:*\n` +
    `\`Иван Петров | Вице-президент по образованию | ivan@example.com | +71234567890 | Опытный спикер\`\n\n` +
    `✨ *Обязательно:* Имя\n` +
    `📋 *Необязательно:* Роль, Email, Телефон, Заметки\n\n` +
    `Вы также можете использовать только имя:\n` +
    `\`Анна Сидорова\``,
    { parse_mode: 'Markdown' }
  );
});

// Remove member command
bot.command('remove', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const identifier = args.join(' ').trim();
  
  logUserAction(ctx, 'COMMAND: /remove', `Trying to remove: "${identifier}"`);

  if (!identifier) {
    ctx.reply(
      `❓ *Удалить участника*\n\n` +
      `Пожалуйста, укажите имя участника или ID для удаления:\n\n` +
      `📝 *Примеры:*\n` +
      `• \`/remove Иван Петров\`\n` +
      `• \`/remove 5\` (ID участника)\n\n` +
      `⚠️ *Предупреждение:* Это действие нельзя отменить!`,
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
      ctx.reply(`❌ Не удалось удалить участника: ${result.error}`);
      return;
    }

    ctx.reply(
      `✅ *Участник успешно удалён*\n\n` +
      `Участник "${identifier}" был удалён из базы данных клуба.`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Remove member failed: ${error}`);
    ctx.reply('❌ Произошла ошибка при удалении участника. Пожалуйста, попробуйте ещё раз.');
  }
});

// List members command
bot.command('list', async (ctx) => {
  logUserAction(ctx, 'COMMAND: /list', 'User requested member list');

  try {
    const result = await db.getAllMembers();

    if (!result.success) {
      ctx.reply(`❌ Не удалось загрузить список участников: ${result.error}`);
      return;
    }

    const members = result.members || [];

    if (members.length === 0) {
      ctx.reply(
        `📭 *Участников не найдено*\n\n` +
        `База данных участников пуста.\n` +
        `Используйте /add, чтобы добавить первого участника!`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    let message = `👥 *Участники Toastmasters Glagol* (${members.length})\n\n`;
    
    members.forEach((member, index) => {
      const role = member.role || 'Участник';
      const joinDate = member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'Неизвестно';
      
      message += `${index + 1}. *${member.name}*\n`;
      message += `   📋 Роль: ${role}\n`;
      if (member.telegram_username) {
        message += `   💬 Telegram: @${member.telegram_username}\n`;
      }
      if (member.email) {
        message += `   📧 Email: ${member.email}\n`;
      }
      message += `   � Присоединился: ${joinDate}\n\n`;
    });

    message += `\n🔍 Используйте /find <имя> для получения подробной информации\n📊 Используйте /stats для статистики клуба`;

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
    ctx.reply('❌ Произошла ошибка при загрузке списка участников. Пожалуйста, попробуйте ещё раз.');
  }
});

// Find member command
bot.command('find', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const searchTerm = args.join(' ').trim();
  
  logUserAction(ctx, 'COMMAND: /find', `Searching for: "${searchTerm}"`);

  if (!searchTerm) {
    ctx.reply(
      `🔍 *Найти участника*\n\n` +
      `Пожалуйста, укажите имя участника или ID для поиска:\n\n` +
      `📝 *Примеры:*\n` +
      `• \`/find Иван\`\n` +
      `• \`/find Иван Петров\`\n` +
      `• \`/find 5\` (ID участника)`,
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
      ctx.reply(`❌ Участник не найден: ${result.error}`);
      return;
    }

    const member = result.member!;
    const joinDate = member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'Неизвестно';
    const role = member.role || 'Участник';

    let message = `👤 *Данные участника*\n\n`;
    message += `🏷️ *Имя:* ${member.name}\n`;
    message += `🆔 *ID:* ${member.id}\n`;
    message += `📋 *Роль:* ${role}\n`;
    message += `📅 *Присоединился:* ${joinDate}\n`;
    message += `📊 *Статус:* ${member.status || 'Активный'}\n`;

    if (member.telegram_username) {
      message += `💬 *Telegram:* @${member.telegram_username}\n`;
    }
    if (member.email) {
      message += `📧 *Email:* ${member.email}\n`;
    }
    if (member.phone) {
      message += `📞 *Телефон:* ${member.phone}\n`;
    }
    if (member.notes) {
      message += `📝 *Заметки:* ${member.notes}\n`;
    }

    ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Find member failed: ${error}`);
    ctx.reply('❌ Произошла ошибка при поиске участника. Пожалуйста, попробуйте ещё раз.');
  }
});

// Stats command
bot.command('stats', async (ctx) => {
  logUserAction(ctx, 'COMMAND: /stats', 'User requested club statistics');

  try {
    const result = await db.getMemberStats();

    if (!result.success) {
      ctx.reply(`❌ Не удалось загрузить статистику: ${result.error}`);
      return;
    }

    const stats = result.stats!;
    const { totalMembers, roles } = stats;

    let message = `📊 *Статистика клуба Toastmasters Glagol*\n\n`;
    message += `👥 *Общее количество активных участников:* ${totalMembers}\n\n`;
    
    if (Object.keys(roles).length > 0) {
      message += `📋 *Участники по ролям:*\n`;
      Object.entries(roles).forEach(([role, count]) => {
        message += `• ${role}: ${count}\n`;
      });
    }

    message += `\n📅 *Последнее обновление:* ${new Date().toLocaleDateString()}\n`;
    message += `\n💡 Используйте /list, чтобы увидеть всех участников`;

    ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    logUserAction(ctx, 'ERROR', `Get stats failed: ${error}`);
    ctx.reply('❌ Произошла ошибка при загрузке статистики. Пожалуйста, попробуйте ещё раз.');
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
      ctx.reply('❌ Пожалуйста, укажите хотя бы имя для участника.');
      return;
    }

    const member: Member = {
      name: parts[0],
      role: parts[1] || 'Участник',
      email: parts[2] || undefined,
      phone: parts[3] || undefined,
      notes: parts[4] || undefined,
      telegram_username: ctx.from?.username,
      telegram_user_id: ctx.from?.id,
      status: 'Активный'
    };

    console.log('🔍 DEBUG: Attempting to add member:', JSON.stringify(member, null, 2));

    try {
      const result = await db.addMember(member);

      console.log('🔍 DEBUG: Database result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        ctx.reply(`❌ Не удалось добавить участника: ${result.error}`);
        console.log('❌ DEBUG: Add member failed:', result.error);
        return;
      }

      const addedMember = result.member!;
      
      ctx.reply(
        `✅ *Участник успешно добавлен*\n\n` +
        `🏷️ *Имя:* ${addedMember.name}\n` +
        `📋 *Роль:* ${addedMember.role}\n` +
        `🆔 *ID:* ${addedMember.id}\n` +
        `📅 *Добавлен:* ${new Date().toLocaleDateString()}\n\n` +
        `Добро пожаловать в Toastmasters Glagol! 🎉`,
        { parse_mode: 'Markdown' }
      );

      logUserAction(ctx, 'MEMBER ADDED', `${addedMember.name} (ID: ${addedMember.id})`);
      console.log('✅ DEBUG: Member successfully added to database');

    } catch (error) {
      logUserAction(ctx, 'ERROR', `Add member failed: ${error}`);
      console.error('❌ DEBUG: Exception during add member:', error);
      ctx.reply('❌ Произошла ошибка при добавлении участника. Пожалуйста, попробуйте ещё раз.');
    }
    
    return;
  }

  // Check if it's just a name (simple member addition)
  if (message.length > 2 && message.length < 50 && !message.includes('\n')) {
    console.log('🔍 DEBUG: Detected simple name format, adding basic member');
    
    const member: Member = {
      name: message,
      role: 'Участник',
      telegram_username: ctx.from?.username,
      telegram_user_id: ctx.from?.id,
      status: 'Активный'
    };

    console.log('🔍 DEBUG: Attempting to add simple member:', JSON.stringify(member, null, 2));

    try {
      const result = await db.addMember(member);

      console.log('🔍 DEBUG: Database result:', JSON.stringify(result, null, 2));

      if (!result.success) {
        ctx.reply(`❌ Не удалось добавить участника: ${result.error}`);
        console.log('❌ DEBUG: Add member failed:', result.error);
        return;
      }

      const addedMember = result.member!;
      
      ctx.reply(
        `✅ *Участник успешно добавлен*\n\n` +
        `🏷️ *Имя:* ${addedMember.name}\n` +
        `📋 *Роль:* Участник\n` +
        `🆔 *ID:* ${addedMember.id}\n\n` +
        `Добро пожаловать в Toastmasters Glagol! 🎉\n\n` +
        `💡 *Совет:* Используйте формат \`Имя | Роль | Email | Телефон | Заметки\` для более подробной информации в следующий раз.`,
        { parse_mode: 'Markdown' }
      );

      logUserAction(ctx, 'MEMBER ADDED', `${addedMember.name} (ID: ${addedMember.id})`);
      console.log('✅ DEBUG: Member successfully added to database');

    } catch (error) {
      logUserAction(ctx, 'ERROR', `Add member failed: ${error}`);
      console.error('❌ DEBUG: Exception during add member:', error);
      ctx.reply('❌ Произошла ошибка при добавлении участника. Пожалуйста, попробуйте ещё раз.');
    }
    
    return;
  }

  // Default response for other text messages
  console.log('🔍 DEBUG: Message not recognized as member data, sending help response');
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('привет') || message.toLowerCase().includes('здравствуй')) {
    ctx.reply(
      `Привет, ${ctx.from?.first_name}! 👋\n\n` +
      `Я - бот для участников Toastmasters Glagol.\n` +
      `Используйте /help, чтобы увидеть, что я умею!`
    );
  } else {
    ctx.reply(
      `Спасибо за сообщение! 💬\n\n` +
      `📋 Для добавления участника используйте формат:\n` +
      `\`Имя | Роль | Email | Телефон | Заметки\`\n\n` +
      `Или просто отправьте имя, например: \`Иван Петров\`\n\n` +
      `Используйте /help, чтобы увидеть все доступные команды.`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Handle stickers
bot.on('sticker', (ctx) => {
  logUserAction(ctx, 'STICKER', 'User sent a sticker');
  ctx.reply(
    `Классный стикер! 😄\n\n` +
    `Используйте /help, чтобы узнать, как управлять участниками клуба.`
  );
});

// Handle photos
bot.on('photo', (ctx) => {
  logUserAction(ctx, 'PHOTO', 'User sent a photo');
  ctx.reply(
    `Отличная фотография! 📸\n\n` +
    `Используйте /help, чтобы увидеть команды управления участниками.`
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
    '❌ Что-то пошло не так! Пожалуйста, попробуйте ещё раз.\n\n' +
    'Если проблема сохраняется, обратитесь к администратору клуба.'
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