export const getAllOrdersSchema = {
  description: 'Get all orders with pagination and filters',
  tags: ['Orders'],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      status: { type: 'string', enum: ['all', 'pending', 'paid', 'cancelled', 'refunded', 'failed'] },
      userId: { type: 'string' },
      search: { type: 'string' },
      sortBy: { type: 'string', default: 'createdAt' },
      sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
    }
  }
};

export const getOrderByIdSchema = {
  description: 'Get order by ID',
  tags: ['Orders'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    },
    required: ['id']
  }
};
