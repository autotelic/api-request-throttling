import { RateLimiterRedis } from 'rate-limiter-flexible'
import { request } from 'undici'
import Redis from 'ioredis'
import { workerBees } from '@autotelic/fastify-bee-queue'
import { QUEUE_NAME, REDIS_CONNECTION_STRING, sleep, limits } from './utils.js'

const redisClient = new Redis({ enableOfflineQueue: false })

const { points, duration } = limits

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points,
  duration,
  execEvenly: true,
  execEvenlyMinDelayMs: 400
})

async function acquirePoint(fn, limiter, key) {
  try {
    const points = await limiter.consume(key)
    const { consumedPoints } = points
    console.log(`${consumedPoints} of ${limiter.points}`)
    await fn()
  } catch (points) {
    const { msBeforeNext } = points
    console.log(`no points available. waiting ${msBeforeNext}ms`)
    await sleep(msBeforeNext)
    return await acquirePoint(fn, limiter, key)
  }
}

const workers = [
  {
    name: QUEUE_NAME,
    processor: async (job) => {
      const { data: { i, authorization } } = job
      const fn = async() => {
        const response = await request('http://localhost:3000/', {
          headers: {
            'Authorization': authorization
          }
        })
      }
      const key = authorization.substring(7)
      await acquirePoint(fn, rateLimiter, key)
    },
    options: {}
  }
]

const queueOptions = {
  redis: 'redis://127.0.0.1:6379'
}

const { start } = workerBees({ workers, queueOptions })

const queues = await start()
