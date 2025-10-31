import S from 'fluent-json-schema'

const AdminResponse = S.object()
  .prop('id', S.string().required())
  .prop('uid', S.string().required())
  .prop('username', S.string().required())
  .prop('email', S.string().required())
  .prop('isActive', S.boolean().required())
  .prop('createdAt', S.string().format('date-time').required())
  .prop('updatedAt', S.string().format('date-time').required())

const ErrorResponse = S.object()
  .prop('message', S.string().required())

export const login = {
  tags: ['auth'],
  description: 'Admin login',
  body: S.object()
    .prop('admin', S.object()
      .prop('email', S.string().format('email').required())
      .prop('password', S.string().minLength(6).required())
    ).required(),
  response: {
    200: S.object()
      .prop('admin', AdminResponse)
      .prop('token', S.string().required()),
    400: ErrorResponse,
    401: ErrorResponse,
    500: ErrorResponse
  }
}

export const getMe = {
  tags: ['auth'],
  description: 'Get current admin profile',
  response: {
    200: S.object().prop('admin', AdminResponse),
    401: ErrorResponse,
    404: ErrorResponse,
    500: ErrorResponse
  }
}

export const updateMe = {
  tags: ['auth'],
  description: 'Update current admin profile',
  body: S.object()
    .prop('admin', S.object()
      .prop('username', S.string().minLength(3).maxLength(50))
      .prop('email', S.string().format('email'))
      .prop('password', S.string().minLength(6))
    ).required(),
  response: {
    200: S.object().prop('admin', AdminResponse),
    400: ErrorResponse,
    401: ErrorResponse,
    409: ErrorResponse,
    500: ErrorResponse
  }
}
