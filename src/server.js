import { fastifyBeeQueue } from '@autotelic/fastify-bee-queue'
import fastifyRedis from 'fastify-redis'
import { QUEUE_NAME, REDIS_CONNECTION_STRING } from './utils.js'


export default async function (fastify, options) {

  fastify.register(fastifyRedis, {
    url: REDIS_CONNECTION_STRING,
    closeClient: true
  })

  fastify.register(fastifyBeeQueue, { redis: fastify.redis })

  fastify.register(async (fastify, opts) => {
    await fastify.bq.createProducer(QUEUE_NAME)
  })

  fastify.get('/batch-queue/:numRequests', async (req, reply) => {
    const { authorization } = req.headers
    console.log(authorization)
    const { numRequests } = req.params
    const { queues } = fastify.bq
    const q = queues[QUEUE_NAME]

    const batchQueue = Array.from(Array(parseInt(numRequests)).keys()).map(i => q.createJob({ i, authorization }))

    const errors = await q.saveAll(batchQueue)
    reply.send({
      queued: numRequests,
      authorization,
      errors
    })
  })

}
