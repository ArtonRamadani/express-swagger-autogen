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

  const swaggerSpec = generateOpenApiSpec(app, {
    title,
    version,
    description,
    basePath,
    servers,
    securitySchemes,
    manualSchemas
  });

  const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui-footer {
      background: #1b1b1b;
      color: #fff;
      padding: 12px 20px;
      text-align: center;
      font-size: 14px;
      border-top: 1px solid #3b4151;
      margin-top: 40px;
    }
    .swagger-ui-footer a {
      color: #61affe;
      text-decoration: none;
      font-weight: 500;
    }
    .swagger-ui-footer a:hover {
      text-decoration: underline;
    }
  `;

  const customHtml = `
    <div class="swagger-ui-footer">
      📚 API documentation powered by 
      <a href="https://www.npmjs.com/package/@artonramadani/express-swagger-autogen" target="_blank" rel="noopener noreferrer">
        express-swagger-autogen
      </a>
      - Auto-generated with zero configuration
    </div>
  `;

  const defaultUiOptions = {
    explorer: true,
    customCss: customCss + (swaggerUiOptions.customCss || ''),
    customSiteTitle: title,
    customfavIcon: swaggerUiOptions.customfavIcon,
    swaggerOptions: {
      persistAuthorization: true,
      ...swaggerUiOptions.swaggerOptions
    },
    customJsStr: `
      window.addEventListener('load', function() {
        const footer = document.createElement('div');
        footer.innerHTML = \`${customHtml}\`;
        const wrapper = document.querySelector('.swagger-ui .wrapper');
        if (wrapper) {
          wrapper.appendChild(footer.firstElementChild);
        } else {
          document.body.appendChild(footer.firstElementChild);
        }
      });
    `,
    ...swaggerUiOptions
  };

  app.use(docsPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, defaultUiOptions));

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
