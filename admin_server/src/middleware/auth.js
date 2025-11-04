export const authenticate = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({
        message: 'Missing authorization header'
      })
    }

    const token = authHeader.startsWith('Token ')
      ? authHeader.slice(6)
      : authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader

    if (!token) {
      return reply.code(401).send({
        message: 'Invalid authorization format'
      })
    }

    await req.jwtVerify({ token })

  } catch (error) {
    return reply.code(401).send({
      message: 'Invalid or expired token'
    })
  }
}

export const requireAdmin = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({
        message: 'Missing authorization header'
      })
    }

    const token = authHeader.startsWith('Token ')
      ? authHeader.slice(6)
      : authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader

    if (!token) {
      return reply.code(401).send({
        message: 'Invalid authorization format'
      })
    }

    const decoded = await req.jwtVerify({ token })

    if (!decoded || decoded.role !== 'admin') {
      return reply.code(403).send({
        message: 'Forbidden: Admin access required'
      })
    }

    req.user = decoded

  } catch (error) {
    return reply.code(401).send({
      message: 'Invalid or expired token'
      })
  }
}
