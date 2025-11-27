# Architecture Overview

This document explains how the example project is structured and how express-swagger-autogen works with it.

## 📊 Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Application                        │
│                         (server.js)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Route Matching                             │
│                    /api/v1/* routes                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Public Routes   │      │ Protected Routes │
    │  /auth/login     │      │  /auth/profile   │
    └────────┬─────────┘      │  /users/*        │
             │                └────────┬─────────┘
             │                         │
             │                         ▼
             │              ┌──────────────────┐
             │              │  verifyToken     │
             │              │  Middleware      │
             │              │  (Auto-detected) │
             │              └────────┬─────────┘
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Controller     │
              │   Handler        │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │    Response      │
              └──────────────────┘
```

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Express Swagger Autogen                      │
│                         (Library)                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Scans & Analyzes
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express App Router                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Route Stack  │  │  Middleware  │  │  Handlers    │        │
│  │              │  │              │  │              │        │
│  │ /api/v1/auth │  │ verifyToken  │  │ loginHandler │        │
│  │ /api/v1/users│  │ validate     │  │ getUsers     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Generates
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAPI 3.0 Specification                    │
│                                                                 │
│  {                                                              │
│    "paths": {                                                   │
│      "/api/v1/auth/login": { ... },                            │
│      "/api/v1/users": { ... }                                  │
│    },                                                           │
│    "components": {                                              │
│      "securitySchemes": { "bearerAuth": { ... } }             │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Serves via
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Swagger UI                              │
│                   (Interactive Documentation)                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Middleware Detection Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Middleware Function                          │
│                   const verifyToken = ...                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Middleware Analyzer                            │
│                  (middlewareAnalyzer.js)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Name Analysis   │      │  Code Analysis   │
    │                  │      │                  │
    │ • verifyToken    │      │ • jwt.verify()   │
    │ • authenticate   │      │ • authorization  │
    │ • checkAuth      │      │ • 401/403 codes  │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             └───────────┬─────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Detection      │
              │   Result         │
              │                  │
              │ isAuth: true     │
              │ description: ... │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  OpenAPI Spec    │
              │  security: [     │
              │   {bearerAuth:[]}│
              │  ]               │
              └──────────────────┘
```

## 📁 File Organization

### Routes Layer
```
routes/
├── index.js              # Main router - combines all routes
├── auth.routes.js        # Authentication endpoints
└── users.routes.js       # User management endpoints

Purpose: Define API endpoints and attach middleware
```

### Middleware Layer
```
middleware/
└── verifyToken.js        # JWT authentication

Purpose: Request processing, validation, authentication
Auto-detected by: Function name + code patterns
```

### Controllers Layer
```
controllers/
├── auth.controller.js    # Login, profile logic
└── users.controller.js   # CRUD operations

Purpose: Business logic and request handling
Analyzed for: Parameter extraction (req.body, req.params)
```

## 🔄 How Auto-Detection Works

### 1. Route Discovery

```javascript
// Library scans Express router stack
app._router.stack.forEach(layer => {
  if (layer.route) {
    // Found a route!
    const path = layer.route.path;
    const methods = Object.keys(layer.route.methods);
    const middlewares = layer.route.stack.map(l => l.name);
  }
});
```

### 2. Middleware Analysis

```javascript
// For each middleware in the chain
middlewares.forEach(middleware => {
  // Check name patterns
  if (/auth|token|verify/.test(middleware)) {
    // Likely authentication middleware
  }
  
  // Try to find and analyze the file
  const code = fs.readFileSync(`middleware/${middleware}.js`);
  if (/jwt\.verify/.test(code)) {
    // Confirmed: JWT authentication
  }
});
```

### 3. Controller Analysis

```javascript
// Read controller file
const controllerCode = fs.readFileSync('controllers/users.controller.js');

// Extract parameters
const bodyParams = extractFromPattern(code, /req\.body\.(\w+)/g);
const pathParams = extractFromPattern(code, /req\.params\.(\w+)/g);
const queryParams = extractFromPattern(code, /req\.query\.(\w+)/g);
```

### 4. Schema Generation

```javascript
// Combine all information
const schema = {
  path: '/api/v1/users/:id',
  method: 'GET',
  parameters: [
    { in: 'path', name: 'id', required: true }
  ],
  security: requiresAuth ? [{ bearerAuth: [] }] : [],
  responses: { ... }
};
```

## 🎯 Key Design Decisions

### Why Scan After Route Registration?

```javascript
// ❌ Wrong - routes not registered yet
initSwagger(app, options);
app.use('/api/v1', routes);

// ✅ Correct - routes registered first
app.use('/api/v1', routes);
initSwagger(app, options);
```

The library needs to scan the router stack, which only exists after routes are registered.

### Why Analyze Middleware Names?

Fast detection without reading files:
- `verifyToken` → Likely authentication
- `validateUser` → Likely validation
- `logRequest` → Likely logging (ignore)

### Why Provide Manual Schemas?

Some cases are too complex for auto-detection:
- Arrays of objects
- Nested structures
- Union types
- Custom validation logic

Manual schemas give you full control when needed!

## 🚀 Performance Considerations

### One-Time Scan

The library scans routes once at startup, not on every request:

```javascript
// Startup (once)
const spec = generateOpenApiSpec(app);

// Runtime (every request)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
```

### Caching

The OpenAPI spec is generated once and cached in memory.

### File Analysis

Middleware files are read and analyzed only once during startup.

## 🔐 Security Notes

### Token Storage

The example uses JWT tokens. In production:
- Use HTTPS
- Set secure token expiration
- Implement token refresh
- Store secrets in environment variables

### Middleware Detection

The library only reads files in your project directory. It never:
- Executes arbitrary code
- Modifies your files
- Sends data externally

## 📚 Further Reading

- [Express Router Documentation](https://expressjs.com/en/guide/routing.html)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
