class Cache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 30000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.store.clear();
  }

  delete(key) {
    this.store.delete(key);
  }
}

export const cache = new Cache();

export const cacheMiddleware = (ttlMs = 30000) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached);
    }

    const originalJson = res.json;
    res.json = function (data) {
      cache.set(cacheKey, data, ttlMs);
      res.setHeader("X-Cache", "MISS");
      return originalJson.call(this, data);
    };

    next();
  };
};

export const invalidateCache = (pattern) => {
  for (const key of cache.store.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
