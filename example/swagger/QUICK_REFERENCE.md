# Manual Schemas - Quick Reference

## 🚀 Quick Start

1. **Create schema file**: `swagger/manualSchemas.js`
2. **Export schemas**: Match handler function names
3. **Load in server**: `manualSchemasPath: './swagger/manualSchemas.js'`

## 📝 Basic Template

```javascript
module.exports = {
  'handlerName': {
    body: {
      fieldName: {
        type: 'string',
        description: 'Field description',
        example: 'example value'
      }
    }
  }
};
```

## 🎯 Common Patterns

### Simple String Field
```javascript
username: {
  type: 'string',
  minLength: 3,
  maxLength: 50,
  example: 'john_doe'
}
```

### Email Field
```javascript
email: {
  type: 'string',
  format: 'email',
  example: 'user@example.com'
}
```

### Password Field
```javascript
password: {
  type: 'string',
  format: 'password',
  minLength: 8,
  example: 'password123'
}
```

### Integer Field
```javascript
age: {
  type: 'integer',
  minimum: 18,
  maximum: 120,
  example: 25
}
```

### Enum Field
```javascript
role: {
  type: 'string',
  enum: ['admin', 'user', 'guest'],
  default: 'user',
  example: 'user'
}
```

### Boolean Field
```javascript
active: {
  type: 'boolean',
  default: true,
  example: true
}
```

### Array of Strings
```javascript
tags: {
  type: 'array',
  items: { type: 'string' },
  example: ['tag1', 'tag2', 'tag3']
}
```

### Array of Objects
```javascript
items: {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'quantity'],
    properties: {
      id: { type: 'integer', example: 123 },
      quantity: { type: 'integer', example: 2 }
    }
  },
  example: [
    { id: 123, quantity: 2 },
    { id: 456, quantity: 1 }
  ]
}
```

### Nested Object
```javascript
address: {
  type: 'object',
  required: ['street', 'city'],
  properties: {
    street: { type: 'string', example: '123 Main St' },
    city: { type: 'string', example: 'New York' },
    zipCode: { type: 'string', example: '10001' }
  }
}
```

### Date Field
```javascript
birthDate: {
  type: 'string',
  format: 'date',
  example: '1990-01-15'
}
```

### DateTime Field
```javascript
createdAt: {
  type: 'string',
  format: 'date-time',
  example: '2024-01-15T10:30:00Z'
}
```

### URL Field
```javascript
website: {
  type: 'string',
  format: 'uri',
  example: 'https://example.com'
}
```

### Number with Decimals
```javascript
price: {
  type: 'number',
  format: 'float',
  minimum: 0,
  example: 29.99
}
```

### Optional Field
```javascript
notes: {
  type: 'string',
  description: 'Optional notes',
  example: 'Some notes here'
  // Don't include in 'required' array
}
```

### Field with Pattern
```javascript
phoneNumber: {
  type: 'string',
  pattern: '^\\+?[1-9]\\d{1,14}$',
  example: '+1234567890'
}
```

## 📦 Complete Example

```javascript
module.exports = {
  'createUserHandler': {
    body: {
      // Required fields
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        example: 'john_doe'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john@example.com'
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        example: 'SecurePass123'
      },
      
      // Optional fields
      age: {
        type: 'integer',
        minimum: 18,
        example: 25
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        default: 'user',
        example: 'user'
      },
      
      // Nested object
      profile: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          bio: { type: 'string', example: 'Software developer' }
        }
      },
      
      // Array
      interests: {
        type: 'array',
        items: { type: 'string' },
        example: ['coding', 'music', 'sports']
      }
    }
  }
};
```

## 🔍 Finding Handler Names

```javascript
// In your controller file
const createUserHandler = (req, res) => { ... };
//    ^^^^^^^^^^^^^^^^^ Use this name

module.exports = { createUserHandler };
```

```javascript
// In manualSchemas.js
module.exports = {
  'createUserHandler': { ... }
  // ^^^^^^^^^^^^^^^^^ Same name
};
```

## ⚡ Tips

- ✅ Always provide `example` values
- ✅ Add `description` for clarity
- ✅ Use `format` for specific types (email, date, etc.)
- ✅ Specify `minLength`/`maxLength` for strings
- ✅ Use `enum` for fixed values
- ✅ Mark required fields in `required` array
- ✅ Provide realistic examples

## 🔗 Full Documentation

See [README.md](./README.md) for complete guide with all options and examples.
