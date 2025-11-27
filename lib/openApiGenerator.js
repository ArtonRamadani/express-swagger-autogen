/**
 * OpenAPI Generator - Generates OpenAPI 3.0 specification from Express app
 */

const { inspectRoutes } = require('./routeInspector');
const { requiresAuthentication } = require('./middlewareAnalyzer');

function generateOpenApiSpec(app, options = {}) {
  const {
    title = 'API Documentation',
    version = '1.0.0',
    description = 'Auto-generated API Documentation',
    basePath = '/api',
    servers = [],
    securitySchemes = {},
    manualSchemas = {}
  } = options;

  // Extract routes
  const routes = inspectRoutes(app, basePath);

  // Build OpenAPI spec
  const spec = {
    openapi: '3.0.0',
    info: {
      title,
      version,
      description
    },
    servers: servers.length > 0 ? servers : [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: Object.keys(securitySchemes).length > 0 ? securitySchemes : {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {}
    },
    tags: [],
    paths: {}
  };

  // Generate tags from routes
  const modules = new Set();
  routes.forEach(route => {
    const module = getModuleFromPath(route.path, basePath);
    if (module) modules.add(module);
  });

  modules.forEach(module => {
    spec.tags.push({
      name: capitalizeFirstLetter(module),
      description: `${capitalizeFirstLetter(module)} related endpoints`
    });
  });

  // Generate paths
  routes.forEach(route => {
    generatePathItem(spec, route, manualSchemas, basePath);
  });

  return spec;
}

function generatePathItem(spec, route, manualSchemas, basePath) {
  const path = route.path;
  const method = route.method.toLowerCase();

  if (!spec.paths[path]) {
    spec.paths[path] = {};
  }

  // Check for manual schema
  const manualSchema = manualSchemas[route.handler];
  
  // Detect authentication requirement dynamically
  const requiresAuth = requiresAuthentication(route.middlewares, route.path);

  // Get module tag
  const tag = getModuleFromPath(path, basePath);

  // Create endpoint definition
  const endpoint = {
    summary: generateSummary(route),
    description: '',
    tags: tag ? [capitalizeFirstLetter(tag)] : ['Other'],
    security: requiresAuth ? [{ bearerAuth: [] }] : []
  };

  // Add parameters for path params
  const pathParams = extractPathParams(path);
  if (pathParams.length > 0) {
    endpoint.parameters = pathParams.map(param => ({
      in: 'path',
      name: param,
      required: true,
      schema: { type: 'string' },
      description: `${param} parameter`
    }));
  }

  // Add request body for POST/PUT/PATCH
  if (['post', 'put', 'patch'].includes(method) && manualSchema && manualSchema.body) {
    endpoint.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: manualSchema.body
          }
        }
      }
    };
  }

  // Add responses
  endpoint.responses = {
    '200': {
      description: 'Successful operation',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'Success' },
              data: { type: 'object' }
            }
          }
        }
      }
    },
    '400': {
      description: 'Bad request'
    },
    '401': {
      description: 'Unauthorized'
    },
    '500': {
      description: 'Internal server error'
    }
  };

  spec.paths[path][method] = endpoint;
}

function generateSummary(route) {
  const method = route.method.toUpperCase();
  const pathParts = route.path.split('/').filter(p => p && !p.startsWith(':'));
  
  const actionMap = {
    'GET': 'Get',
    'POST': 'Create',
    'PUT': 'Update',
    'PATCH': 'Update',
    'DELETE': 'Delete'
  };

  const action = actionMap[method] || method;
  const resource = pathParts[pathParts.length - 1] || 'resource';
  
  return `${action} ${capitalizeFirstLetter(resource)}`;
}

function getModuleFromPath(path, basePath) {
  const parts = path.replace(basePath, '').split('/').filter(p => p);
  return parts.length > 0 ? parts[0] : null;
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractPathParams(path) {
  const params = [];
  const parts = path.split('/');
  
  parts.forEach(part => {
    if (part.startsWith(':')) {
      params.push(part.substring(1));
    }
  });
  
  return params;
}

module.exports = {
  generateOpenApiSpec
};
