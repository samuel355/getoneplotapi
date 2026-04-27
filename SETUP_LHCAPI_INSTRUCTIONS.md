# 🗄️ Setup lhcAPI Schema - Complete Instructions

## Overview

You have a public schema in Supabase with existing tables and data. This guide shows you how to:
1. Copy the public schema to a new `lhcAPI` schema for isolated development
2. Verify the copy was successful
3. Test that data is accessible

This way, any changes you make are isolated to `lhcAPI` and won't affect the main `public` schema.

---

## Step 1: Get Your Supabase DATABASE_URL

### From Supabase Console:

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Settings** (bottom left) → **Database**
4. Under "Connection string", select **URI** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].supabase.co:5432/postgres
   ```

### Important Notes:
- Replace `[YOUR-PASSWORD]` with your actual database password
- Replace `[YOUR-HOST]` with your project reference (e.g., `abcdefgh`)
- Keep the entire string exactly as shown (don't modify the format)

---

## Step 2: Update Your .env File

Create or update your `.env` file in the API root directory with:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:mySecurePassword123@abcdefgh.supabase.co:5432/postgres
DATABASE_SSL=true
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=2
REDIS_URL=rediss://default:myUpstashToken@saving-civet-84144.upstash.io:6379
```

---

## Step 3: Test Database Connection

Before copying the schema, test that your connection works:

```bash
node test-supabase.js
```

You should see:
```
✅ Connected successfully!
✅ PostgreSQL Version: PostgreSQL...
✅ All tests passed!
```

If this fails:
1. Check DATABASE_URL is correct
2. Verify your IP is whitelisted in Supabase (Settings → Database → Firewall Rules)
3. Make sure DATABASE_SSL=true

---

## Step 4: Copy Public Schema to lhcAPI

Run the schema setup script:

```bash
node setup-lhcapi-schema.js
```

You should see output like:
```
🚀 Setting up lhcAPI schema...

1️⃣  Creating lhcAPI schema...
✅ lhcAPI schema created/verified

2️⃣  Fetching table structure from public schema...
✅ Found 5 tables: users, properties, plots, transactions, notifications

3️⃣  Copying table structures...
  ✅ Copied: users
  ✅ Copied: properties
  ✅ Copied: plots
  ✅ Copied: transactions
  ✅ Copied: notifications

4️⃣  Copying data from public to lhcAPI...
  ✅ Copied 10 rows from users
  ✅ Copied 25 rows from properties
  ✅ Copied 8 rows from plots
  ✅ Copied 12 rows from transactions
  ✅ Copied 5 rows from notifications

5️⃣  Testing lhcAPI schema with queries...

📊 Table: lhcAPI.users
   Records: 10
   Columns: id, email, name, created_at
   Sample: {"id":1,"email":"user@example.com","name":"John Doe"...

📊 Table: lhcAPI.properties
   Records: 25
   Columns: id, plot_no, location, price, status
   Sample: {"id":1,"plot_no":"P001","location":"yabi","price":50000...

✨ lhcAPI schema setup completed successfully!
```

---

## Step 5: Verify the Copy in Supabase SQL Editor

You can also verify the schema was copied correctly by running these queries in Supabase SQL Editor:

### Check Schema Exists:
```sql
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'lhcAPI';
```

Expected result: 1 row showing `lhcAPI`

### List All Tables in lhcAPI:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'lhcAPI' 
ORDER BY table_name;
```

### Count Rows in Each Table:
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM "lhcAPI"."users") as users_count,
  (SELECT COUNT(*) FROM "lhcAPI"."properties") as properties_count,
  (SELECT COUNT(*) FROM "lhcAPI"."plots") as plots_count,
  (SELECT COUNT(*) FROM "lhcAPI"."transactions") as transactions_count,
  (SELECT COUNT(*) FROM "lhcAPI"."notifications") as notifications_count;
```

### View Sample Data from a Table:
```sql
SELECT * FROM "lhcAPI"."users" LIMIT 5;
```

```sql
SELECT * FROM "lhcAPI"."properties" LIMIT 5;
```

```sql
SELECT * FROM "lhcAPI"."plots" LIMIT 5;
```

---

## Step 6: Test the lhcAPI Schema

Run a comprehensive test:

```bash
node test-lhcapi-schema.js
```

This will:
- Connect to the database
- Query all tables in lhcAPI schema
- Show you the data structure
- Display sample records
- Verify everything is working

---

## Step 7: Use lhcAPI in Your Code

When writing queries, use the lhcAPI schema instead of public:

### In JavaScript/Node.js:
```javascript
// Query lhcAPI schema
const result = await database.query(
  'SELECT * FROM "lhcAPI"."users" WHERE id = $1',
  [userId]
);

// Insert into lhcAPI
await database.query(
  'INSERT INTO "lhcAPI"."properties" (plot_no, location, price) VALUES ($1, $2, $3)',
  ['P001', 'yabi', 50000]
);
```

### In SQL (Supabase Editor):
```sql
SELECT * FROM "lhcAPI"."users";
INSERT INTO "lhcAPI"."properties" (plot_no, location, price) VALUES ('P002', 'trabuom', 60000);
UPDATE "lhcAPI"."users" SET name = 'New Name' WHERE id = 1;
DELETE FROM "lhcAPI"."properties" WHERE id = 999;
```

---

## Manual SQL Commands (If Script Fails)

If the automatic script fails, you can run these SQL commands manually in Supabase SQL Editor:

### 1. Create lhcAPI Schema:
```sql
CREATE SCHEMA IF NOT EXISTS "lhcAPI";
```

### 2. Copy Each Table Structure and Data:

Replace `table_name` with actual table names (users, properties, plots, etc.)

```sql
-- Copy table structure and data
CREATE TABLE IF NOT EXISTS "lhcAPI"."table_name" AS
SELECT * FROM public."table_name";

-- Or copy structure only (no data):
CREATE TABLE IF NOT EXISTS "lhcAPI"."table_name" AS
SELECT * FROM public."table_name" WHERE 1=0;
```

### 3. Verify Copy:
```sql
-- Check row counts match
SELECT 
  'public' as schema_name,
  COUNT(*) as row_count
FROM public."users"
UNION ALL
SELECT 
  'lhcAPI' as schema_name,
  COUNT(*) as row_count
FROM "lhcAPI"."users";
```

---

## Troubleshooting

### Issue: Connection Refused
```
Error: connect ECONNREFUSED
```
**Solution:**
1. Verify DATABASE_URL is set in .env
2. Check your IP is whitelisted in Supabase
3. Confirm DATABASE_SSL=true

### Issue: Authentication Failed
```
Error: password authentication failed
```
**Solution:**
1. Double-check your DATABASE_URL password
2. Verify credentials in Supabase console
3. Check for special characters in password (encode if needed)

### Issue: Schema Not Found
```
Error: schema "lhcAPI" does not exist
```
**Solution:**
1. Run the setup script again: `node setup-lhcapi-schema.js`
2. Or manually create the schema using the SQL commands above

### Issue: Permission Denied
```
Error: permission denied for schema lhcAPI
```
**Solution:**
1. Make sure you're using the correct database user
2. Check that the user has CREATE permissions

---

## What's Next?

Once lhcAPI schema is set up:

1. ✅ Start the API:
   ```bash
   npm run dev
   ```

2. ✅ Run tests:
   ```bash
   npm test
   ```

3. ✅ Update your queries to use:
   ```javascript
   SELECT * FROM "lhcAPI"."table_name"
   ```

4. ✅ Keep public schema untouched for backup/reference

---

## Summary of Commands

```bash
# 1. Test connection
node test-supabase.js

# 2. Setup lhcAPI schema
node setup-lhcapi-schema.js

# 3. Test lhcAPI schema
node test-lhcapi-schema.js

# 4. Start the API
npm run dev

# 5. Run all tests
npm test
```

---

## Important Notes

⚠️ **Remember:**
- The lhcAPI schema is now a **copy** of public
- Changes to lhcAPI will **NOT** affect public
- You can safely experiment and test in lhcAPI
- Keep public as your **production/backup** schema
- To sync changes from public → lhcAPI, run the setup script again

✨ You're all set! Your isolated development schema is ready.
