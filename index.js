/**
 * Express Swagger Autogen
 * Automatic Swagger/OpenAPI documentation generator for Express.js
 */

const swaggerUi = require('swagger-ui-express');
const { generateOpenApiSpec } = require('./lib/openApiGenerator');

/**
 * Initialize Swagger documentation for Express app
 * @param {Object} app - Express application instance
 * @param {Object} options - Configuration options
 * @param {string} options.title - API title
 * @param {string} options.version - API version
 * @param {string} options.description - API description
 * @param {string} options.basePath - Base path for API routes (e.g., '/api-v1')
 * @param {Array} options.servers - Array of server configurations
 * @param {Object} options.securitySchemes - Security scheme definitions
 * @param {Object} options.manualSchemas - Manual schema definitions for complex endpoints
 * @param {string} options.docsPath - Path where Swagger UI will be served (default: '/api-docs')
 * @param {Object} options.swaggerUiOptions - Custom Swagger UI options
 * @returns {Object} Swagger middleware and spec
 */
function initSwagger(app, options = {}) {
  const {
    title = 'API Documentation',
    version = '1.0.0',
    description = 'Auto-generated API Documentation',
    basePath = '/api',
    servers = [],
    securitySchemes = {},
    manualSchemas = {},
    docsPath = '/api-docs',
    swaggerUiOptions = {}
  } = options;

  // Generate OpenAPI specification
  const swaggerSpec = generateOpenApiSpec(app, {
    title,
    version,
    description,
    basePath,
    servers,
    securitySchemes,
    manualSchemas
  });

  // Default Swagger UI options
  const defaultUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: title,
    ...swaggerUiOptions
  };

  // Setup Swagger UI endpoint
  app.use(docsPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, defaultUiOptions));

  // Setup JSON spec endpoint
  app.get(`${docsPath}.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger UI available at ${docsPath}`);
  console.log(`📄 OpenAPI spec available at ${docsPath}.json`);

  return {
    spec: swaggerSpec,
    middleware: swaggerUi.serve,
    setup: swaggerUi.setup(swaggerSpec, defaultUiOptions)
  };
}

module.exports = {
  initSwagger
};
