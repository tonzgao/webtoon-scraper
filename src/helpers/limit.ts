import Bottleneck from 'bottleneck'

// TODO: allow setting values with flags
export const limiter = new Bottleneck({
  reservoir: 2, // initial value
  reservoirRefreshAmount: 2,
  reservoirRefreshInterval: 10 * 1000, // must be divisible by 250
  maxConcurrent: 1,
});

const parseLimitOptions = (options: Record<string, string>) => {
  // TODO: implement
  return undefined;
}

export const setRateLimits = (options: Bottleneck.ConstructorOptions) => {
  const limitOptions = parseLimitOptions(options);
  if (!limitOptions) {
    return;
  }
  limiter.updateSettings(options);
}