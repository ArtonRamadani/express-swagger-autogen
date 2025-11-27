/**
 * Middleware Analyzer - Detects middleware behavior by analyzing code
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyzes middleware to detect its purpose
 * @param {string} middlewareName - Middleware function name
 * @param {string} routePath - Route path for context
 * @returns {Object} Middleware metadata
 */
function analyzeMiddleware(middlewareName, routePath) {
  const metadata = {
    name: middlewareName,
    isAuth: false,
    isValidation: false,
    isErrorHandler: false,
    description: ''
  };

  // Skip common Express middleware
  if (['query', 'expressInit', 'corsMiddleware', 'jsonParser', 'urlencodedParser'].includes(middlewareName)) {
    return metadata;
  }

  // Pattern matching for common middleware names
  if (isAuthMiddleware(middlewareName)) {
    metadata.isAuth = true;
    metadata.description = 'Authentication middleware';
    return metadata;
  }

  if (isValidationMiddleware(middlewareName)) {
    metadata.isValidation = true;
    metadata.description = 'Validation middleware';
    return metadata;
  }

  // Try to find and analyze the actual middleware file
  const middlewareFile = findMiddlewareFile(middlewareName);
  if (middlewareFile) {
    const behavior = analyzeMiddlewareCode(middlewareFile, middlewareName);
    Object.assign(metadata, behavior);
  }

  return metadata;
}

/**
 * Checks if middleware name suggests authentication
 * @param {string} name - Middleware name
 * @returns {boolean}
 */
function isAuthMiddleware(name) {
  const authPatterns = [
    /auth/i,
    /token/i,
    /jwt/i,
    /verify/i,
    /authenticate/i,
    /protected/i,
    /secure/i,
    /guard/i
  ];

  return authPatterns.some(pattern => pattern.test(name));
}

/**
 * Checks if middleware name suggests validation
 * @param {string} name - Middleware name
 * @returns {boolean}
 */
function isValidationMiddleware(name) {
  const validationPatterns = [
    /validat/i,
    /check/i,
    /sanitiz/i,
    /rules/i
  ];

  return validationPatterns.some(pattern => pattern.test(name));
}

/**
 * Finds middleware file in common locations
 * @param {string} middlewareName - Middleware function name
 * @returns {string|null} Path to middleware file
 */
function findMiddlewareFile(middlewareName) {
  const possiblePaths = [
    `middleware/${middlewareName}.js`,
    `middlewares/${middlewareName}.js`,
    `middleware/${middlewareName}.middleware.js`,
    `middlewares/${middlewareName}.middleware.js`,
    `src/middleware/${middlewareName}.js`,
    `src/middlewares/${middlewareName}.js`
  ];

  for (const relativePath of possiblePaths) {
    const fullPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Analyzes middleware code to detect behavior
 * @param {string} filePath - Path to middleware file
 * @param {string} middlewareName - Middleware function name
 * @returns {Object} Detected behavior
 */
function analyzeMiddlewareCode(filePath, middlewareName) {
  const behavior = {
    isAuth: false,
    isValidation: false,
    isErrorHandler: false,
    description: ''
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Detect authentication middleware
    const authIndicators = [
      /jwt\.verify/i,
      /token/i,
      /authorization/i,
      /bearer/i,
      /req\.headers\.authorization/i,
      /authenticate/i,
      /401/,
      /403/,
      /unauthorized/i
    ];

    const authMatches = authIndicators.filter(pattern => pattern.test(content)).length;
    if (authMatches >= 2) {
      behavior.isAuth = true;
      behavior.description = 'JWT authentication middleware';
    }

    // Detect validation middleware
    const validationIndicators = [
      /express-validator/i,
      /validationResult/i,
      /check\(/,
      /body\(/,
      /param\(/,
      /query\(/,
      /400/,
      /validation/i
    ];

    const validationMatches = validationIndicators.filter(pattern => pattern.test(content)).length;
    if (validationMatches >= 2) {
      behavior.isValidation = true;
      behavior.description = 'Request validation middleware';
    }

    // Detect error handler
    if (/\(err,\s*req,\s*res,\s*next\)/.test(content)) {
      behavior.isErrorHandler = true;
      behavior.description = 'Error handling middleware';
    }

  } catch (error) {
    // Silently fail - return default behavior
  }

  return behavior;
}

/**
 * Detects if route requires authentication based on middleware chain
 * @param {Array} middlewares - Array of middleware names
 * @param {string} routePath - Route path
 * @returns {boolean}
 */
function requiresAuthentication(middlewares, routePath) {
  return middlewares.some(middleware => {
    const metadata = analyzeMiddleware(middleware, routePath);
    return metadata.isAuth;
  });
}

module.exports = {
  analyzeMiddleware,
  requiresAuthentication,
  isAuthMiddleware,
  isValidationMiddleware
};
