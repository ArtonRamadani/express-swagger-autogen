# Manual Schemas Guide

This directory contains manual schema definitions for complex API endpoints that can't be auto-detected.

## 📁 File Structure

```
swagger/
├── README.md           # This file
└── manualSchemas.js    # Schema definitions
```

## 🎯 When to Use Manual Schemas

Use manual schemas when you have:

### 1. Arrays of Objects

```javascript
createOrderHandler: {
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
```

### 2. Nested Objects

```javascript
createUserHandler: {
  body: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' }
          }
        }
      }
    }
  }
}
```

### 3. Complex Validation Rules

```javascript
registerHandler: {
  body: {
    email: {
      type: 'string',
      format: 'email',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 100,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'
    }
  }
}
```

### 4. Enums and Specific Values

```javascript
updateStatusHandler: {
  body: {
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected'],
      description: 'Order status'
    }
  }
}
```

## 📝 Schema Format

Each schema follows this structure:

```javascript
module.exports = {
  'handlerFunctionName': {
    body: {
      // Request body parameters
      fieldName: {
        type: 'string',           // Required: data type
        description: 'Field desc', // Optional: description
        example: 'value',          // Optional: example value
        required: true,            // Optional: is required
        minLength: 3,              // Optional: validation
        maxLength: 50,             // Optional: validation
        pattern: '^[a-z]+$',       // Optional: regex pattern
        enum: ['a', 'b', 'c'],     // Optional: allowed values
        format: 'email'            // Optional: format hint
      }
    },
    params: {
      // Path parameters (e.g., /users/:id)
      id: {
        type: 'integer',
        description: 'User ID'
      }
    },
    query: {
      // Query parameters (e.g., ?page=1&limit=10)
      page: {
        type: 'integer',
        default: 1
      }
    }
  }
};
```

## 🔍 Finding Handler Names

The handler name is the function name in your controller:

```javascript
// controllers/users.controller.js
const createUserHandler = (req, res) => {  // ← This is the handler name
  // ...
};

module.exports = {
  createUserHandler  // ← Export with the same name
};
```

Then in your manual schemas:

```javascript
module.exports = {
  'createUserHandler': {  // ← Use the same name here
    body: { /* ... */ }
  }
};
```

## 📊 OpenAPI Data Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"hello"` |
| `integer` | Whole number | `42` |
| `number` | Decimal number | `3.14` |
| `boolean` | True/false | `true` |
| `array` | List of items | `[1, 2, 3]` |
| `object` | Nested object | `{ key: "value" }` |

## 🎨 Format Hints

Use `format` for specific string types:

| Format | Description | Example |
|--------|-------------|---------|
| `email` | Email address | `user@example.com` |
| `password` | Password field | `********` |
| `date` | Date (YYYY-MM-DD) | `2024-01-15` |
| `date-time` | ISO 8601 datetime | `2024-01-15T10:30:00Z` |
| `uri` | URL | `https://example.com` |
| `uuid` | UUID | `123e4567-e89b-12d3-a456-426614174000` |

## ✅ Validation Keywords

### String Validation

```javascript
{
  type: 'string',
  minLength: 3,
  maxLength: 50,
  pattern: '^[a-zA-Z]+$'  // Regex pattern
}
```

### Number Validation

```javascript
{
  type: 'integer',
  minimum: 1,
  maximum: 100,
  multipleOf: 5
}
```

### Array Validation

```javascript
{
  type: 'array',
  minItems: 1,
  maxItems: 10,
  uniqueItems: true,
  items: { type: 'string' }
}
```

## 💡 Best Practices

### 1. Always Provide Examples

```javascript
username: {
  type: 'string',
  example: 'john_doe'  // ✅ Helps users understand
}
```

### 2. Add Descriptions

```javascript
email: {
  type: 'string',
  format: 'email',
  description: 'User email address for login and notifications'  // ✅ Clear
}
```

### 3. Use Enums for Fixed Values

```javascript
role: {
  type: 'string',
  enum: ['admin', 'user', 'guest'],  // ✅ Restricts to valid values
  example: 'user'
}
```

### 4. Mark Required Fields

```javascript
{
  type: 'object',
  required: ['username', 'email'],  // ✅ Specify required fields
  properties: {
    username: { type: 'string' },
    email: { type: 'string' }
  }
}
```

### 5. Provide Realistic Examples

```javascript
items: {
  type: 'array',
  items: { /* ... */ },
  example: [  // ✅ Show real data structure
    { productId: 123, quantity: 2 },
    { productId: 456, quantity: 1 }
  ]
}
```

## 🔄 Loading Schemas

In your `server.js`:

```javascript
const { initSwagger } = require('express-swagger-autogen');

initSwagger(app, {
  title: 'My API',
  basePath: '/api/v1',
  manualSchemasPath: './swagger/manualSchemas.js'  // ← Load from this file
});
```

The library will:
1. Load schemas from the file
2. Merge with any inline schemas
3. Apply them to matching handlers

## 🐛 Troubleshooting

### Schema Not Applied?

**Check:**
1. Handler name matches exactly (case-sensitive)
2. Handler is exported from controller
3. File path is correct in `manualSchemasPath`
4. No syntax errors in schema definition

### Example Not Showing?

**Make sure:**
- Example value matches the type
- Example is valid JSON
- Example is realistic and helpful

### Validation Not Working?

**Remember:**
- Swagger UI shows validation rules
- Actual validation happens in your backend
- Use express-validator or similar for server-side validation

## 📚 More Examples

See [manualSchemas.js](./manualSchemas.js) for complete examples including:
- Simple schemas
- Complex nested objects
- Arrays of objects
- Validation rules
- Commented templates

## 🔗 References

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [JSON Schema Validation](https://json-schema.org/understanding-json-schema/)
- [Swagger Data Types](https://swagger.io/docs/specification/data-models/data-types/)
