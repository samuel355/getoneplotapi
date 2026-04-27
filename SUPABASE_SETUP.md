# 🚀 Supabase Setup Guide for Get Plot API

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- Your project created in Supabase console

## Step 1: Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **Settings** (bottom left) → **Database**
4. Copy the **Connection string** (URI)

The string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].supabase.co:5432/postgres
```

## Step 2: Configure Your `.env` File

Add these variables to your `.env` file:

```env
# Database Configuration for Supabase
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2
```

**Where to get these values:**
- `YOUR_PASSWORD`: Your database password (set during project creation)
- `YOUR_HOST`: Your Supabase project reference ID (find in Connection string)

### Example:
```env
DATABASE_URL=postgresql://postgres:mySecurePassword123@abcdefgh.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2
```

## Step 3: Verify Firewall/Network Settings

### For Local Development:
1. Go to Supabase Dashboard
2. Settings → Database → Firewall Rules
3. Ensure your IP address is whitelisted or allow all IPs (0.0.0.0/0) for development

### For Production:
- Whitelist your server's IP address only
- Never allow 0.0.0.0/0 in production

## Step 4: Test the Connection

Run the test script:

```bash
node test-supabase.js
```

### Expected Output:
```
✅ Connected successfully!
✅ PostgreSQL Version: PostgreSQL...
✅ Test table created
✅ Inserted: {...}
✅ Retrieved: {...}
✅ All tests passed! Supabase is working perfectly.
```

## Step 5: Run Migrations

Once connected, initialize your database schema:

```bash
# Run pending migrations
npm run migrate

# Or seed development data
npm run seed:dev
```

## Troubleshooting

### Connection Refused (ECONNREFUSED)
- **Issue**: Cannot connect to the database
- **Solution**: 
  - Verify `DATABASE_URL` is set correctly in `.env`
  - Check your IP is whitelisted in Supabase firewall
  - Ensure `DATABASE_SSL=true`

### SSL Certificate Error
- **Issue**: SSL certificate validation failed
- **Solution**: Already handled in code with `rejectUnauthorized: false` for Supabase pooler

### Authentication Failed
- **Issue**: Wrong password or username
- **Solution**: Double-check credentials in your Supabase console

### Timeout / Slow Connection
- **Issue**: Queries are very slow
- **Solution**: 
  - Check your internet connection
  - Verify you're using the correct region endpoint
  - Consider increasing `connectionTimeoutMillis` in database config

## Database Pool Configuration

The API uses a connection pool with these defaults:
- **Max Connections**: 10 (configurable via `DATABASE_POOL_MAX`)
- **Min Connections**: 2 (configurable via `DATABASE_POOL_MIN`)
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 20 seconds

Adjust these based on your needs:
```env
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

## Security Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use strong passwords** - Generate secure passwords in Supabase
3. **Whitelist IPs** - Only allow necessary IPs in production
4. **Rotate credentials** - Regularly rotate database passwords
5. **Use SSL/TLS** - Always use `DATABASE_SSL=true` for Supabase
6. **Connection pooling** - Use the built-in pool for efficiency

## Environment-Specific Configuration

### Development
```env
DATABASE_URL=postgresql://postgres:dev-password@dev-host.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=10
```

### Production
```env
DATABASE_URL=postgresql://postgres:prod-password@prod-host.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=25
NODE_ENV=production
```

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooler Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Network Settings](https://supabase.com/docs/guides/platform/network-restrictions)

## Support

If you encounter issues:
1. Check the Supabase status page: https://status.supabase.com
2. Review your database logs in Supabase console
3. Run the test script: `node test-supabase.js`
4. Check API logs for detailed error messages

