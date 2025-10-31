import S from 'fluent-json-schema'

const UserResponse = S.object()
  .prop('id', S.string().required())
  .prop('uid', S.string().required())
  .prop('slug', S.string().required())
  .prop('username', S.string().required())
  .prop('email', S.string().format('email').required())
  .prop('bio', S.string().required())
  .prop('image', S.string())
  .prop('isActive', S.boolean().required())
  .prop('status', S.string().enum(['active', 'blocked', 'pending']).required())
  .prop('favouriteEvents', S.array().items(S.string()))
  .prop('followingUsers', S.array().items(S.string()))
  .prop('comentarios', S.array().items(S.string()))
  .prop('reservas', S.array().items(S.string()))
  .prop('createdAt', S.string().format('date-time').required())
  .prop('updatedAt', S.string().format('date-time').required())

const ErrorResponse = S.object()
  .prop('message', S.string().required())

export const list = {
  tags: ['users'],
  description: 'List all users',
  response: {
    200: S.object().prop('users', S.array().items(UserResponse)),
    401: ErrorResponse,
    500: ErrorResponse
  }
}

export const getById = {
  tags: ['users'],
  description: 'Get user by UID',
  params: S.object()
    .prop('uid', S.string().required()),
  response: {
    200: S.object().prop('user', UserResponse),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}

export const create = {
  tags: ['users'],
  description: 'Create new user',
  body: S.object()
    .prop('user', S.object()
      .prop('username', S.string().minLength(3).maxLength(50).required())
      .prop('email', S.string().format('email').required())
      .prop('password', S.string().minLength(6).maxLength(100).required())
      .prop('bio', S.string().maxLength(500))
      .prop('image', S.string())
    ).required(),
  response: {
    201: S.object().prop('user', UserResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}

export const update = {
  tags: ['users'],
  description: 'Update user',
  params: S.object()
    .prop('uid', S.string().required()),
  body: S.object()
    .prop('user', S.object()
      .prop('username', S.string().minLength(3).maxLength(50))
      .prop('email', S.string().format('email'))
      .prop('password', S.string().minLength(6).maxLength(100))
      .prop('bio', S.string().maxLength(500))
      .prop('image', S.string())
      .prop('isActive', S.boolean())
      .prop('status', S.string().enum(['active', 'blocked', 'pending']))
    ).required(),
  response: {
    200: S.object().prop('user', UserResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    404: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}

export const remove = {
  tags: ['users'],
  description: 'Delete user',
  params: S.object()
    .prop('uid', S.string().required()),
  response: {
    204: S.null(),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}

