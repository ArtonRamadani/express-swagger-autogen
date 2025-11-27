/**
 * Validator Parser - Parses express-validator rules and converts to OpenAPI schemas
 */

const fs = require('fs');
const path = require('path');
const { analyzeController, getControllerPath } = require('./controllerAnalyzer');
const { getManualSchema } = require('./manualSchemas');

/**
 * Parses validation rules from middleware chain
 * @param {Array} middlewares - Array of middleware names
 * @param {string} routePath - Route path for context
 * @param {string} handlerName - Handler function name
 * @returns {Object} Schemas for body, params, query
 */
function parseValidationRules(middlewares, routePath, handlerName) {
  const schemas = {
    body: { type: 'object', properties: {}, required: [] },
    params: { type: 'object', properties: {}, required: [] },
    query: { type: 'object', properties: {}, required: [] }
  };
  
  // STEP 1: Check for manual schemas (high priority for complex endpoints)
  const manualSchema = handlerName ? getManualSchema(handlerName) : null;
  if (manualSchema) {
    // Use manual schema definitions
    ['body', 'query', 'params'].forEach(location => {
      if (manualSchema[location]) {
        // If manual schema has 'type' and 'properties', use the entire schema
        if (manualSchema[location].type && manualSchema[location].properties) {
          schemas[location] = manualSchema[location];
        } else {
          // If it's an object with fields, merge properties
          Object.keys(manualSchema[location]).forEach(field => {
            schemas[location].properties[field] = manualSchema[location][field];
          });
        }
      }
    });
  } else if (handlerName) {
    // STEP 2: If no manual schema, analyze controller to find fields
    const controllerPath = getControllerPath(handlerName, routePath);
    
    if (controllerPath) {
      const fullControllerPath = path.join(process.cwd(), controllerPath);
      const controllerFields = analyzeController(fullControllerPath, handlerName);
      
      // Merge controller fields with schemas
      ['body', 'query', 'params'].forEach(location => {
        if (controllerFields[location] && controllerFields[location].length > 0) {
          controllerFields[location].forEach(field => {
            schemas[location].properties[field] = {
              type: 'string', // default type
              description: 'Field used in controller'
            };
          });
        }
      });
    }
  }
  
  // STEP 3: Parse validators (can override controller fields with more details)
  // Find validation middleware (usually ends with 'ValidationRules' or 'validate')
  const validationMiddleware = middlewares.find(m => 
    m.includes('Validation') || 
    m.includes('validate') ||
    m.includes('Rules')
  );
  
  if (!validationMiddleware) {
    // Even if no validators, return schemas with controller fields
    // Fallback: Detect path parameters from route path
    const pathParams = extractPathParams(routePath);
    if (pathParams.length > 0) {
      pathParams.forEach(param => {
        if (!schemas.params.properties[param]) {
          schemas.params.properties[param] = {
            type: 'string',
            description: `${param} parameter from URL path`
          };
          schemas.params.required.push(param);
        }
      });
    }
    return schemas;
  }
  
  // Find validator file based on route path
  const validatorFile = findValidatorFile(routePath);
  if (!validatorFile) {
    return schemas;
  }
  
  try {
    // Load validator module
    const validatorModule = require(validatorFile);
    
    // Find validation function or array
    const validationFnOrArray = validatorModule[validationMiddleware];
    if (!validationFnOrArray) {
      return schemas;
    }
    
    // Execute validation function to get rules, or use array directly
    let rules;
    if (typeof validationFnOrArray === 'function') {
      rules = validationFnOrArray();
    } else if (Array.isArray(validationFnOrArray)) {
      rules = validationFnOrArray;
    } else {
      return schemas;
    }
    
    if (!Array.isArray(rules)) {
      return schemas;
    }
    
    // Parse each rule
    rules.forEach(rule => {
      if (!rule.builder) return;
      
      const field = rule.builder.fields[0];
      const location = rule.builder.locations[0]; // 'body', 'params', 'query'
      
      if (!field || !location || !schemas[location]) return;
      
      // Create schema for field
      const fieldSchema = parseFieldValidators(rule.builder);
      
      // Add to appropriate location
      schemas[location].properties[field] = fieldSchema;
      
      // Check if required
      if (fieldSchema.required) {
        schemas[location].required.push(field);
        delete fieldSchema.required; // Remove from property level
      }
    });
    
    // Clean empty required arrays
    Object.keys(schemas).forEach(location => {
      if (schemas[location].required.length === 0) {
        delete schemas[location].required;
      }
    });
    
  } catch (error) {
    // If there's an error in parsing, return empty schemas
    console.warn(`Warning: Could not parse validators for ${routePath}:`, error.message);
  }
  
  // Fallback: Detect path parameters from route path (e.g., /:id, /:userId)
  if (!schemas.params || Object.keys(schemas.params.properties).length === 0) {
    const pathParams = extractPathParams(routePath);
    if (pathParams.length > 0) {
      schemas.params = { type: 'object', properties: {}, required: [] };
      pathParams.forEach(param => {
        schemas.params.properties[param] = {
          type: 'string',
          description: `${param} parameter from URL path`
        };
        schemas.params.required.push(param);
      });
    }
  }
  
  // ENHANCEMENT: Analyze controller to find additional fields
  if (handlerName) {
    const controllerPath = getControllerPath(handlerName, routePath);
    
    if (controllerPath) {
      const fullControllerPath = path.join(process.cwd(), controllerPath);
      const controllerFields = analyzeController(fullControllerPath, handlerName);
      
      // Merge controller fields with validator fields
      ['body', 'query', 'params'].forEach(location => {
        if (controllerFields[location] && controllerFields[location].length > 0) {
          if (!schemas[location]) {
            schemas[location] = { type: 'object', properties: {}, required: [] };
          }
          
          controllerFields[location].forEach(field => {
            // Add only if doesn't exist from validators
            if (!schemas[location].properties[field]) {
              schemas[location].properties[field] = {
                type: 'string', // default type
                description: 'Field used in controller (not validated)'
              };
              // Don't make required since it's not in validator
            }
          });
        }
      });
    }
  }
  
  return schemas;
}

/**
 * Parses validators for a field and creates OpenAPI schema
 * @param {Object} builder - express-validator builder object
 * @returns {Object} OpenAPI schema object
 */
function parseFieldValidators(builder) {
  const schema = {
    type: 'string', // default
    description: ''
  };
  
  let isRequired = false;
  let isOptional = false;
  
  if (!builder.validators || !Array.isArray(builder.validators)) {
    return schema;
  }
  
  // Iterate through validators
  builder.validators.forEach(validator => {
    const validatorName = validator.validator;
    const options = validator.options || [];
    
    // Type inference
    if (validatorName === 'isString') {
      schema.type = 'string';
    } else if (validatorName === 'isInt') {
      schema.type = 'integer';
      // Handle constraints from options
      if (options[0]) {
        if (options[0].min !== undefined) schema.minimum = options[0].min;
        if (options[0].max !== undefined) schema.maximum = options[0].max;
        if (options[0].gt !== undefined) schema.minimum = options[0].gt + 1;
        if (options[0].lt !== undefined) schema.maximum = options[0].lt - 1;
      }
    } else if (validatorName === 'isFloat' || validatorName === 'isDecimal') {
      schema.type = 'number';
      schema.format = 'float';
      if (options[0]) {
        if (options[0].min !== undefined) schema.minimum = options[0].min;
        if (options[0].max !== undefined) schema.maximum = options[0].max;
        if (options[0].gt !== undefined) schema.minimum = options[0].gt;
        if (options[0].lt !== undefined) schema.maximum = options[0].lt;
      }
    } else if (validatorName === 'isBoolean') {
      schema.type = 'boolean';
    } else if (validatorName === 'isArray') {
      schema.type = 'array';
      schema.items = { type: 'object' }; // default
      if (options[0]) {
        if (options[0].min !== undefined) schema.minItems = options[0].min;
        if (options[0].max !== undefined) schema.maxItems = options[0].max;
      }
    } else if (validatorName === 'isEmail') {
      schema.type = 'string';
      schema.format = 'email';
    } else if (validatorName === 'isURL') {
      schema.type = 'string';
      schema.format = 'uri';
    } else if (validatorName === 'isDate') {
      schema.type = 'string';
      schema.format = 'date';
    } else if (validatorName === 'isISO8601') {
      schema.type = 'string';
      schema.format = 'date-time';
    } else if (validatorName === 'isUUID') {
      schema.type = 'string';
      schema.format = 'uuid';
    }
    
    // Length constraints
    if (validatorName === 'isLength') {
      if (options[0]) {
        if (options[0].min !== undefined) schema.minLength = options[0].min;
        if (options[0].max !== undefined) schema.maxLength = options[0].max;
      }
    }
    
    // Pattern
    if (validatorName === 'matches') {
      if (options[0]) {
        schema.pattern = options[0].toString().replace(/^\/|\/$/g, '');
      }
    }
    
    // Enum values
    if (validatorName === 'isIn') {
      if (options[0] && Array.isArray(options[0])) {
        schema.enum = options[0];
      }
    }
    
    // Required/Optional
    if (validatorName === 'exists' || validatorName === 'notEmpty') {
      isRequired = true;
    }
    if (validatorName === 'optional') {
      isOptional = true;
    }
    
    // Description from withMessage
    if (validator.message) {
      if (schema.description) {
        schema.description += '; ' + validator.message;
      } else {
        schema.description = validator.message;
      }
    }
  });
  
  // Set required flag (will be used at parent level)
  if (isRequired && !isOptional) {
    schema.required = true;
  }
  
  // Clean empty description
  if (!schema.description) {
    delete schema.description;
  }
  
  return schema;
}

/**
 * Extracts path parameters from route path
 * @param {string} routePath - Route path (e.g., /api-v1/customers/:id)
 * @returns {Array} Array of parameter names
 */
function extractPathParams(routePath) {
  const params = [];
  const parts = routePath.split('/');
  
  parts.forEach(part => {
    if (part.startsWith(':')) {
      params.push(part.substring(1)); // Remove ':' prefix
    }
  });
  
  return params;
}

/**
 * Finds validator file based on route path
 * @param {string} routePath - Route path
 * @returns {string|null} Path to validator file
 */
function findValidatorFile(routePath) {
  // Extract module name from path (e.g., /api-v1/auth/login -> auth)
  const pathParts = routePath.split('/').filter(p => p);
  if (pathParts.length < 2) return null;
  
  let moduleName = pathParts[1];
  
  // Handle special cases
  if (moduleName === 'ware-house') moduleName = 'warehouse';
  if (moduleName === 'app') moduleName = 'app';
  
  // Construct validator file path
  const validatorPath = path.join(process.cwd(), 'validators', `${moduleName}.validator.js`);
  
  // Check if file exists
  if (fs.existsSync(validatorPath)) {
    return validatorPath;
  }
  
  // Try alternative naming
  const altPath = path.join(process.cwd(), 'validators', `${moduleName}.validators.js`);
  if (fs.existsSync(altPath)) {
    return altPath;
  }
  
  // Try singular form
  const singularPath = path.join(process.cwd(), 'validators', `${moduleName.replace(/s$/, '')}.validator.js`);
  if (fs.existsSync(singularPath)) {
    return singularPath;
  }
  
  return null;
}

/**
 * Generates example value based on schema
 * @param {Object} schema - OpenAPI schema
 * @returns {*} Example value
 */
function generateExample(schema) {
  if (!schema || !schema.type) return undefined;
  
  // If example is defined, use it
  if (schema.example !== undefined) return schema.example;
  
  switch (schema.type) {
    case 'string':
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date') return '2024-01-01';
      if (schema.format === 'date-time') return '2024-01-01T00:00:00Z';
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.enum) return schema.enum[0];
      return 'string';
    case 'integer':
      if (schema.minimum !== undefined) return schema.minimum;
      return 1;
    case 'number':
      if (schema.minimum !== undefined) return schema.minimum;
      return 1.0;
    case 'boolean':
      return true;
    case 'array':
      // If has items schema, generate an example array with one element
      if (schema.items) {
        const itemExample = generateExample(schema.items);
        return itemExample ? [itemExample] : [];
      }
      return [];
    case 'object':
      // If has properties, generate an example object
      if (schema.properties) {
        const obj = {};
        Object.keys(schema.properties).forEach(key => {
          obj[key] = generateExample(schema.properties[key]);
        });
        return obj;
      }
      return {};
    default:
      return undefined;
  }
}

module.exports = {
  parseValidationRules,
  parseFieldValidators,
  generateExample
};
