# Manual Schemas Guide

## Overview

Manual schemas allow you to define complex request/response structures that can't be auto-detected. This guide shows you how to organize and use them effectively.

## 🎯 Two Approaches

### Approach 1: External File (Recommended ✅)

**Benefits:**
- ✅ Keeps `server.js` clean and focused
- ✅ Easy to maintain and update schemas
- ✅ Better organization for large projects
- ✅ Schemas can be versioned separately
- ✅ Can be shared across multiple Swagger instances

**Setup:**

1. Create a schemas file:
```javascript
// swagger/manualSchemas.js
module.exports = {
  'loginHandler': {
    body: {
      username: { type: 'string', example: 'demo' },
      password: { type: 'string', format: 'password', example: 'password123' }
    }
  },
  'createUserHandler': {
    body: {
      username: { type: 'string', example: 'newuser' },
      email: { type: 'string', format: 'email', example: 'user@example.com' }
    }
  }
};
```

2. Load in your server:
```javascript
// server.js
const { initSwagger } = require('@artonramadani/express-swagger-autogen');

initSwagger(app, {
  title: 'My API',
  basePath: '/api/v1',
  manualSchemasPath: './swagger/manualSchemas.js'  // ← Load from file
});
```

### Approach 2: Inline Definition

**Use when:**
- Small project with few schemas
- Quick prototyping
- Temporary overrides

**Setup:**

```javascript
// server.js
initSwagger(app, {
  title: 'My API',
  basePath: '/api/v1',
  manualSchemas: {
    'loginHandler': {
      body: {
        username: { type: 'string', example: 'demo' },
        password: { type: 'string', format: 'password' }
      }
    }
  }
});
```

### Hybrid Approach

You can use both! Inline schemas override file-based schemas:

```javascript
initSwagger(app, {
  title: 'My API',
  manualSchemasPath: './swagger/manualSchemas.js',  // Load base schemas
  manualSchemas: {
    'loginHandler': {  // Override specific handler
      body: { /* custom definition */ }
    }
  }
});
```

## 📁 Recommended Project Structure

```
your-project/
├── controllers/
│   ├── auth.controller.js
│   └── users.controller.js
├── routes/
│   ├── auth.routes.js
│   └── users.routes.js
├── middleware/
│   └── verifyToken.js
├── swagger/                        # ← Swagger configuration directory
│   ├── README.md                   # Documentation
│   ├── QUICK_REFERENCE.md          # Quick reference
│   └── manualSchemas.js            # Schema definitions
└── server.js
```

## 🔍 How It Works

### 1. Handler Name Matching

The library matches schemas to handlers by function name:

```javascript
// controllers/auth.controller.js
const loginHandler = (req, res) => {
  // ^^^^^^^^^ This is the handler name
  const { username, password } = req.body;
  // ...
};

module.exports = { loginHandler };
```

```javascript
// swagger/manualSchemas.js
module.exports = {
  'loginHandler': {  // ← Must match exactly (case-sensitive)
    body: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  }
};
```

### 2. Schema Application

When a route uses `loginHandler`, the library:
1. Checks if `loginHandler` exists in manual schemas
2. If found, uses the manual schema
3. If not found, attempts auto-detection
4. Generates OpenAPI documentation

### 3. File Loading

```javascript
// server.js
initSwagger(app, {
  manualSchemasPath: './swagger/manualSchemas.js'
});
```

The library:
1. Resolves the path (relative to `process.cwd()`)
2. Requires the file
3. Validates it exports an object
4. Merges with inline schemas
5. Applies to matching handlers

## 📝 Schema Structure

### Basic Structure

```javascript
{
  'handlerName': {
    body: { /* request body parameters */ },
    params: { /* path parameters */ },
    query: { /* query parameters */ }
  }
}
```

### Complete Example

```javascript
module.exports = {
  'createOrderHandler': {
    // Request body
    body: {
      customerId: {
        type: 'integer',
        description: 'Customer ID',
        example: 123
      },
      items: {
        type: 'array',
        description: 'Order items',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'integer', example: 456 },
            quantity: { type: 'integer', minimum: 1, example: 2 },
            price: { type: 'number', format: 'float', example: 29.99 }
          }
        }
      }
    },
    
    // Path parameters (e.g., /orders/:id)
    params: {
      id: {
        type: 'integer',
        description: 'Order ID'
      }
    },
    
    // Query parameters (e.g., ?include=items)
    query: {
      include: {
        type: 'string',
        enum: ['items', 'customer', 'all'],
        description: 'What to include in response'
      }
    }
  }
};
```

## 🎨 Common Patterns

### Pattern 1: Simple CRUD

```javascript
module.exports = {
  'createUserHandler': {
    body: {
      username: { type: 'string', minLength: 3, example: 'john' },
      email: { type: 'string', format: 'email', example: 'john@example.com' }
    }
  },
  
  'updateUserHandler': {
    params: {
      id: { type: 'integer', description: 'User ID' }
    },
    body: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' }
    }
  },
  
  'deleteUserHandler': {
    params: {
      id: { type: 'integer', description: 'User ID' }
    }
  }
};
```

### Pattern 2: Authentication

```javascript
module.exports = {
  'loginHandler': {
    body: {
      username: { type: 'string', example: 'demo' },
      password: { type: 'string', format: 'password', example: 'password123' }
    }
  },
  
  'registerHandler': {
    body: {
      username: { type: 'string', minLength: 3, example: 'newuser' },
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { 
        type: 'string', 
        format: 'password',
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$',
        example: 'SecurePass123'
      }
    }
  },
  
  'changePasswordHandler': {
    body: {
      currentPassword: { type: 'string', format: 'password' },
      newPassword: { type: 'string', format: 'password', minLength: 8 }
    }
  }
};
```

### Pattern 3: Complex Nested Data

```javascript
module.exports = {
  'createOrderHandler': {
    body: {
      customer: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'integer', example: 123 },
          email: { type: 'string', format: 'email', example: 'customer@example.com' }
        }
      },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'integer', example: 456 },
            quantity: { type: 'integer', minimum: 1, example: 2 }
          }
        }
      },
      shipping: {
        type: 'object',
        required: ['address', 'city', 'zipCode'],
        properties: {
          address: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'New York' },
          zipCode: { type: 'string', pattern: '^[0-9]{5}$', example: '10001' }
        }
      }
    }
  }
};
```

## 🚀 Best Practices

### 1. Organize by Module

```javascript
// swagger/manualSchemas.js
module.exports = {
  // ========== Auth Module ==========
  'loginHandler': { /* ... */ },
  'registerHandler': { /* ... */ },
  'logoutHandler': { /* ... */ },
  
  // ========== Users Module ==========
  'createUserHandler': { /* ... */ },
  'updateUserHandler': { /* ... */ },
  'deleteUserHandler': { /* ... */ },
  
  // ========== Orders Module ==========
  'createOrderHandler': { /* ... */ },
  'updateOrderHandler': { /* ... */ }
};
```

### 2. Use Descriptive Examples

```javascript
// ❌ Bad - not helpful
username: { type: 'string', example: 'string' }

// ✅ Good - realistic example
username: { type: 'string', example: 'john_doe' }
```

### 3. Add Descriptions

```javascript
// ❌ Bad - no context
email: { type: 'string', format: 'email' }

// ✅ Good - clear purpose
email: { 
  type: 'string', 
  format: 'email',
  description: 'User email address for login and notifications',
  example: 'user@example.com'
}
```

### 4. Document Validation Rules

```javascript
password: {
  type: 'string',
  format: 'password',
  minLength: 8,
  maxLength: 100,
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$',
  description: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  example: 'SecurePass123'
}
```

### 5. Use Enums for Fixed Values

```javascript
// ❌ Bad - any string allowed
status: { type: 'string' }

// ✅ Good - restricted to valid values
status: {
  type: 'string',
  enum: ['pending', 'approved', 'rejected'],
  description: 'Order status',
  example: 'pending'
}
```

## 🐛 Troubleshooting

### Schema Not Applied?

**Check:**
1. ✅ Handler name matches exactly (case-sensitive)
2. ✅ Handler is exported from controller
3. ✅ File path in `manualSchemasPath` is correct
4. ✅ No syntax errors in schema file
5. ✅ Schema file exports an object

### File Not Found?

```javascript
// ❌ Wrong - absolute path
manualSchemasPath: '/Users/me/project/swagger/manualSchemas.js'

// ✅ Correct - relative to project root
manualSchemasPath: './swagger/manualSchemas.js'
```

### Schema Not Showing in Swagger UI?

1. Check browser console for errors
2. Verify OpenAPI spec at `/api-docs.json`
3. Ensure handler name matches
4. Check schema syntax is valid

## 📚 Resources

- [Example Project](./example) - Complete working example
- [Quick Reference](./example/swagger/QUICK_REFERENCE.md) - Common patterns
- [Detailed Guide](./example/swagger/README.md) - Full documentation
- [OpenAPI Specification](https://swagger.io/specification/) - Official spec

## 💡 Tips

- Start with auto-detection, add manual schemas only when needed
- Keep schemas in a separate file for better organization
- Use comments to document complex schemas
- Provide realistic examples
- Test your schemas in Swagger UI
- Version your schemas with your API

---

**Ready to get started?** Check out the [example project](./example) for a complete working implementation!
