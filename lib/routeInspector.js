/**
 * Route Inspector - Scans Express app and extracts all routes
 */

/**
 * Extract all routes from Express app
 * @param {Express.Application} app - Express application instance
 * @param {string} basePath - Base path to filter routes (e.g., '/api-v1')
 * @returns {Array} Array of route objects
 */
function inspectRoutes(app, basePath = '') {
  const routes = [];
  
  function extractRoutes(stack, currentPath = '') {
    if (!stack) return;

    stack.forEach((layer) => {
      if (layer.route) {
        // Direct route
        const path = currentPath + layer.route.path;
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
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Nested router
        let routerPath = '';
        
        // Express 5+ uses matchers, older versions use regexp
        if (layer.path && layer.path !== 'undefined') {
          routerPath = layer.path;
        } else if (layer.matchers && layer.matchers.length > 0) {
          // Try to extract path by testing common patterns
          const testPaths = [basePath, '/auth', '/users', '/api', '/v1'];
          for (const testPath of testPaths) {
            try {
              const result = layer.matchers[0](testPath);
              if (result && result.path) {
                routerPath = result.path;
                break;
              }
            } catch (e) {
              // Ignore
            }
          }
        } else if (layer.regexp) {
          // Parse regexp to extract path
          const regexpSource = layer.regexp.source;
          routerPath = regexpSource
            .replace(/^\^/, '')
            .replace(/\\\//g, '/')
            .replace(/\/\?/g, '')
            .replace(/\(\?\=/g, '')
            .replace(/\(\?\:/g, '')
            .replace(/\|/g, '')
            .replace(/\$/g, '')
            .replace(/\)/g, '')
            .replace(/\[.*?\]/g, '')
            .trim();
          
          if (routerPath && !routerPath.startsWith('/')) {
            routerPath = '/' + routerPath;
          }
        }
        
        extractRoutes(layer.handle.stack, currentPath + routerPath);
      }
    });
  }
  
  // Start extraction from main router stack
  // Express 5 uses app.router, Express 4 uses app._router
  // Check for _router first to avoid deprecated app.router error in Express 4
  let router = null;
  
  if (app._router) {
    router = app._router;
  } else if (app.stack) {
    // Express 5 or some configurations use app.stack directly
    extractRoutes(app.stack);
    return routes;
  } else {
    // Try app.router as last resort (Express 5)
    try {
      if (app.router && app.router.stack) {
        router = app.router;
      }
    } catch (e) {
      // app.router is deprecated in Express 4, ignore error
    }
  }
  
  if (router && router.stack) {
    extractRoutes(router.stack);
  }
  
  // Filter routes by basePath if provided
  if (basePath) {
    return routes.filter(route => route.path.startsWith(basePath));
  }
  
  return routes;
}

module.exports = {
  inspectRoutes
};
