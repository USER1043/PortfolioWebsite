const defaultOptions = {
  windowMs: 60_000,
  maxRequests: 60,
  keyPrefix: "rate-limit",
};

const requestBuckets = new Map();

function getBucket(key, windowMs) {
  const now = Date.now();
  const existing = requestBuckets.get(key);

  if (!existing) {
    const bucket = {
      windowStart: now,
      requests: 1,
    };
    requestBuckets.set(key, bucket);
    return bucket;
  }

  if (now - existing.windowStart >= windowMs) {
    existing.windowStart = now;
    existing.requests = 1;
    return existing;
  }

  existing.requests += 1;
  return existing;
}

export function createRateLimiter(options = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const { windowMs, maxRequests, keyPrefix } = mergedOptions;

  return async function limit(key) {
    const bucketKey = `${keyPrefix}:${key}`;
    const bucket = getBucket(bucketKey, windowMs);

    if (bucket.requests > maxRequests) {
      const waitMs = windowMs - (Date.now() - bucket.windowStart);
      const delay = Math.max(waitMs, 0);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return false;
    }

    return true;
  };
}

export function createBrowserRateLimiter(options = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const { windowMs, maxRequests, keyPrefix } = mergedOptions;

  return async function limit(key) {
    const storage =
      typeof window !== "undefined"
        ? window.localStorage
        : globalThis.localStorage;

    if (!storage) {
      return true;
    }

    const bucketKey = `${keyPrefix}:${key}`;
    const now = Date.now();
    const storageValue = storage.getItem(bucketKey);
    const parsedValue = storageValue ? JSON.parse(storageValue) : null;
    const bucket =
      parsedValue && typeof parsedValue === "object"
        ? parsedValue
        : { windowStart: now, requests: 0 };

    if (now - bucket.windowStart >= windowMs) {
      bucket.windowStart = now;
      bucket.requests = 0;
    }

    bucket.requests += 1;

    if (bucket.requests >= maxRequests + 1) {
      storage.setItem(bucketKey, JSON.stringify(bucket));
      return false;
    }

    storage.setItem(bucketKey, JSON.stringify(bucket));
    return true;
  };
}

export const githubRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  keyPrefix: "github-api",
});
