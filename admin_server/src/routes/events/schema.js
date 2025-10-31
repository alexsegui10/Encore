// Admin Events Schema

const eventResponse = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        slug: { type: 'string' },
        title: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        price: { type: 'number' },
        currency: { type: 'string' },
        location: { type: ['string', 'null'] },
        description: { type: ['string', 'null'] },
        category: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'published', 'cancelled'] },
        isActive: { type: 'boolean' },
        mainImage: { type: ['string', 'null'] },
        images: { type: 'array', items: { type: 'string' } },
        favouritesCount: { type: 'number' },
        comments: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
}

export const createEvent = {
    description: 'Create a new event',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['event'],
        properties: {
            event: {
                type: 'object',
                required: ['title', 'date', 'price', 'category'],
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 160 },
                    date: { type: 'string', format: 'date-time' },
                    price: { type: 'number', minimum: 0 },
                    currency: { type: 'string', default: 'EUR' },
                    location: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 2000 },
                    category: { type: 'string' },
                    status: { type: 'string', enum: ['draft', 'published', 'cancelled'], default: 'draft' },
                    isActive: { type: 'boolean', default: true },
                    mainImage: { type: 'string', maxLength: 500 },
                    images: {
                        type: 'array',
                        items: { type: 'string', maxLength: 500 },
                        default: []
                    }
                }
            }
        }
    },
    response: {
        201: {
            description: 'Event created successfully',
            type: 'object',
            properties: {
                event: eventResponse
            }
        },
        400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        },
        401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}

export const updateEvent = {
    description: 'Update an existing event',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['event'],
        properties: {
            event: {
                type: 'object',
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 160 },
                    date: { type: 'string', format: 'date-time' },
                    price: { type: 'number', minimum: 0 },
                    currency: { type: 'string' },
                    location: { type: 'string', maxLength: 200 },
                    description: { type: 'string', maxLength: 2000 },
                    category: { type: 'string' },
                    status: { type: 'string', enum: ['draft', 'published', 'cancelled'] },
                    isActive: { type: 'boolean' },
                    mainImage: { type: 'string', maxLength: 500 },
                    images: {
                        type: 'array',
                        items: { type: 'string', maxLength: 500 }
                    }
                }
            }
        }
    },
    response: {
        200: {
            description: 'Event updated successfully',
            type: 'object',
            properties: {
                event: eventResponse
            }
        },
        400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}

export const getEvent = {
    description: 'Get a single event by slug',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Event retrieved successfully',
            type: 'object',
            properties: {
                event: eventResponse
            }
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}

export const listEvents = {
    description: 'List all events with pagination and filters',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    querystring: {
        type: 'object',
        properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 },
            status: { type: 'string', enum: ['draft', 'published', 'cancelled'] },
            isActive: { type: 'string', enum: ['true', 'false'] },
            category: { type: 'string' },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['date', 'createdAt', 'updatedAt', 'title'], default: 'date' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
    },
    response: {
        200: {
            description: 'Events list retrieved successfully',
            type: 'object',
            properties: {
                events: {
                    type: 'array',
                    items: eventResponse
                },
                eventsCount: { type: 'integer' },
                totalCount: { type: 'integer' }
            }
        }
    }
}

export const deleteEvent = {
    description: 'Delete an event by slug',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'Event deleted successfully',
            type: 'object',
            properties: {
                message: { type: 'string' },
                event: eventResponse
            }
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}

export const updateEventStatus = {
    description: 'Update event status (draft, published, cancelled)',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'string', enum: ['draft', 'published', 'cancelled'] }
        }
    },
    response: {
        200: {
            description: 'Event status updated successfully',
            type: 'object',
            properties: {
                event: eventResponse
            }
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}

export const toggleEventActive = {
    description: 'Toggle event isActive status',
    tags: ['events'],
    security: [{ bearerAuth: [] }],
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['isActive'],
        properties: {
            isActive: { type: 'boolean' }
        }
    },
    response: {
        200: {
            description: 'Event active status updated successfully',
            type: 'object',
            properties: {
                event: eventResponse
            }
        },
        404: {
            description: 'Event not found',
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}
