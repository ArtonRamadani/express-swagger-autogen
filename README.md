# Express Swagger Autogen

🚀 **Zero-config automatic Swagger/OpenAPI documentation generator for Express.js**

Automatically generates beautiful, interactive API documentation from your Express routes with minimal setup. No need to write extensive JSDoc comments or maintain separate documentation files!

## Features

- ✅ **Zero Configuration** - Works out of the box with sensible defaults
- ✅ **Auto-Detection** - Automatically discovers all Express routes
- ✅ **Controller Analysis** - Extracts parameters from your controllers
- ✅ **JWT Support** - Built-in Bearer token authentication
- ✅ **Interactive UI** - Beautiful Swagger UI with "Try it out" functionality
- ✅ **Express 4 & 5** - Compatible with both major versions
- ✅ **Manual Schemas** - Override auto-detection for complex endpoints
- ✅ **TypeScript Ready** - Works with TypeScript projects

## Installation

```bash
npm install express-swagger-autogen
```

## Quick Start

```javascript
const express = require('express');
const { initSwagger } = require('express-swagger-autogen');

const app = express();

// Your routes
app.use('/api/v1', require('./routes'));

// Initialize Swagger (AFTER routes are registered)
initSwagger(app, {
  title: 'My API',
  version: '1.0.0',
  description: 'My awesome API documentation',
  basePath: '/api/v1'
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Swagger UI: http://localhost:3000/api-docs');
});
```

That's it! Open `http://localhost:3000/api-docs` and see your documentation! 🎉

## Configuration Options

```javascript
initSwagger(app, {
  // Basic Info
  title: 'My API',                    // API title
  version: '1.0.0',                   // API version
  description: 'API Documentation',   // API description
  
  // Routing
  basePath: '/api/v1',                // Base path to filter routes
  docsPath: '/api-docs',              // Where Swagger UI is served
  
  // Servers
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development'
    },
    {
      url: 'https://api.example.com',
      description: 'Production'
    }
  ],
  
  // Security
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your JWT token'
    }
  },
  
  // Manual Schemas (for complex endpoints)
  manualSchemas: {
    'createOrderHandler': {
      body: {
        items: {
          type: 'array',
          description: 'Order items',
          items: {
            type: 'object',
            required: ['productId', 'quantity'],
            properties: {
              productId: {
                type: 'integer',
                example: 123
              },
              quantity: {
                type: 'integer',
                example: 5
              }
            }
          }
        },
        customerId: {
          type: 'integer',
          example: 456
        }
      }
    }
  },
  
  // Swagger UI Options
  swaggerUiOptions: {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }
});
```

## Manual Schemas

For complex endpoints with arrays or nested objects, you can provide manual schemas:

```javascript
const manualSchemas = {
  // Key is the handler function name
  'saveOrderHandler': {
    body: {
      items: {
        type: 'array',
        description: 'List of products',
        items: {
          type: 'object',
          required: ['ItemID', 'Quantity'],
          properties: {
            ItemID: { type: 'integer', example: 123 },
            Quantity: { type: 'integer', example: 5 }
          }
        },
        example: [
          { ItemID: 123, Quantity: 5 },
          { ItemID: 456, Quantity: 3 }
        ]
      },
      CustomerID: { type: 'integer', example: 789 },
      Notes: { type: 'string', example: 'Fast delivery' }
    }
  }
};

initSwagger(app, {
  title: 'My API',
  basePath: '/api/v1',
  manualSchemas
});
```

## Authentication

The library automatically detects JWT authentication middleware. To use it in Swagger UI:

1. Call your login endpoint
2. Copy the JWT token from the response
3. Click the "Authorize" 🔒 button at the top
4. Paste your token
5. All subsequent requests will include the token!

## Advanced Usage

### Custom Server URLs

```javascript
initSwagger(app, {
  title: 'My API',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local'
    },
    {
      url: 'https://staging-api.example.com',
      description: 'Staging'
    },
    {
      url: 'https://api.example.com',
      description: 'Production'
    }
  ]
});
```

### Multiple Security Schemes

```javascript
initSwagger(app, {
  title: 'My API',
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key'
    }
  }
});
```

### Access Raw OpenAPI Spec

The OpenAPI specification is available as JSON at `/api-docs.json` (or `${docsPath}.json`).

You can also access it programmatically:

```javascript
const { spec } = initSwagger(app, options);
console.log(spec); // Full OpenAPI 3.0 spec object
```

## How It Works

1. **Route Discovery**: Scans your Express app's router stack to find all routes
2. **Middleware Analysis**: Detects authentication and validation middleware
3. **Parameter Extraction**: Automatically identifies path, query, and body parameters
4. **Schema Generation**: Creates OpenAPI schemas from your route definitions
5. **UI Generation**: Serves interactive Swagger UI with all your endpoints

## Requirements

- Node.js >= 14.0.0
- Express >= 4.0.0 or >= 5.0.0

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on GitHub.

---

Made with ❤️ for the Express.js community
