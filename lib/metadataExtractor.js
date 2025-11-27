/**
 * Metadata Extractor - Extracts optional metadata from comments in route files
 */

const fs = require('fs');
const path = require('path');

/**
 * Extracts metadata from route file for a specific path
 * @param {string} routePath - Route path (e.g., /api-v1/auth/login)
 * @returns {Object} Metadata object with summary and description
 */
function getRouteMetadata(routePath) {
  const metadata = {
    summary: null,
    description: null
  };
  
  try {
    // Find route file based on path
    const routeFile = findRouteFile(routePath);
    if (!routeFile) {
      return metadata;
    }
    
    // Read file content
    const fileContent = fs.readFileSync(routeFile, 'utf8');
    
    // Extract path pattern for matching (handle :params)
    const pathPattern = routePath
      .replace(/:[^/]+/g, '[^"\']+') // Replace :id with regex pattern
      .replace(/\//g, '\\/'); // Escape slashes
    
    // Search for // @api comment before route definition
    // Format: // @api Description of the endpoint
    const commentRegex = new RegExp(
      `\\/\\/\\s*@api\\s+(.+?)\\n[\\s\\S]*?(?:router\\.(?:get|post|put|patch|delete)\\s*\\(\\s*["']${pathPattern}["'])`,
      'i'
    );
    
    const match = fileContent.match(commentRegex);
    
    if (match && match[1]) {
      const description = match[1].trim();
      metadata.summary = description;
      metadata.description = description;
    }
    
  } catch (error) {
    // If there's an error, return empty metadata
    console.warn(`Warning: Could not extract metadata for ${routePath}:`, error.message);
  }
  
  return metadata;
}

/**
 * Finds route file based on route path
 * @param {string} routePath - Route path
 * @returns {string|null} Path to route file
 */
function findRouteFile(routePath) {
  // Extract module name from path (e.g., /api-v1/auth/login -> auth)
  const pathParts = routePath.split('/').filter(p => p && !p.startsWith(':'));
  if (pathParts.length < 2) return null;
  
  let moduleName = pathParts[1];
  
  // Handle special cases
  if (moduleName === 'ware-house') moduleName = 'warehouse';
  if (moduleName === 'app') moduleName = 'system';
  
  // Construct route file path
  const routeFilePath = path.join(process.cwd(), 'routes', `${moduleName}.routes.js`);
  
  // Check if file exists
  if (fs.existsSync(routeFilePath)) {
    return routeFilePath;
  }
  
  // Try alternative naming
  const altPath = path.join(process.cwd(), 'routes', `${moduleName}.route.js`);
  if (fs.existsSync(altPath)) {
    return altPath;
  }
  
  return null;
}

/**
 * Extracts all metadata from a route file
 * @param {string} routeFile - Path to route file
 * @returns {Object} Map of route paths to metadata
 */
function extractAllMetadataFromFile(routeFile) {
  const metadataMap = {};
  
  try {
    if (!fs.existsSync(routeFile)) {
      return metadataMap;
    }
    
    const fileContent = fs.readFileSync(routeFile, 'utf8');
    
    // Regex to find all // @api comments and routes
    const pattern = /\/\/\s*@api\s+(.+?)\n[\s\S]*?router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi;
    
    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
      const description = match[1].trim();
      const method = match[2].toUpperCase();
      const path = match[3];
      
      const key = `${method}:${path}`;
      metadataMap[key] = {
        summary: description,
        description: description
      };
    }
    
  } catch (error) {
    console.warn(`Warning: Could not extract metadata from ${routeFile}:`, error.message);
  }
  
  return metadataMap;
}

module.exports = {
  getRouteMetadata,
  extractAllMetadataFromFile
};
