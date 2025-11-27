# 🚀 Quick Start Guide

Get the example running in 3 minutes!

## Step 1: Install Dependencies (1 min)

```bash
cd example
npm install
```

## Step 2: Create Environment File (30 sec)

```bash
cp .env.example .env
```

The default values work fine for testing!

## Step 3: Start the Server (30 sec)

```bash
npm start
```

You should see:

```
============================================================
🚀 Express Swagger Autogen - Example Server
============================================================
📍 Server running on: http://localhost:3000
📚 Swagger UI: http://localhost:3000/api-docs
📄 OpenAPI Spec: http://localhost:3000/api-docs.json
💚 Health Check: http://localhost:3000/health
============================================================

🔐 Test Credentials:
   Username: demo
   Password: password123

💡 Tip: Login first, then use the "Authorize" button with your token!
============================================================
```

## Step 4: Open Swagger UI (1 min)

Open your browser: **http://localhost:3000/api-docs**

## Step 5: Test Authentication (1 min)

### Login

1. Find `POST /api/v1/auth/login`
2. Click **"Try it out"**
3. Enter credentials:
   ```json
   {
     "username": "demo",
     "password": "password123"
   }
   ```
4. Click **"Execute"**
5. **Copy the token** from the response

### Authorize

1. Click the **"Authorize" 🔒** button (top right)
2. Paste your token
3. Click **"Authorize"**
4. Click **"Close"**

### Test Protected Endpoints

Now try any endpoint with a 🔒 icon:
- `GET /api/v1/auth/profile` - Your profile
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user

## 🎉 That's It!

You now have a fully documented API with:
- ✅ Automatic route detection
- ✅ JWT authentication
- ✅ Interactive documentation
- ✅ Try it out functionality

## 📚 Next Steps

- Read [README.md](./README.md) for detailed documentation
- Explore the code to see how it works
- Adapt it for your own project!

## 💡 Pro Tips

### Development Mode (Auto-reload)

```bash
npm run dev
```

### View Raw OpenAPI Spec

http://localhost:3000/api-docs.json

### Health Check

http://localhost:3000/health

## ❓ Need Help?

Check the [Troubleshooting section](./README.md#-troubleshooting) in the main README!
