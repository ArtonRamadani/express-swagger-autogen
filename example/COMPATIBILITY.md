# 🔄 Compatibility Guide

This guide shows what types of Express.js codebases work with `express-swagger-autogen`.

## ✅ Supported Project Structures

### 1. Simple Flat Structure

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/users', (req, res) => { ... });
app.post('/users', (req, res) => { ... });

initSwagger(app, { basePath: '/' });
```

**✅ Works!** All routes are detected.

---

### 2. Modular Routes (Recommended)

```javascript
// server.js
const express = require('express');
const app = express();

app.use('/api/v1', require('./routes'));

initSwagger(app, { basePath: '/api/v1' });
```

```javascript
// routes/index.js
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));

module.exports = router;
```

**✅ Works!** This is the structure used in our example.

---

### 3. Controller Pattern

```javascript
// routes/users.routes.js
const router = express.Router();
const controller = require('../controllers/users.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
```

**✅ Works!** Controllers are analyzed for parameters.

---

### 4. Middleware Chains

```javascript
// routes/users.routes.js
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

router.post('/', 
  verifyToken,      // ✅ Detected as auth
  validateUser,     // ✅ Detected as validation
  controller.create
);

module.exports = router;
```

**✅ Works!** Middleware is automatically detected.

---

### 5. Express Router with Base Path

```javascript
// server.js
const usersRouter = express.Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);

app.use('/api/users', usersRouter);

initSwagger(app, { basePath: '/api' });
```

**✅ Works!** Nested routers are supported.

---

### 6. Multiple API Versions

```javascript
// server.js
app.use('/api/v1', require('./routes/v1'));
app.use('/api/v2', require('./routes/v2'));

// Document v1
initSwagger(app, { 
  basePath: '/api/v1',
  docsPath: '/api-docs/v1'
});

// Document v2
initSwagger(app, { 
  basePath: '/api/v2',
  docsPath: '/api-docs/v2'
});
```

**✅ Works!** You can have multiple Swagger instances.

---

## 🔍 Authentication Patterns

### JWT Bearer Token

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid' });
    req.user = decoded;
    next();
  });
};
```

**✅ Detected!** Contains: jwt.verify, authorization header, 401/403

---

### Passport.js

```javascript
const passport = require('passport');

router.get('/profile', 
  passport.authenticate('jwt', { session: false }),
  getProfile
);
```

**✅ Detected!** Function name contains "authenticate"

---

### Custom Auth

```javascript
const checkAuth = async (req, res, next) => {
  const token = req.headers['x-auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Custom verification logic
  const valid = await verifyCustomToken(token);
  if (!valid) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
};
```

**✅ Detected!** Contains: auth in name, 401/403 codes

---

## 📦 Framework Compatibility

### Express 4.x

```javascript
const express = require('express'); // ^4.18.0
const app = express();

// ... routes ...

initSwagger(app, options);
```

**✅ Fully Supported**

---

### Express 5.x

```javascript
const express = require('express'); // ^5.0.0
const app = express();

// ... routes ...

initSwagger(app, options);
```

**✅ Fully Supported** (uses `app.router` instead of `app._router`)

---

## 🛠️ Middleware Compatibility

### express-validator

```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('username').isString().notEmpty(),
  body('email').isEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/users', validateUser, createUser);
```

**✅ Detected!** Validation middleware is recognized.

---

### body-parser / express.json()

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**✅ Compatible** (ignored during detection)

---

### cors

```javascript
const cors = require('cors');
app.use(cors());
```

**✅ Compatible** (ignored during detection)

---

### helmet

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**✅ Compatible** (ignored during detection)

---

## 📝 Parameter Detection

### Request Body

```javascript
const createUser = (req, res) => {
  const { username, email, role } = req.body;
  // ...
};
```

**✅ Detected:** username, email, role as body parameters

---

### Path Parameters

```javascript
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  // ...
});
```

**✅ Detected:** id as path parameter

---

### Query Parameters

```javascript
router.get('/users', (req, res) => {
  const { page, limit, search } = req.query;
  // ...
});
```

**✅ Detected:** page, limit, search as query parameters

---

### Mixed Parameters

```javascript
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const { notify } = req.query;
  // ...
});
```

**✅ Detected:** All parameters with correct locations

---

## ⚠️ Limitations

### 1. Dynamic Routes

```javascript
// ❌ Not detected
const routes = ['users', 'posts', 'comments'];
routes.forEach(route => {
  app.get(`/${route}`, handler);
});
```

**Workaround:** Define routes explicitly or use manual schemas.

---

### 2. Conditional Middleware

```javascript
// ⚠️ Partially detected
router.get('/data', 
  process.env.NODE_ENV === 'production' ? verifyToken : (req, res, next) => next(),
  getData
);
```

**Workaround:** Use consistent middleware or manual security configuration.

---

### 3. Complex Nested Objects

```javascript
// ⚠️ May need manual schema
const createOrder = (req, res) => {
  const { items, customer, shipping } = req.body;
  // items is array of objects
  // customer is nested object
  // shipping is nested object
};
```

**Workaround:** Use manual schemas for complex structures.

---

### 4. GraphQL Endpoints

```javascript
// ❌ Not supported
app.use('/graphql', graphqlHTTP({ schema }));
```

**Note:** This library is for REST APIs only.

---

## 🎯 Best Practices

### 1. Name Middleware Clearly

```javascript
// ✅ Good - will be detected
const verifyToken = ...
const authenticate = ...
const checkAuth = ...

// ❌ Bad - might not be detected
const middleware1 = ...
const fn = ...
const handler = ...
```

---

### 2. Initialize After Routes

```javascript
// ✅ Correct order
app.use('/api', routes);
initSwagger(app, { basePath: '/api' });

// ❌ Wrong order
initSwagger(app, { basePath: '/api' });
app.use('/api', routes);
```

---

### 3. Use Manual Schemas for Complex Cases

```javascript
initSwagger(app, {
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
});
```

---

### 4. Consistent Response Format

```javascript
// ✅ Good - consistent format
res.json({ status: 'Success', data: result });
res.status(400).json({ status: 'Error', message: 'Invalid' });

// ⚠️ Inconsistent - harder to document
res.json(result);
res.status(400).send('Error');
```

---

## 🧪 Testing Compatibility

Want to test if your project is compatible?

1. Install the library
2. Add `initSwagger()` after your routes
3. Check `/api-docs` endpoint
4. Verify routes are listed
5. Test authentication flow

If something doesn't work, check:
- Route registration order
- Middleware naming
- Parameter extraction
- Use manual schemas if needed

---

## 📚 More Examples

See the [example directory](./) for a complete working application demonstrating all these patterns!
