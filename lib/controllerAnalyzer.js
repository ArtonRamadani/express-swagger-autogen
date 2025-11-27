/**
 * Controller Analyzer - Analyzes controllers to find fields that are used
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyzes a service file to find fields that are used
 * @param {string} servicePath - Path to service file
 * @param {string} serviceName - Service function name
 * @returns {Array} Array of field names
 */
function analyzeService(servicePath, serviceName) {
  try {
    if (!fs.existsSync(servicePath)) {
      return [];
    }

    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Find service function
    const serviceRegex = new RegExp(`const\\s+${serviceName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*{([\\s\\S]*?)}\\s*;`, 'm');
    const match = content.match(serviceRegex);
    
    if (!match) {
      return [];
    }
    
    const serviceBody = match[1];
    
    // Find destructuring from payload parameter
    // Pattern: const { field1, field2, ... } = payload;
    const destructuringRegex = /const\s*{([^}]+)}\s*=\s*payload;/g;
    const fields = [];
    let destructMatch;
    
    while ((destructMatch = destructuringRegex.exec(serviceBody)) !== null) {
      const fieldsStr = destructMatch[1];
      const fieldNames = fieldsStr.split(',').map(f => {
        let fieldName = f.trim();
        
        // Remove default value assignment
        if (fieldName.includes('=')) {
          fieldName = fieldName.split('=')[0].trim();
        }
        
        // Handle renamed fields
        if (fieldName.includes(':')) {
          fieldName = fieldName.split(':')[0].trim();
        }
        
        return fieldName;
      }).filter(f => f && !f.includes('//'));
      
      fields.push(...fieldNames);
    }
    
    return [...new Set(fields)];
  } catch (error) {
    console.error(`Error analyzing service ${servicePath}:`, error.message);
    return [];
  }
}

/**
 * Analyzes a controller file to find fields that are used
 * @param {string} controllerPath - Path to controller file
 * @param {string} handlerName - Handler function name
 * @returns {Object} Object with body, query, params fields
 */
function analyzeController(controllerPath, handlerName) {
  try {
    if (!fs.existsSync(controllerPath)) {
      return { body: [], query: [], params: [] };
    }

    const content = fs.readFileSync(controllerPath, 'utf8');
    
    // Find handler function
    const handlerRegex = new RegExp(`const\\s+${handlerName}\\s*=\\s*async\\s*\\(req,\\s*res\\)\\s*=>\\s*{([\\s\\S]*?)}\\s*(?:const|module\\.exports|$)`, 'm');
    const match = content.match(handlerRegex);
    
    if (!match) {
      return { body: [], query: [], params: [] };
    }
    
    const handlerBody = match[1];
    
    // Extract fields from req.body
    let bodyFields = extractFields(handlerBody, 'req.body');
    
    // Extract fields from req.query
    const queryFields = extractFields(handlerBody, 'req.query');
    
    // Extract fields from req.params
    const paramsFields = extractFields(handlerBody, 'req.params');
    
    // If there's a __ANALYZE_SERVICE__ marker, analyze the service
    const serviceMarkers = bodyFields.filter(f => f.startsWith('__ANALYZE_SERVICE__:'));
    if (serviceMarkers.length > 0) {
      // Remove markers from body fields
      bodyFields = bodyFields.filter(f => !f.startsWith('__ANALYZE_SERVICE__:'));
      
      // Analyze service for each marker
      serviceMarkers.forEach(marker => {
        const serviceName = marker.split(':')[1];
        
        // Determine service file path
        const controllerDir = path.dirname(controllerPath);
        const servicePath = path.join(controllerDir, '..', 'services', path.basename(controllerPath).replace('controller', 'service'));
        
        const serviceFields = analyzeService(servicePath, serviceName);
        bodyFields.push(...serviceFields);
      });
    }
    
    return {
      body: [...new Set(bodyFields)],
      query: [...new Set(queryFields)],
      params: [...new Set(paramsFields)]
    };
  } catch (error) {
    console.error(`Error analyzing controller ${controllerPath}:`, error.message);
    return { body: [], query: [], params: [] };
  }
}

/**
 * Extracts field names from destructuring or direct access
 * @param {string} code - Code snippet
 * @param {string} source - Source object (e.g., 'req.body', 'req.query')
 * @returns {Array} Array of field names
 */
function extractFields(code, source) {
  const fields = [];
  
  // Pattern 1: Destructuring - const { field1, field2 } = req.body
  const destructuringRegex = new RegExp(`const\\s*{([^}]+)}\\s*=\\s*${source.replace('.', '\\.')}`, 'g');
  let match;
  
  while ((match = destructuringRegex.exec(code)) !== null) {
    const fieldsStr = match[1];
    // Split by comma and clean up
    const fieldNames = fieldsStr.split(',').map(f => {
      // Handle renamed fields: { oldName: newName }
      // Handle default values: { field = defaultValue }
      let fieldName = f.trim();
      
      // Remove default value assignment
      if (fieldName.includes('=')) {
        fieldName = fieldName.split('=')[0].trim();
      }
      
      // Handle renamed fields
      if (fieldName.includes(':')) {
        fieldName = fieldName.split(':')[0].trim();
      }
      
      return fieldName;
    }).filter(f => f && !f.includes('//') && !f.includes('/*'));
    
    fields.push(...fieldNames);
  }
  
  // Pattern 2: Direct access - req.body.fieldName
  const directAccessRegex = new RegExp(`${source.replace('.', '\\.')}\\.([a-zA-Z_$][a-zA-Z0-9_$]*)`, 'g');
  
  while ((match = directAccessRegex.exec(code)) !== null) {
    fields.push(match[1]);
  }
  
  // Pattern 3: If it gets the entire payload and passes it to service, analyze the service
  const payloadRegex = new RegExp(`const\\s+(\\w+)\\s*=\\s*${source.replace('.', '\\.')};`, 'g');
  while ((match = payloadRegex.exec(code)) !== null) {
    const payloadVar = match[1];
    // Find service call that uses this payload
    const serviceCallRegex = new RegExp(`await\\s+(\\w+Service)\\(${payloadVar}`, 'g');
    const serviceMatch = serviceCallRegex.exec(code);
    
    if (serviceMatch) {
      // Mark that we need to analyze the service
      fields.push('__ANALYZE_SERVICE__:' + serviceMatch[1]);
    }
  }
  
  return fields;
}

/**
 * Gets controller path from handler name
 * @param {string} handlerName - Handler function name
 * @param {string} routePath - Route path to find controller
 * @returns {string|null} Controller file path
 */
function getControllerPath(handlerName, routePath) {
  // Determine controller file based on route path
  const pathParts = routePath.split('/').filter(p => p && p !== 'api-v1');
  
  if (pathParts.length === 0) return null;
  
  const module = pathParts[0];
  
  // Map module names to controller files
  const controllerMap = {
    'auth': 'controllers/auth.controller.js',
    'customers': 'controllers/customers.controller.js',
    'order': 'controllers/order.controller.js',
    'app': 'controllers/system.controller.js',
    'ware-house': 'controllers/warehouse.controller.js',
    'inventory': 'controllers/inventory.controller.js'
  };
  
  return controllerMap[module] || null;
}

module.exports = {
  analyzeController,
  getControllerPath,
  extractFields
};
