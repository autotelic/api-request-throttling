import fastifyRateLimit from 'fastify-rate-limit'
import { limits } from './utils.js'

const { points, duration } = limits

export default async function (fastify, options) {
  fastify.register(fastifyRateLimit, {
    max: points,
    timeWindow: duration * 1000,
    keyGenerator: req => {
      const { authorization } = req.headers
      if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.substring(7)
      }
      return req.connection.remoteAddress
    }
  })

  fastify.get('/', async (req, reply) => reply.send({ hello: 'world' }))
}
