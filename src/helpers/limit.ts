import Bottleneck from 'bottleneck'

const defaultOptions = {
  reservoir: 1,
  reservoirRefreshAmount: 1,
  reservoirRefreshInterval: 5 * 1000, // must be divisible by 250
  maxConcurrent: 1,
}

// Generate options for bottleneck module
const parseLimitOptions = (options: Record<string, string>) => {
  if (!options.rateLimit) {
    return defaultOptions
  }
  return {
    ...defaultOptions,
    reservoirRefreshInterval: Number(options.rateLimit)
  };
}

// Set rate limits from options
export const setRateLimits = (options: Bottleneck.ConstructorOptions) => {
  const limitOptions = parseLimitOptions(options);
  return new Bottleneck(options);
}