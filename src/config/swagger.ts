import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT || 3000;

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IPD Inventory API',
            version: '1.0.0',
            description: 'API de inventario para productos, almacenes, stock, movimientos e importacion desde Excel.'
        },
        servers: [
            {
                url: `http://localhost:${port}/ipd-api`,
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Autenticacion y usuarios' },
            { name: 'Productos', description: 'Gestion de productos e importacion Excel' },
            { name: 'Almacenes', description: 'Gestion de almacenes' },
            { name: 'Stock', description: 'Consultas y movimientos de inventario' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                ApiError: {
                    type: 'object',
                    properties: {
                        status: { type: 'integer', example: 400 },
                        message: { type: 'string', example: 'El codigo del producto es obligatorio' },
                        details: {
                            nullable: true,
                            oneOf: [
                                { type: 'array', items: { type: 'object' } },
                                { type: 'object' },
                                { type: 'string' }
                            ]
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['correo', 'password'],
                    properties: {
                        correo: { type: 'string', format: 'email', example: 'admin@ipd.com' },
                        password: { type: 'string', example: '123456' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                },
                UserCreateRequest: {
                    type: 'object',
                    required: ['ruc', 'correo', 'password'],
                    properties: {
                        ruc: { type: 'string', example: '20123456789' },
                        correo: { type: 'string', format: 'email', example: 'usuario@ipd.com' },
                        password: { type: 'string', minLength: 6, example: '123456' },
                        estado: { type: 'string', enum: ['A', 'I'], example: 'A' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        ruc: { type: 'string', example: '20123456789' },
                        codigo: { type: 'string', example: 'P001' },
                        codigo_alterno: { type: 'string', nullable: true, example: 'ALT-001' },
                        descripcion: { type: 'string', example: 'Filtro hidraulico' },
                        categoria: { type: 'string', nullable: true, example: 'Filtros' },
                        peso: { type: 'number', nullable: true, example: 1.5 },
                        ubicacion: { type: 'string', nullable: true, example: 'Rack A-01' },
                        precio_unitario: { type: 'number', nullable: true, example: 120.5 },
                        precio_venta: { type: 'number', nullable: true, example: 150 },
                        imagen: {
                            type: 'string',
                            nullable: true,
                            example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
                        },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                ProductCreateRequest: {
                    type: 'object',
                    required: ['ruc', 'codigo', 'descripcion'],
                    properties: {
                        ruc: { type: 'string', example: '20123456789' },
                        codigo: { type: 'string', example: 'P001' },
                        codigo_alterno: { type: 'string', nullable: true, example: 'ALT-001' },
                        descripcion: { type: 'string', example: 'Filtro hidraulico' },
                        categoria: { type: 'string', nullable: true, example: 'Filtros' },
                        peso: { type: 'number', nullable: true, example: 1.5 },
                        ubicacion: { type: 'string', nullable: true, example: 'Rack A-01' },
                        precio_unitario: { type: 'number', nullable: true, example: 120.5 },
                        precio_venta: { type: 'number', nullable: true, example: 150 },
                        imagen: { type: 'string', nullable: true, example: 'data:image/jpeg;base64,...' },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                ProductUpdateRequest: {
                    type: 'object',
                    properties: {
                        ruc: { type: 'string', example: '20123456789' },
                        codigo: { type: 'string', example: 'P001' },
                        codigo_alterno: { type: 'string', nullable: true, example: 'ALT-001' },
                        descripcion: { type: 'string', example: 'Filtro hidraulico actualizado' },
                        categoria: { type: 'string', nullable: true, example: 'Filtros' },
                        peso: { type: 'number', nullable: true, example: 1.6 },
                        ubicacion: { type: 'string', nullable: true, example: 'Rack A-02' },
                        precio_unitario: { type: 'number', nullable: true, example: 125 },
                        precio_venta: { type: 'number', nullable: true, example: 155 },
                        imagen: { type: 'string', nullable: true, example: 'data:image/jpeg;base64,...' },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                Warehouse: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        ruc: { type: 'string', example: '20123456789' },
                        codigo: { type: 'string', example: 'ALM-01' },
                        nombre: { type: 'string', example: 'Almacen principal' },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                WarehouseCreateRequest: {
                    type: 'object',
                    required: ['ruc', 'codigo', 'nombre'],
                    properties: {
                        ruc: { type: 'string', example: '20123456789' },
                        codigo: { type: 'string', example: 'ALM-01' },
                        nombre: { type: 'string', example: 'Almacen principal' },
                        estado: { type: 'string', example: 'activo' }
                    }
                },
                StockProduct: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        producto_id: { type: 'integer', example: 1 },
                        almacen_id: { type: 'integer', example: 1 },
                        cantidad: { type: 'number', example: 25 }
                    }
                },
                StockOperationRequest: {
                    type: 'object',
                    required: ['producto_id', 'almacen_id', 'cantidad'],
                    properties: {
                        producto_id: { type: 'integer', example: 1 },
                        almacen_id: { type: 'integer', example: 1 },
                        cantidad: { type: 'number', example: 10 },
                        observacion: { type: 'string', nullable: true, example: 'Compra inicial' }
                    }
                },
                ImportProductsResponse: {
                    type: 'object',
                    properties: {
                        totalRows: { type: 'integer', example: 100 },
                        processedRows: { type: 'integer', example: 98 },
                        failedRows: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    row: { type: 'integer', example: 12 },
                                    reason: { type: 'string', example: 'El codigo del producto es obligatorio' }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token no enviado o invalido',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ApiError' },
                            example: {
                                status: 401,
                                message: 'Acceso denegado'
                            }
                        }
                    }
                },
                ConflictError: {
                    description: 'Registro duplicado',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ApiError' },
                            example: {
                                status: 409,
                                message: 'Ya existe un registro con los datos enviados'
                            }
                        }
                    }
                },
                ServerError: {
                    description: 'Error interno del servidor',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ApiError' },
                            example: {
                                status: 500,
                                message: 'Error interno del servidor'
                            }
                        }
                    }
                }
            }
        },
        paths: {
            '/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Iniciar sesion',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Login correcto',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/LoginResponse' }
                                }
                            }
                        },
                        401: { description: 'Credenciales invalidas' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/users': {
                get: {
                    tags: ['Auth'],
                    summary: 'Listar usuarios',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Lista de usuarios' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/save/user': {
                post: {
                    tags: ['Auth'],
                    summary: 'Crear usuario',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserCreateRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Usuario creado' },
                        400: { description: 'Validacion fallida' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        409: { $ref: '#/components/responses/ConflictError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/productos': {
                get: {
                    tags: ['Productos'],
                    summary: 'Listar productos',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Lista de productos',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'integer', example: 200 },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/Product' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                },
                post: {
                    tags: ['Productos'],
                    summary: 'Crear producto',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductCreateRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Producto creado' },
                        400: { description: 'Validacion fallida' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        409: { $ref: '#/components/responses/ConflictError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/productos/{id}': {
                put: {
                    tags: ['Productos'],
                    summary: 'Actualizar parcialmente un producto',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductUpdateRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Producto actualizado' },
                        400: { description: 'Validacion fallida' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        404: { description: 'Producto no encontrado' },
                        409: { $ref: '#/components/responses/ConflictError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/import/products': {
                post: {
                    tags: ['Productos'],
                    summary: 'Importar productos desde Excel',
                    description: 'Recibe un archivo .xlsx o .xls de maximo 5MB en el campo file.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Resultado de importacion',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'integer', example: 200 },
                                            message: { type: 'string', example: 'Importacion de productos finalizada' },
                                            data: { $ref: '#/components/schemas/ImportProductsResponse' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Archivo invalido' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/almacenes': {
                get: {
                    tags: ['Almacenes'],
                    summary: 'Listar almacenes',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Lista de almacenes' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                },
                post: {
                    tags: ['Almacenes'],
                    summary: 'Crear almacen',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/WarehouseCreateRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Almacen creado' },
                        400: { description: 'Validacion fallida' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        409: { $ref: '#/components/responses/ConflictError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/stock/producto/{productoId}': {
                get: {
                    tags: ['Stock'],
                    summary: 'Obtener stock por producto',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'productoId',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Stock del producto' },
                        400: { description: 'Parametro invalido' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/stock/almacen/{almacenId}': {
                get: {
                    tags: ['Stock'],
                    summary: 'Obtener stock por almacen',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'almacenId',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    responses: {
                        200: { description: 'Stock del almacen' },
                        400: { description: 'Parametro invalido' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/stock/entrada': {
                post: {
                    tags: ['Stock'],
                    summary: 'Registrar entrada de stock',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StockOperationRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Entrada registrada' },
                        400: { description: 'Validacion fallida' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/stock/salida': {
                post: {
                    tags: ['Stock'],
                    summary: 'Registrar salida de stock',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StockOperationRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Salida registrada' },
                        400: { description: 'Validacion fallida o stock insuficiente' },
                        401: { $ref: '#/components/responses/UnauthorizedError' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            }
        }
    },
    apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
