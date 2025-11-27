/**
 * Manual Schema Definitions
 * 
 * Define manual schemas for complex endpoints where the controller analyzer 
 * cannot detect the exact structure automatically.
 * 
 * Manual schemas are especially useful for:
 * - Arrays of objects
 * - Nested objects
 * - Complex validation logic
 * 
 * Usage: Add your handler name as a key with body/query/params schemas
 */

const manualSchemas = {
  // Example: Uncomment and modify for your endpoints
  // 'yourHandlerName': {
  //   body: {
  //     type: 'object',
  //     required: ['field1', 'field2'],
  //     properties: {
  //       field1: {
  //         type: 'string',
  //         description: 'Description of field1',
  //         example: 'example value'
  //       },
  //       field2: {
  //         type: 'integer',
  //         description: 'Description of field2',
  //         example: 123
  //       }
  //     }
  //   }
  // }
};

/**
 * Get manual schema for a handler
 * @param {string} handlerName - Handler function name
 * @returns {Object|null} Manual schema or null
 */
function getManualSchema(handlerName) {
  return manualSchemas[handlerName] || null;
}

module.exports = {
  getManualSchema,
  manualSchemas
};
