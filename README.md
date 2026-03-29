# Toastmasters Glagol Members Bot 🎤

Телеграм бот для управления участниками клуба Toastmasters с полным функционалом CRUD операций и постоянным хранением данных.

## Action Items 📝

### Планируемые функции:

1. **💰 Добавить поле "оплата членского взноса"**
   - [ ] Поле для тех, кто заплатил за членство в текущем сроке
   - [ ] Команда для обновления статуса оплаты

2. **📅 Функциональность управления встречами**
   - [ ] Создание следующей встречи с датой
   - [ ] Список прошлых встреч
   - [ ] Информация о встрече:
     - Количество гостей
     - Контакты гостей
     - Члены которые участвовали
     - Занятые и незанятые роли

3. **👥 Управление участниками и гостями**
   - [ ] Добавить текущих участников клуба
   - [ ] Список потенциальных гостей
   - [ ] Приглашение гостей на следующую встречу

### Завершенное ✅
- [x] Базовое управление участниками (добавление, удаление, поиск)
- [x] Интеграция с базой данных Supabase
- [x] Локализация на русском языке

## Функции

- **Управление участниками**: Добавление, удаление, просмотр и поиск участников
- **Хранение в БД**: Постоянное хранение данных в Supabase
- **Умное добавление**: Поддержка подробной информации или простого добавления по имени
- **Поиск**: Находить участников по имени или ID
- **Статистика клуба**: Просмотр количества участников и распределения ролей  
- **TypeScript**: Полная типизация и современная разработка
- **Production Ready**: Развернут на Render с корректной обработкой ошибок

## Команды

### 📋 Управление участниками
- `/add` - Добавить нового участника (с подсказками по формату)
- `/remove <имя>` - Удалить участника по имени или ID
- `/list` - Показать всех активных участников
- `/find <имя>` - Найти и показать данные участника
- `/stats` - Показать статистику клуба

### ℹ️ Общие команды
- `/start` - Приветственное сообщение и обзор
- `/help` - Показать все доступные команды  
- `/about` - Информация о боте

## Быстрое добавление участников

**Подробный формат:**
```
Иван Петров | Вице-президент по образованию | ivan@example.com | +71234567890 | Опытный спикер
```

**Простой формат:**  
```
Анна Сидорова
```

## Prerequisites

- Node.js (v16 or higher)
- Supabase account and project
- Telegram Bot Token from @BotFather

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions to create your bot
4. Save the **Bot Token** for later

### 2. Setup Supabase Database

1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon (public) key
4. Go to **SQL Editor** and run the schema from `database/schema.sql`

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your credentials:
   ```env
   BOT_TOKEN=your_bot_token_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Build and Run

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Deployment on Render

### 1. Connect Repository

1. Go to [Render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository

### 2. Configure Service

- **Name**: `toastmasters-glagol-bot`
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables

Add these environment variables in Render dashboard:

```
BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy

Click **Create Web Service** and the bot will be deployed automatically!

## Database Schema

The bot uses a single `members` table with these fields:

- `id` - Auto-incrementing primary key
- `name` - Member's full name (required)
- `telegram_username` - Their Telegram username
- `telegram_user_id` - Telegram user ID
- `email` - Email address (optional)
- `phone` - Phone number (optional)
- `role` - Club role (default: "Member")
- `joined_date` - When they joined (auto-set)
- `status` - Member status (default: "Active")
- `notes` - Additional notes (optional)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

## Project Structure

```
toastmasters-glagol-bot/
├── src/
│   ├── index.ts          # Main bot code
│   └── database.ts       # Database operations
├── database/
│   └── schema.sql        # Supabase database schema
├── dist/                 # Compiled JavaScript (after build)
├── .env.example          # Environment variables template
├── .env                  # Your environment variables (not in git)
├── build.sh              # Render build script
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This documentation
```

## Usage Examples

### Adding Members

**Simple addition:**
```
User: Jane Smith
Bot: ✅ Member Added Successfully
     📛 Name: Jane Smith
     📋 Role: Member
     🆔 ID: 5
```

**Detailed addition:**
```
User: John Doe | President | john@example.com | +1234567890 | Club founder
Bot: ✅ Member Added Successfully
     📛 Name: John Doe
     📋 Role: President
     🆔 ID: 6
```

### Managing Members

```bash
/remove John Doe          # Remove by name
/remove 5                 # Remove by ID
/find John                # Search for Johns
/list                     # Show all members
/stats                    # Show statistics
```

## Logging

The bot includes comprehensive logging for all activities:

```
[2026-03-27 15:30:45] 👤 John Doe (@johndoe) - COMMAND: /add
   └─ New member added

[2026-03-27 15:31:02] 👤 Jane Smith (@janesmith) - MEMBER ADDED
   └─ John Doe (ID: 6)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
1. Check the logs for error details
2. Verify your environment variables
3. Ensure Supabase connection is working
4. Contact the development team

---

Built with ❤️ for Toastmasters Glagol Club
