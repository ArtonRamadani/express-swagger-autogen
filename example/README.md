# Express Swagger Autogen - Complete Example

This is a complete, production-like example demonstrating all features of `express-swagger-autogen`.

## 📁 Project Structure

```
example/
├── 📚 Documentation
│   ├── INDEX.md                 # Documentation index (start here!)
│   ├── QUICKSTART.md            # 3-minute quick start guide
│   ├── README.md                # Complete guide (this file)
│   ├── ARCHITECTURE.md          # Technical deep dive
│   └── COMPATIBILITY.md         # Compatibility guide
│
├── 🚀 Application Files
│   ├── server.js                # Main application entry point
│   ├── package.json             # Dependencies and scripts
│   ├── .env.example             # Environment variables template
│   └── .gitignore               # Git ignore rules
│
├── 🛣️ Routes Layer
│   └── routes/
│       ├── index.js             # Main router combining all routes
│       ├── auth.routes.js       # Authentication endpoints
│       └── users.routes.js      # User management endpoints
│
├── 🎮 Controllers Layer
│   └── controllers/
│       ├── auth.controller.js   # Authentication logic
│       └── users.controller.js  # User CRUD operations
│
├── 🔒 Middleware Layer
│   └── middleware/
│       └── verifyToken.js       # JWT authentication (auto-detected!)
│
└── 📋 Swagger Configuration
    └── swagger/
        ├── README.md            # Manual schemas guide
        └── manualSchemas.js     # Schema definitions (clean & organized!)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd example
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values work fine for testing).

### 3. Start the Server

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

### 4. Open Swagger UI

Navigate to: **http://localhost:3000/api-docs**

## 🔐 Testing Authentication

### Step 1: Login

1. Open Swagger UI at http://localhost:3000/api-docs
2. Find the `POST /api/v1/auth/login` endpoint
3. Click "Try it out"
4. Use these credentials:
   ```json
   {
     "username": "demo",
     "password": "password123"
   }
   ```
5. Click "Execute"
6. Copy the `token` from the response

### Step 2: Authorize

1. Click the **"Authorize" 🔒** button at the top of Swagger UI
2. Paste your token (without "Bearer" prefix)
3. Click "Authorize"
4. Click "Close"

### Step 3: Try Protected Endpoints

Now you can test any protected endpoint (marked with 🔒):
- `GET /api/v1/auth/profile` - Get your profile
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get specific user
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 📚 What This Example Demonstrates

### 1. Automatic Route Detection

The library automatically scans your Express app and finds all routes:

```javascript
// routes/users.routes.js
router.get('/', verifyToken, getAllUsersHandler);
router.get('/:id', verifyToken, getUserByIdHandler);
router.post('/', verifyToken, createUserHandler);
// ... etc
```

All these routes appear in Swagger UI automatically! ✨

### 2. Middleware Detection

The `verifyToken` middleware is automatically detected as authentication:

```javascript
// middleware/verifyToken.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  jwt.verify(token, secret, (err, decoded) => {
    // ... verification logic
  });
};
```

**How it's detected:**
- Function name contains "verify" and "token"
- Code contains `jwt.verify()`
- Code checks `authorization` header
- Returns 401/403 status codes

Result: Endpoints using this middleware automatically show 🔒 and require authentication!

### 3. Controller Analysis

The library analyzes your controllers to extract parameters:

```javascript
// controllers/users.controller.js
const createUserHandler = (req, res) => {
  const { username, email, role } = req.body;
  // ... logic
};
```

Parameters are automatically detected from `req.body`, `req.params`, and `req.query`!

### 4. Manual Schemas

For complex request bodies, you can provide manual schemas in a separate file:

```javascript
// swagger/manualSchemas.js
module.exports = {
  'createUserHandler': {
    body: {
      username: { type: 'string', example: 'newuser' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'user'] }
    }
  }
};
```

```javascript
// server.js
initSwagger(app, {
  manualSchemasPath: './swagger/manualSchemas.js'  // Load from file
});
```

This keeps your server.js clean and schemas organized! See [swagger/README.md](./swagger/README.md) for detailed guide.

### 5. Response Documentation

Standard responses are automatically documented:
- ✅ 200/201 - Success responses
- ❌ 400 - Validation errors
- 🔒 401 - Unauthorized (missing token)
- 🔒 403 - Forbidden (invalid/expired token)
- 💥 500 - Server errors

## 🎯 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ | Login and get JWT token |
| GET | `/api/v1/auth/profile` | ✅ | Get current user profile |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users` | ✅ | Get all users |
| GET | `/api/v1/users/:id` | ✅ | Get user by ID |
| POST | `/api/v1/users` | ✅ | Create new user |
| PUT | `/api/v1/users/:id` | ✅ | Update user |
| DELETE | `/api/v1/users/:id` | ✅ | Delete user |

## 🔍 How It Works

### 1. Route Discovery

```javascript
// server.js
app.use('/api/v1', routes);

// Initialize AFTER routes are registered
initSwagger(app, { basePath: '/api/v1' });
```

The library scans `app._router` or `app.router` to find all registered routes.

### 2. Middleware Analysis

For each route, it analyzes the middleware chain:

```javascript
router.get('/:id', verifyToken, getUserByIdHandler);
//                 ^^^^^^^^^^^  <- Detected as auth middleware
//                              ^^^^^^^^^^^^^^^^^ <- Handler function
```

### 3. Schema Generation

The library generates OpenAPI schemas from:
- Path parameters (`:id` → path parameter)
- Controller code analysis (extracts `req.body` fields)
- Manual schemas (for complex cases)

### 4. Documentation Generation

Finally, it generates a complete OpenAPI 3.0 specification and serves it with Swagger UI!

## 💡 Tips for Your Own Project

### 1. Name Your Middleware Clearly

Use descriptive names for automatic detection:
- ✅ `verifyToken`, `authenticate`, `checkAuth`
- ✅ `validateUser`, `checkInput`
- ❌ `middleware1`, `handler`, `fn`

### 2. Initialize Swagger After Routes

```javascript
// ❌ Wrong - routes not registered yet
initSwagger(app, options);
app.use('/api', routes);

// ✅ Correct - routes registered first
app.use('/api', routes);
initSwagger(app, options);
```

### 3. Use Manual Schemas for Complex Types

For arrays, nested objects, or complex validation:

```javascript
manualSchemas: {
  'createOrderHandler': {
    body: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'integer' },
            quantity: { type: 'integer' }
          }
        }
      }
    }
  }
}
```

### 4. Test Your Documentation

Always test your Swagger UI:
1. Check all endpoints are listed
2. Try the authentication flow
3. Test a few endpoints with "Try it out"
4. Verify request/response schemas are accurate

## 🐛 Troubleshooting

### Routes Not Showing Up

- Make sure you call `initSwagger()` AFTER registering routes
- Check that routes match the `basePath` filter
- Verify routes are actually registered (check `app._router.stack`)

### Middleware Not Detected

- Use descriptive middleware names
- Ensure middleware file is accessible
- Check middleware contains detection patterns (jwt.verify, authorization header, etc.)

### Parameters Missing

- Use manual schemas for complex request bodies
- Ensure controller code is accessible for analysis
- Check that parameters are extracted from `req.body`, `req.params`, or `req.query`

## 📖 Learn More

- [Main README](../README.md) - Full documentation
- [OpenAPI Specification](https://swagger.io/specification/) - OpenAPI 3.0 spec
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive documentation

## 🤝 Contributing

Found an issue or have a suggestion? Please open an issue on GitHub!

## 📄 License

MIT
