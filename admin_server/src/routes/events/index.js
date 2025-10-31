import * as schema from './schema.js'

// Utility function to slugify text
function slugify(text) {
    if (!text) return ''
    return String(text)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

// Generate unique slug
async function generateUniqueSlug(prisma, title, date, excludeId = null) {
    const datePart = date ? new Date(date).toISOString().slice(0, 10) : ''
    const base = slugify(`${title || 'evento'} ${datePart}`) || 'evento'

    const existingEvent = await prisma.evento.findUnique({
        where: { slug: base }
    })

    if (!existingEvent || (excludeId && existingEvent.id === excludeId)) {
        return base
    }

    // Generate random suffix if slug exists
    return `${base}-${Math.random().toString(36).slice(2, 6)}`
}


// Format event response
function formatEventResponse(event) {
    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        date: event.date,
        price: event.price,
        currency: event.currency,
        location: event.location,
        description: event.description,
        category: event.category,
        status: event.status,
        isActive: event.isActive,
        mainImage: event.mainImage,
        images: event.images,
        favouritesCount: event.favouritesCount,
        comments: event.comments,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
    }
}

export default async function eventsRoutes(server) {
    if (!server.prisma) {
        throw new Error('Prisma plugin not loaded')
    }

    // CREATE EVENT
    server.route({
        method: 'POST',
        url: '/events',
        schema: schema.createEvent,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { event: eventData } = req.body

                // Validate required fields
                if (!eventData.title || !eventData.date || eventData.price === undefined || !eventData.category) {
                    return reply.code(400).send({
                        message: 'Title, date, price and category are required'
                    })
                }

                // Validate price
                if (eventData.price < 0) {
                    return reply.code(400).send({
                        message: 'Price must be greater than or equal to 0'
                    })
                }

                // Generate unique slug
                const slug = await generateUniqueSlug(server.prisma, eventData.title, eventData.date)

                // Create event
                const newEvent = await server.prisma.evento.create({
                    data: {
                        slug,
                        title: eventData.title,
                        date: new Date(eventData.date),
                        price: eventData.price,
                        currency: eventData.currency || 'EUR',
                        location: eventData.location || null,
                        description: eventData.description || null,
                        category: eventData.category,
                        status: eventData.status || 'draft',
                        isActive: eventData.isActive !== undefined ? eventData.isActive : true,
                        mainImage: eventData.mainImage || null,
                        images: eventData.images || []
                    }
                })

                return reply.code(201).send({
                    event: formatEventResponse(newEvent)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // UPDATE EVENT
    server.route({
        method: 'PUT',
        url: '/events/:slug',
        schema: schema.updateEvent,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { slug } = req.params
                const { event: eventData } = req.body

                // Find existing event
                const existingEvent = await server.prisma.evento.findUnique({
                    where: { slug }
                })

                if (!existingEvent) {
                    return reply.code(404).send({
                        message: 'Event not found'
                    })
                }

                // Validate price if provided
                if (eventData.price !== undefined && eventData.price < 0) {
                    return reply.code(400).send({
                        message: 'Price must be greater than or equal to 0'
                    })
                }

                // Prepare update data
                const updateData = {}

                if (eventData.title !== undefined) updateData.title = eventData.title
                if (eventData.date !== undefined) updateData.date = new Date(eventData.date)
                if (eventData.price !== undefined) updateData.price = eventData.price
                if (eventData.currency !== undefined) updateData.currency = eventData.currency
                if (eventData.location !== undefined) updateData.location = eventData.location
                if (eventData.description !== undefined) updateData.description = eventData.description
                if (eventData.category !== undefined) updateData.category = eventData.category
                if (eventData.status !== undefined) updateData.status = eventData.status
                if (eventData.isActive !== undefined) updateData.isActive = eventData.isActive
                if (eventData.mainImage !== undefined) updateData.mainImage = eventData.mainImage
                if (eventData.images !== undefined) updateData.images = eventData.images

                // Regenerate slug if title or date changed
                if (eventData.title || eventData.date) {
                    const newTitle = eventData.title || existingEvent.title
                    const newDate = eventData.date || existingEvent.date
                    updateData.slug = await generateUniqueSlug(
                        server.prisma,
                        newTitle,
                        newDate,
                        existingEvent.id
                    )
                }

                // Update event
                const updatedEvent = await server.prisma.evento.update({
                    where: { slug },
                    data: updateData
                })

                return reply.code(200).send({
                    event: formatEventResponse(updatedEvent)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // GET SINGLE EVENT
    server.route({
        method: 'GET',
        url: '/events/:slug',
        schema: schema.getEvent,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { slug } = req.params

                const event = await server.prisma.evento.findUnique({
                    where: { slug }
                })

                if (!event) {
                    return reply.code(404).send({
                        message: 'Event not found'
                    })
                }

                return reply.code(200).send({
                    event: formatEventResponse(event)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // LIST EVENTS
    server.route({
        method: 'GET',
        url: '/events',
        schema: schema.listEvents,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const {
                    limit = 20,
                    offset = 0,
                    status,
                    isActive,
                    category,
                    search,
                    sortBy = 'date',
                    sortOrder = 'desc'
                } = req.query

                // Build where clause
                const where = {}

                if (status) {
                    where.status = status
                }

                if (isActive !== undefined) {
                    where.isActive = isActive === 'true'
                }

                if (category) {
                    where.category = category
                }

                if (search) {
                    where.OR = [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { location: { contains: search, mode: 'insensitive' } }
                    ]
                }

                // Build orderBy
                const orderBy = {}
                orderBy[sortBy] = sortOrder

                // Get events
                const [events, totalCount] = await Promise.all([
                    server.prisma.evento.findMany({
                        where,
                        orderBy,
                        skip: offset,
                        take: limit
                    }),
                    server.prisma.evento.count({ where })
                ])

                return reply.code(200).send({
                    events: events.map(formatEventResponse),
                    eventsCount: events.length,
                    totalCount
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // DELETE EVENT
    server.route({
        method: 'DELETE',
        url: '/events/:slug',
        schema: schema.deleteEvent,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { slug } = req.params

                // Find event
                const event = await server.prisma.evento.findUnique({
                    where: { slug }
                })

                if (!event) {
                    return reply.code(404).send({
                        message: 'Event not found'
                    })
                }

                // Delete event
                const deletedEvent = await server.prisma.evento.delete({
                    where: { slug }
                })

                return reply.code(200).send({
                    message: 'Event deleted successfully',
                    event: formatEventResponse(deletedEvent)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // UPDATE EVENT STATUS
    server.route({
        method: 'PATCH',
        url: '/events/:slug/status',
        schema: schema.updateEventStatus,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { slug } = req.params
                const { status } = req.body

                // Validate status
                if (!['draft', 'published', 'cancelled'].includes(status)) {
                    return reply.code(400).send({
                        message: 'Invalid status. Must be draft, published or cancelled'
                    })
                }

                // Find event
                const event = await server.prisma.evento.findUnique({
                    where: { slug }
                })

                if (!event) {
                    return reply.code(404).send({
                        message: 'Event not found'
                    })
                }

                // Update status
                const updatedEvent = await server.prisma.evento.update({
                    where: { slug },
                    data: { status }
                })

                return reply.code(200).send({
                    event: formatEventResponse(updatedEvent)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })

    // TOGGLE EVENT ACTIVE
    server.route({
        method: 'PATCH',
        url: '/events/:slug/active',
        schema: schema.toggleEventActive,
        preHandler: server.authenticate,
        handler: async (req, reply) => {
            try {

                const { slug } = req.params
                const { isActive } = req.body

                // Find event
                const event = await server.prisma.evento.findUnique({
                    where: { slug }
                })

                if (!event) {
                    return reply.code(404).send({
                        message: 'Event not found'
                    })
                }

                // Update isActive
                const updatedEvent = await server.prisma.evento.update({
                    where: { slug },
                    data: { isActive }
                })

                return reply.code(200).send({
                    event: formatEventResponse(updatedEvent)
                })
            } catch (error) {
                req.log.error(error)
                return reply.code(500).send({
                    message: 'Internal server error'
                })
            }
        }
    })
}
