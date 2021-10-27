import { wait } from './wait'

const timeout = async (ms: number) => {
  await wait(ms);
  throw new Error('Timeout')
}

// Add timeout to async function
export const runTimeout = async <T>(ms: number, promise: () => Promise<T>): Promise<T> => {
  return Promise.race([
    promise(),
    timeout(ms),
  ])
}