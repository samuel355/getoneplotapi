# 🚀 Get Plot API - Quick Start Guide

## Current Status

✅ **Redis (Upstash)** - CONFIGURED & TESTED
✅ **ESLint** - FIXED (v9 migration)
✅ **Joi Validators** - FIXED
✅ **API Gateway** - RUNNING on port 3000

⏳ **Database (Supabase)** - NEEDS CONFIGURATION

---

## 1️⃣ Configure Supabase Database

### Quick Setup (2 minutes)

1. **Get your Supabase connection string:**
   - Go to https://app.supabase.com
   - Select your project → Settings → Database
   - Copy the "Connection string" (URI)

2. **Update your `.env` file:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres
   DATABASE_SSL=true
   DATABASE_POOL_MAX=10
   DATABASE_POOL_MIN=2
   REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379
   ```

3. **Test the connection:**
   ```bash
   node test-supabase.js
   ```

4. **Run migrations (if needed):**
   ```bash
   npm run migrate
   npm run seed:dev
   ```

---

## 2️⃣ Start the API

### Option A: Start All Services (Recommended)
```bash
npm run dev
```
This starts all microservices concurrently:
- Gateway (port 3000)
- Auth Service (port 3001)
- Properties Service (port 3002)
- Transactions Service (port 3003)
- Users Service (port 3004)
- Notifications Service (port 3005)
- Plots Service (port 3007)

### Option B: Start Individual Services
```bash
npm run dev:gateway        # API Gateway
npm run dev:auth           # Auth Service
npm run dev:properties     # Properties Service
npm run dev:users          # Users Service
npm run dev:plots          # Plots Service
npm run dev:transactions   # Transactions Service
npm run dev:notifications  # Notifications Service
```

---

## 3️⃣ Test Endpoints

Once the API is running, test with:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api/info
```

---

## 4️⃣ Monitor Services

### Check Logs
```bash
# Real-time logs from all services
npm run docker:logs

# Or if running locally
# Just watch the terminal output
```

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

### Check Code Quality
```bash
# Lint check
npm run lint:check

# Auto-fix linting issues
npm run lint

# Format code
npm run format
```

---

## 5️⃣ Testing Utilities

### Test Redis Connection
```bash
node test-redis.js
```

### Test Database Connection
```bash
node test-supabase.js
```

### Test Database Schema
```bash
npm run test:database
```

---

## 📋 Environment Variables Checklist

Make sure these are configured in `.env`:

```
✅ REDIS_URL              - Upstash connection string
✅ DATABASE_URL           - Supabase connection string  
✅ DATABASE_SSL           - true (for Supabase)
✅ JWT_SECRET             - Your secret key
✅ GATEWAY_PORT           - 3000 (or your preferred port)
✅ NODE_ENV               - development or production
```

Optional but recommended:
```
SMTP_HOST, SMTP_PORT              - Email configuration
AFRICASTALKING_API_KEY            - SMS provider
PAYSTACK_SECRET_KEY               - Payment provider
GOOGLE_CLIENT_ID/SECRET           - Social login
FACEBOOK_APP_ID/SECRET            - Social login
GITHUB_CLIENT_ID/SECRET           - Social login
```

---

## 🔧 Useful Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

# Run linting
npm run lint

# Format code
npm run format

# Run tests with coverage
npm test

# Docker setup
npm run docker:build
npm run docker:up
npm run docker:down
```

---

## 🐛 Troubleshooting

### Redis Connection Issues
- Check `REDIS_URL` is set correctly
- Verify Upstash endpoint is reachable
- Test with: `node test-redis.js`

### Database Connection Issues
- Check `DATABASE_URL` is set correctly
- Verify IP is whitelisted in Supabase
- Check `DATABASE_SSL=true`
- Test with: `node test-supabase.js`

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
GATEWAY_PORT=3001 npm run dev:gateway
```

### Module Not Found Errors
```bash
# Reinstall all dependencies
npm install --legacy-peer-deps

# Install workspace dependencies
npm install -w @getplot/shared
npm install -w @getplot/api-gateway
```

---

## 📚 Documentation

- **Redis Setup:** See `REDIS_SETUP.md` (auto-configured with Upstash)
- **Database Setup:** See `SUPABASE_SETUP.md`
- **API Routes:** See `gateway/src/routes/`
- **Environment Variables:** See `.env.example`

---

## ✨ What's Next?

1. ✅ Configure Supabase DATABASE_URL
2. ✅ Test connection with `node test-supabase.js`
3. ✅ Run migrations if needed
4. ✅ Start all services with `npm run dev`
5. ✅ Begin API development!

---

## 📞 Support

If you encounter issues:
1. Check the `.env` configuration
2. Run the test scripts (test-redis.js, test-supabase.js)
3. Check service logs for errors
4. Verify all dependencies are installed

Happy coding! 🎉

