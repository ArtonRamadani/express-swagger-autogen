/**
 * Complete Example - Express Swagger Autogen
 * 
 * This example demonstrates:
 * - Automatic route detection
 * - Middleware detection (authentication)
 * - Controller analysis
 * - Manual schema definitions
 * - JWT authentication flow
 */

require('dotenv').config();
const express = require('express');
const { initSwagger } = require('../index');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
const routes = require('./routes');

// Mount API routes
app.use('/api/v1', routes);

// Initialize Swagger AFTER routes are registered
// This is important - Swagger needs to scan the registered routes
initSwagger(app, {
  title: 'Express Swagger Autogen - Complete Example',
  version: '1.0.0',
  description: `
    # Complete API Example
    
    This example demonstrates all features of express-swagger-autogen:
    
    ## Features Demonstrated
    - ✅ Automatic route detection
    - ✅ JWT authentication middleware detection
    - ✅ Protected and public endpoints
    - ✅ CRUD operations
    - ✅ Path parameters
    - ✅ Request body schemas
    - ✅ Response schemas
    
    ## Getting Started
    
    1. **Login** using the \`/api/v1/auth/login\` endpoint
       - Username: \`demo\`
       - Password: \`password123\`
    
    2. **Copy the token** from the response
    
    3. **Click "Authorize" 🔒** button above and paste your token
    
    4. **Try protected endpoints** - they will now work with your token!
    
    ## Test Credentials
    - Username: \`demo\`
    - Password: \`password123\`
  `,
  basePath: '/api/v1',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server (with base path)'
    }
  ],
  // Schemas are defined in swagger/manualSchemas.js
  manualSchemasPath: './swagger/manualSchemas.js'
  
  // Alternative: You can also define schemas inline
  // manualSchemas: {
  //   'loginHandler': {
  //     body: { ... }
  //   }
  // }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Express Swagger Autogen - Example Server');
  console.log('='.repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('\n🔐 Test Credentials:');
  console.log('   Username: demo');
  console.log('   Password: password123');
  console.log('\n💡 Tip: Login first, then use the "Authorize" button with your token!');
  console.log('='.repeat(60));
});
