import S from 'fluent-json-schema'

const UserResponse = S.object()
  .prop('email', S.string().format('email').required())
  .prop('token', S.string().required())
  .prop('username', S.string().minLength(3).maxLength(50).required())
  .prop('bio', S.string().maxLength(500).required())
  .prop('image', S.string().required())

const ErrorResponse = S.object()
  .prop('message', S.string().required())

export const login = {
  tags: ['users'],
  description: 'User login',
  body: S.object()
    .prop('user', S.object()
      .prop('email', S.string().format('email').required())
      .prop('password', S.string().minLength(1).required())
    ).required(),
  response: {
    200: S.object().prop('user', UserResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    500: ErrorResponse
  }
}

export const register = {
  tags: ['users'],
  description: 'Register new user',
  body: S.object()
    .prop('user', S.object()
      .prop('username', S.string().minLength(3).maxLength(50).required())
      .prop('email', S.string().format('email').required())
      .prop('password', S.string().minLength(6).maxLength(100).required())
    ).required(),
  response: {
    200: S.object().prop('user', UserResponse),
    400: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}

export const get = {
  tags: ['users'],
  description: 'Get current user',
  response: {
    200: S.object().prop('user', UserResponse),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}

export const update = {
  tags: ['users'],
  description: 'Update user profile',
  body: S.object()
    .prop('user', S.object()
      .prop('email', S.string().format('email'))
      .prop('username', S.string().minLength(3).maxLength(50))
      .prop('password', S.string().minLength(6).maxLength(100))
      .prop('bio', S.string().maxLength(500))
      .prop('image', S.string())
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
