/**
 * Route Inspector - Scans Express app and extracts all routes
 */

/**
 * Extracts all routes from Express app
 * @param {Express.Application} app - Express application instance
 * @returns {Array} Array of route objects
 */
function inspectRoutes(app) {
  const routes = [];
  
  /**
   * Recursive function to extract routes from stack
   * @param {Array} stack - Express middleware stack
   * @param {string} basePath - Base path for nested routers
   * @param {number} depth - Recursion depth for debugging
   */
  function extractRoutes(stack, basePath = '', depth = 0) {
    if (!stack) return;

    stack.forEach((layer, index) => {
      if (layer.route) {
        // Direct route - has a route object
        const path = basePath + layer.route.path;
        const methods = Object.keys(layer.route.methods);
        
        methods.forEach(method => {
          // Extract middleware names from route stack
          const middlewares = layer.route.stack.map(l => {
            // If it's an anonymous function, use 'anonymous'
            return l.name || 'anonymous';
          });
          
          // Handler is the last middleware in stack
          const handler = middlewares[middlewares.length - 1];
          
          routes.push({
            method: method.toUpperCase(),
            path: path,
            middlewares: middlewares,
            handler: handler,
            fullPath: path // Store full path për reference
          });
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Nested router - need to extract base path
        let routerPath = '';
        
        // Express 5 uses matchers instead of regexp
        // Try to extract path from matcher function or use a workaround
        if (layer.path && layer.path !== 'undefined') {
          routerPath = layer.path;
        } else if (layer.matchers && layer.matchers.length > 0) {
          // Express 5: Try to extract path by testing the matcher
          // Test common paths to find which one matches
          const testPaths = ['/api-v1', '/customers', '/auth', '/order', '/app', '/ware-house', '/inventory'];
          for (const testPath of testPaths) {
            try {
              const result = layer.matchers[0](testPath);
              if (result && result.path) {
                routerPath = result.path;
                break;
              }
            } catch (e) {
              // Ignore errors
            }
          }
        } else if (layer.regexp) {
          // Parse regexp to find path
          const regexpSource = layer.regexp.source;
          
          // Extract path from regexp
          routerPath = regexpSource
            .replace(/^\^/, '') // Remove ^
            .replace(/\\\//g, '/') // Replace \/ with /
            .replace(/\/\?/g, '') // Remove /?
            .replace(/\(\?\=/g, '') // Remove (?=
            .replace(/\(\?\:/g, '') // Remove (?:
            .replace(/\|/g, '') // Remove |
            .replace(/\$/g, '') // Remove $
            .replace(/\)/g, '') // Remove )
            .replace(/\[.*?\]/g, '') // Remove character classes
            .trim();
          
          // Clean up any remaining regex artifacts
          if (routerPath && !routerPath.startsWith('/')) {
            routerPath = '/' + routerPath;
          }
        } else if (layer.handle && layer.handle.path) {
          routerPath = layer.handle.path;
        }
        
        // Normalize path - avoid double slashes
        let normalizedPath = basePath + routerPath;
        normalizedPath = normalizedPath.replace(/\/\//g, '/'); // Remove double slashes
        
        // Recursive call for nested router
        extractRoutes(layer.handle.stack, normalizedPath);
      } else if (layer.name === 'bound dispatch' && layer.route) {
        // Alternative route format
        const path = basePath + layer.route.path;
        const methods = Object.keys(layer.route.methods);
        
        methods.forEach(method => {
          const middlewares = layer.route.stack.map(l => l.name || 'anonymous');
          const handler = middlewares[middlewares.length - 1];
          
          routes.push({
            method: method.toUpperCase(),
            path: path,
            middlewares: middlewares,
            handler: handler,
            fullPath: path
          });
        });
      }
    });
  }
  
  // Start extraction from main router stack
  // Express 5 uses app.router instead of app._router
  const router = app.router || app._router;
  
  if (router && router.stack) {
    extractRoutes(router.stack);
  } else if (app.stack) {
    // Fallback for older Express versions
    extractRoutes(app.stack);
  }
  
  return routes;
}

/**
 * Groups routes by module/tag
 * @param {Array} routes - Array of route objects
 * @returns {Object} Routes grouped by module
 */
function groupRoutesByModule(routes) {
  const grouped = {};
  
  routes.forEach(route => {
    // Extract module name from path (e.g., /api-v1/auth/login -> auth)
    const pathParts = route.path.split('/').filter(p => p);
    const module = pathParts.length > 1 ? pathParts[1] : 'default';
    
    if (!grouped[module]) {
      grouped[module] = [];
    }
    
    grouped[module].push(route);
  });
  
  return grouped;
}

/**
 * Filters routes to remove internal/system routes
 * @param {Array} routes - Array of route objects
 * @returns {Array} Filtered routes
 */
function filterApiRoutes(routes) {
  return routes
    .filter(route => {
      // Remove Swagger and internal routes
      if (route.path.includes('/api-docs')) return false;
      if (route.path === '/servertest') return false;
      
      // Keep only API routes that start with /api-v1
      if (!route.path.startsWith('/api-v1')) return false;
      
      return true;
    });
}

module.exports = {
  inspectRoutes,
  groupRoutesByModule,
  filterApiRoutes
};
