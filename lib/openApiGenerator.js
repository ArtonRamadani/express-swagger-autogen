/**
 * OpenAPI Generator - Generates OpenAPI 3.0 specification from Express app
 */

const { inspectRoutes, filterApiRoutes } = require('./routeInspector');
const { parseValidationRules, generateExample } = require('./validatorParser');
const { getRouteMetadata } = require('./metadataExtractor');
/**
 * Generates complete OpenAPI specification
 * @param {Express.Application} app - Express application instance
 * @returns {Object} OpenAPI 3.0 specification
 */
function generateOpenApiSpec(app) {
    // Extract all routes
    const allRoutes = inspectRoutes(app);
    const apiRoutes = filterApiRoutes(allRoutes);

    // Base OpenAPI spec structure
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'CBS Mobile API',
            version: '1.0.0',
            description: `Auto-generated API Documentation for CBSMobile Backend System`,
            contact: {
                name: 'API Support'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`,
                description: 'Development server'
            },
            {
                url: '{protocol}://{host}:{port}',
                description: 'Custom server',
                variables: {
                    protocol: {
                        enum: ['http', 'https'],
                        default: 'http'
                    },
                    host: {
                        default: 'localhost'
                    },
                    port: {
                        default: process.env.PORT || '8000'
                    }
                }
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: '🔐 JWT token from /api-v1/auth/login endpoint. Use "Authorize" button below to set the token.'
                }
            },
            schemas: {
                // Standard Error Response
                ErrorResponse: {
                    type: 'object',
                    required: ['status', 'message'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['Error'],
                            description: 'Response status',
                            example: 'Error'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Error message description'
                        },
                        reason: {
                            type: 'string',
                            description: 'Specific error reason (optional)',
                            example: 'ErrorReason'
                        }
                    }
                },
                
                // Standard Success Response
                SuccessResponse: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['Success'],
                            description: 'Response status',
                            example: 'Success'
                        },
                        data: {
                            type: 'object',
                            description: 'Returned data (varies by endpoint)',
                            additionalProperties: true
                        },
                        message: {
                            type: 'string',
                            description: 'Success message',
                            example: 'Operation completed successfully'
                        }
                    }
                },
                
                // Login Request Schema
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'User username',
                            example: 'user123'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password',
                            example: 'password123'
                        },
                        AppID: {
                            type: 'integer',
                            description: 'Application ID (optional)',
                            example: 1
                        }
                    }
                },
                
                // Login Response Schema
                LoginResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'integer',
                            description: 'Status ID (1=Success, 2=Invalid credentials, 3=Other error)',
                            example: 1
                        },
                        user: {
                            type: 'object',
                            description: 'User information',
                            properties: {
                                ID: {
                                    type: 'integer',
                                    example: 123
                                },
                                Username: {
                                    type: 'string',
                                    example: 'user123'
                                }
                            }
                        },
                        token: {
                            type: 'string',
                            description: '🔑 JWT token - copy this and use it in "Authorize" button',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                
                // Change Password Request
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['NewPassword'],
                    properties: {
                        NewPassword: {
                            type: 'string',
                            format: 'password',
                            description: 'New password',
                            example: 'newPassword123'
                        }
                    }
                },
                
                // JWT Error Responses
                JWTMissingError: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'Error'
                        },
                        reason: {
                            type: 'string',
                            example: 'JWTMissing'
                        },
                        message: {
                            type: 'string',
                            example: 'Access denied. No token provided.'
                        }
                    }
                },
                
                JWTExpiredError: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'Error'
                        },
                        reason: {
                            type: 'string',
                            example: 'JWTExpired'
                        },
                        message: {
                            type: 'string',
                            example: 'Token has expired. Please log in again.'
                        }
                    }
                },
                
                JWTInvalidError: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'Error'
                        },
                        reason: {
                            type: 'string',
                            example: 'JWTInvalid'
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid or outdated token.'
                        }
                    }
                },
                
                // Validation Error Response
                ValidationError: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'Error'
                        },
                        message: {
                            type: 'string',
                            example: 'Validation failed'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        example: 'username'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Username must be text'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [],
        paths: {}
    };

    // Generate tags from modules
    const modules = new Set();
    apiRoutes.forEach(route => {
        const module = getModuleFromPath(route.path);
        if (module) {
            modules.add(module);
        }
    });

    modules.forEach(module => {
        spec.tags.push({
            name: capitalizeFirstLetter(module),
            description: `${capitalizeFirstLetter(module)} related endpoints`
        });
    });

    // Generate paths
    apiRoutes.forEach(route => {
        generatePathItem(spec, route);
    });

    return spec;
}

/**
 * Generates path item for a route
 * @param {Object} spec - OpenAPI spec object
 * @param {Object} route - Route object from routeInspector
 */
function generatePathItem(spec, route) {
    const path = route.path;
    const method = route.method.toLowerCase();

    // Create path if it doesn't exist
    if (!spec.paths[path]) {
        spec.paths[path] = {};
    }

    // Parse validation rules (pass handler name for controller analysis)
    const schemas = parseValidationRules(route.middlewares, route.path, route.handler);

    // Detect if authentication is required
    const requiresAuth = route.middlewares.includes('verifyToken');

    // Extract metadata from comments (if any)
    const metadata = getRouteMetadata(route.path);

    // Use metadata summary if available, otherwise auto-generate
    const summary = metadata.summary || generateSummary(route);
    const description = metadata.description || '';

    // Generate tag from module
    const tag = getModuleFromPath(path);

    // Create endpoint definition
    const endpoint = {
        summary: summary,
        description: description,
        tags: tag ? [capitalizeFirstLetter(tag)] : ['Other'],
        security: requiresAuth ? [{ bearerAuth: [] }] : []
    };

    // Add parameters (path and query params)
    const parameters = generateParameters(schemas.params, schemas.query, path);
    if (parameters.length > 0) {
        endpoint.parameters = parameters;
    }

    // Add requestBody (for POST, PUT, PATCH)
    if (['post', 'put', 'patch'].includes(method)) {
        // Special handling for login endpoint
        if (route.handler === 'loginHandler') {
            endpoint.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/LoginRequest'
                        },
                        example: {
                            username: 'user123',
                            password: 'password123',
                            AppID: 1
                        }
                    }
                }
            };
        } else if (route.handler === 'changePasswordHandler') {
            endpoint.requestBody = {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ChangePasswordRequest'
                        }
                    }
                }
            };
        } else if (schemas.body && Object.keys(schemas.body.properties).length > 0) {
            endpoint.requestBody = generateRequestBody(schemas.body);
        }
    }

    // Add responses
    endpoint.responses = generateResponses(route, schemas);

    spec.paths[path][method] = endpoint;

    return endpoint;
}

/**
 * Generates summary automatically from route
 * @param {Object} route - Route object
 * @returns {string} Auto-generated summary
 */
function generateSummary(route) {
    const method = route.method.toUpperCase();
    const pathParts = route.path.split('/').filter(p => p && !p.startsWith(':'));

    // Action mapping
    const actionMap = {
        'GET': 'Get',
        'POST': 'Create/Execute',
        'PUT': 'Update',
        'PATCH': 'Modify',
        'DELETE': 'Delete'
    };

    const action = actionMap[method] || method;

    // Resource name (last non-param part)
    let resource = pathParts[pathParts.length - 1] || 'resource';
    resource = capitalizeFirstLetter(resource);

    return `${action} ${resource}`;
}

/**
 * Extracts module name from path
 * @param {string} path - Route path
 * @returns {string|null} Module name
 */
function getModuleFromPath(path) {
    const parts = path.split('/').filter(p => p);
    if (parts.length < 2) return null;

    // parts[0] është 'api-v1', parts[1] është module
    let module = parts[1];

    // Clean up module name
    if (module === 'ware-house') module = 'warehouse';

    return module;
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates parameters array for path and query params
 * @param {Object} paramsSchema - Schema for path parameters
 * @param {Object} querySchema - Schema for query parameters
 * @param {string} path - Route path
 * @returns {Array} Parameters array
 */
function generateParameters(paramsSchema, querySchema, path) {
    const parameters = [];

    // Path parameters
    if (paramsSchema && paramsSchema.properties) {
        Object.keys(paramsSchema.properties).forEach(paramName => {
            const schema = paramsSchema.properties[paramName];
            const isRequired = paramsSchema.required && paramsSchema.required.includes(paramName);

            parameters.push({
                in: 'path',
                name: paramName,
                required: isRequired !== false, // Path params are always required
                schema: {
                    type: schema.type || 'string',
                    ...(schema.format && { format: schema.format }),
                    ...(schema.minimum !== undefined && { minimum: schema.minimum }),
                    ...(schema.maximum !== undefined && { maximum: schema.maximum }),
                    ...(schema.pattern && { pattern: schema.pattern }),
                    ...(schema.enum && { enum: schema.enum })
                },
                description: schema.description || `${paramName} parameter`
            });
        });
    }

    // Query parameters
    if (querySchema && querySchema.properties) {
        Object.keys(querySchema.properties).forEach(paramName => {
            const schema = querySchema.properties[paramName];
            const isRequired = querySchema.required && querySchema.required.includes(paramName);

            parameters.push({
                in: 'query',
                name: paramName,
                required: isRequired || false,
                schema: {
                    type: schema.type || 'string',
                    ...(schema.format && { format: schema.format }),
                    ...(schema.minimum !== undefined && { minimum: schema.minimum }),
                    ...(schema.maximum !== undefined && { maximum: schema.maximum }),
                    ...(schema.pattern && { pattern: schema.pattern }),
                    ...(schema.enum && { enum: schema.enum })
                },
                description: schema.description || `${paramName} query parameter`
            });
        });
    }

    return parameters;
}

/**
 * Generates requestBody object
 * @param {Object} bodySchema - Schema for request body
 * @returns {Object} RequestBody object
 */
function generateRequestBody(bodySchema) {
    if (!bodySchema || !bodySchema.properties || Object.keys(bodySchema.properties).length === 0) {
        return undefined;
    }

    // Generate example object
    const example = {};
    Object.keys(bodySchema.properties).forEach(key => {
        example[key] = generateExample(bodySchema.properties[key]);
    });

    return {
        required: true,
        content: {
            'application/json': {
                schema: bodySchema,
                example: example
            }
        }
    };
}

/**
 * Generates responses object for endpoint
 * @param {Object} route - Route object
 * @param {Object} schemas - Parsed schemas
 * @returns {Object} Responses object
 */
function generateResponses(route, schemas) {
    const responses = {};
    const method = route.method.toUpperCase();
    const requiresAuth = route.middlewares.includes('verifyToken');
    const handler = route.handler;

    // Success response (200 or 201) - use specific schemas for known endpoints
    const successCode = method === 'POST' ? '201' : '200';
    
    // Special handling for login endpoint
    if (handler === 'loginHandler') {
        responses['200'] = {
            description: '✅ Successful login - Copy the token and use it in "Authorize" button',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/LoginResponse'
                    }
                }
            }
        };
    } else {
        // Generic success response
        responses[successCode] = {
            description: method === 'POST' ? '✅ Resource created successfully' : '✅ Operation completed successfully',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/SuccessResponse'
                    },
                    example: {
                        status: 'Success',
                        message: 'Operation completed successfully',
                        data: {}
                    }
                }
            }
        };
    }

    // Validation error (400)
    if (schemas.body || schemas.params || schemas.query) {
        responses['400'] = {
            description: '❌ Validation Error - The submitted data is invalid',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ValidationError'
                    }
                }
            }
        };
    }

    // Authentication errors (401, 403)
    if (requiresAuth) {
        responses['401'] = {
            description: '🔒 Unauthorized - Token is missing or invalid',
            content: {
                'application/json': {
                    schema: {
                        oneOf: [
                            { $ref: '#/components/schemas/JWTMissingError' },
                            { $ref: '#/components/schemas/JWTInvalidError' }
                        ]
                    },
                    examples: {
                        missing: {
                            summary: 'Token missing',
                            value: {
                                status: 'Error',
                                reason: 'JWTMissing',
                                message: 'Access denied. No token provided.'
                            }
                        },
                        invalid: {
                            summary: 'Invalid token',
                            value: {
                                status: 'Error',
                                reason: 'JWTInvalid',
                                message: 'Invalid or outdated token.'
                            }
                        }
                    }
                }
            }
        };

        responses['403'] = {
            description: '🔒 Forbidden - Token has expired',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/JWTExpiredError'
                    }
                }
            }
        };
    }

    // Not acceptable (406) - business logic error
    responses['406'] = {
        description: '⚠️ Not Acceptable - Business logic error (e.g. wrong credentials)',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                    status: 'Error',
                    message: 'Operation could not be completed'
                }
            }
        }
    };

    // Server error (500)
    responses['500'] = {
        description: '💥 Internal Server Error - Internal server error',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                    status: 'Error',
                    message: 'Internal server error occurred'
                }
            }
        }
    };

    return responses;
}

module.exports = {
    generateOpenApiSpec
};
