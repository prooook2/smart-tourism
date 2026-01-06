// Helper to prevent duplicate API calls

class RequestDeduplicator {
  constructor() {
    this.pending = new Map();
  }

  async dedupe(key, fn) {
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fn()
      .then((result) => {
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear() {
    this.pending.clear();
  }
}

export const deduplicator = new RequestDeduplicator();
