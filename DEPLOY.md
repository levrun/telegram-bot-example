# Render.com Deployment Guide

## Quick Deploy to Render

### 1. Prerequisites
- GitHub repository with this bot code
- Supabase project set up with schema
- Telegram bot token from @BotFather

### 2. Deploy Steps

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: toastmasters-glagol-bot
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   BOT_TOKEN=your_bot_token_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your bot will be live!

### 3. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    telegram_username VARCHAR(255),
    telegram_user_id BIGINT,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100) DEFAULT 'Member',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_telegram_user_id ON members(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Test Your Bot

1. Find your bot on Telegram
2. Send `/start` to verify it's working
3. Try adding a member: `John Doe | President`
4. Check with `/list` to see the member

### 5. Monitoring

- Check Render logs for any issues
- Monitor the Supabase dashboard for database activity
- Use `/stats` command to verify member counts

## Troubleshooting

**Bot not starting?**
- Check environment variables are set correctly
- Verify BOT_TOKEN is valid
- Check Render build logs

**Database errors?**
- Verify Supabase URL and key are correct
- Check your Supabase project is active
- Ensure the schema was created properly

**Commands not working?**
- Check Render service logs
- Verify the bot is receiving updates
- Test with `/help` command first

## Scaling

For higher usage:
- Upgrade Render plan for more resources
- Consider Supabase Pro plan for better performance
- Add database connection pooling if needed

---

🚀 Your bot should now be running 24/7 on Render!