import S from 'fluent-json-schema'

const CategoryResponse = S.object()
  .prop('id', S.string().required())
  .prop('name', S.string().required())
  .prop('description', S.string())
  .prop('image', S.string())
  .prop('slug', S.string().required())
  .prop('isActive', S.boolean().required())
  .prop('status', S.string().enum(['active', 'hidden', 'archived']).required())
  .prop('createdAt', S.string().format('date-time').required())
  .prop('updatedAt', S.string().format('date-time').required())

const ErrorResponse = S.object()
  .prop('message', S.string().required())

export const list = {
  tags: ['categories'],
  description: 'List all categories',
  response: {
    200: S.object().prop('categories', S.array().items(CategoryResponse)),
    401: ErrorResponse,
    500: ErrorResponse
  }
}

export const get = {
  tags: ['categories'],
  description: 'Get category by slug',
  params: S.object()
    .prop('slug', S.string().required()),
  response: {
    200: S.object().prop('category', CategoryResponse),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}

export const create = {
  tags: ['categories'],
  description: 'Create new category',
  body: S.object()
    .prop('category', S.object()
      .prop('name', S.string().minLength(3).maxLength(100).required())
      .prop('description', S.string().maxLength(500))
      .prop('image', S.string())
    ).required(),
  response: {
    201: S.object().prop('category', CategoryResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}

export const update = {
  tags: ['categories'],
  description: 'Update category',
  params: S.object()
    .prop('slug', S.string().required()),
  body: S.object()
    .prop('category', S.object()
      .prop('name', S.string().minLength(3).maxLength(100))
      .prop('description', S.string().maxLength(500))
      .prop('image', S.string())
      .prop('isActive', S.boolean())
      .prop('status', S.string().enum(['active', 'hidden', 'archived']))
    ).required(),
  response: {
    200: S.object().prop('category', CategoryResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    404: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}

export const remove = {
  tags: ['categories'],
  description: 'Delete category',
  params: S.object()
    .prop('slug', S.string().required()),
  response: {
    204: S.null(),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}
