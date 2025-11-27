/**
 * Manual Schema Definitions
 * 
 * Define complex request/response schemas that can't be auto-detected.
 * Each key should match the handler function name from your controllers.
 * 
 * Use this for:
 * - Arrays of objects
 * - Nested objects
 * - Complex validation rules
 * - Custom types
 */

module.exports = {
  /**
   * Login endpoint schema
   * Handler: loginHandler (auth.controller.js)
   */
  loginHandler: {
    body: {
      username: {
        type: 'string',
        description: 'Username for authentication',
        example: 'demo',
        minLength: 3,
        maxLength: 50
      },
      password: {
        type: 'string',
        format: 'password',
        description: 'User password',
        example: 'password123',
        minLength: 6
      }
    }
  },

  /**
   * Create user endpoint schema
   * Handler: createUserHandler (users.controller.js)
   */
  createUserHandler: {
    body: {
      username: {
        type: 'string',
        description: 'Unique username',
        example: 'newuser',
        minLength: 3,
        maxLength: 50
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'User email address',
        example: 'newuser@example.com'
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        description: 'User role',
        example: 'user',
        default: 'user'
      }
    }
  },

  /**
   * Update user endpoint schema
   * Handler: updateUserHandler (users.controller.js)
   */
  updateUserHandler: {
    body: {
      username: {
        type: 'string',
        description: 'Updated username',
        example: 'updateduser',
        minLength: 3,
        maxLength: 50
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Updated email',
        example: 'updated@example.com'
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        description: 'Updated role',
        example: 'user'
      }
    }
  },

  /**
   * Example: Complex nested schema
   * Uncomment and adapt for your needs
   */
  /*
  createOrderHandler: {
    body: {
      customerId: {
        type: 'integer',
        description: 'Customer ID',
        example: 123
      },
      items: {
        type: 'array',
        description: 'Order items',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'integer',
              description: 'Product ID',
              example: 456
            },
            quantity: {
              type: 'integer',
              description: 'Quantity',
              minimum: 1,
              example: 2
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Unit price',
              example: 29.99
            }
          }
        },
        example: [
          { productId: 456, quantity: 2, price: 29.99 },
          { productId: 789, quantity: 1, price: 49.99 }
        ]
      },
      shipping: {
        type: 'object',
        required: ['address', 'city', 'zipCode'],
        properties: {
          address: {
            type: 'string',
            example: '123 Main St'
          },
          city: {
            type: 'string',
            example: 'New York'
          },
          zipCode: {
            type: 'string',
            pattern: '^[0-9]{5}$',
            example: '10001'
          },
          country: {
            type: 'string',
            default: 'USA',
            example: 'USA'
          }
        }
      },
      notes: {
        type: 'string',
        description: 'Order notes',
        maxLength: 500,
        example: 'Please deliver before 5 PM'
      }
    }
  }
  */
};
