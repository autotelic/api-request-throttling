export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const QUEUE_NAME = 'requestsQueue'
export const REDIS_CONNECTION_STRING = 'redis://127.0.0.1:6379'
export const limits = { points: 120, duration: 60 }
