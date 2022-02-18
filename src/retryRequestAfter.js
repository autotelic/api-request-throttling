import { sleep } from './utils.js'

export default async function retryRequestAfter(requestFn, getStatusCode, getMsUntilRetryAfter) {
  const response = await requestFn()
  const statusCode = getStatusCode(response)
  if (statusCode === 429) {
    const waitUntil = getMsUntilRetryAfter(response)
    await sleep(waitUntil)
    return retryRequestAfter(requestFn, getStatusCode, getMsUntilRetryAfter)
  }
  return response
}
