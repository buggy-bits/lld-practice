interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private stores: Map<string, Map<string, RateLimitRecord>> = new Map();

  check(
    bucketName: string,
    identifier: string,
    limit: number,
    windowMs: number
  ): { isAllowed: boolean; current: number; limit: number; resetTimeMs: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.stores.has(bucketName)) {
      this.stores.set(bucketName, new Map());
    }

    const bucket = this.stores.get(bucketName)!;
    let record = bucket.get(identifier);

    if (!record) {
      record = { timestamps: [] };
      bucket.set(identifier, record);
    }

    // Clean up timestamps outside the current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0];
      const resetTimeMs = oldestInWindow + windowMs - now;

      return {
        isAllowed: false,
        current: record.timestamps.length,
        limit,
        resetTimeMs: Math.max(0, resetTimeMs),
      };
    }

    record.timestamps.push(now);

    return {
      isAllowed: true,
      current: record.timestamps.length,
      limit,
      resetTimeMs: windowMs,
    };
  }

  // Periodic cleanup to avoid memory leaks
  cleanup() {
    const now = Date.now();
    for (const [, bucket] of this.stores.entries()) {
      for (const [id, record] of bucket.entries()) {
        record.timestamps = record.timestamps.filter((ts) => ts > now - 15 * 60 * 1000);
        if (record.timestamps.length === 0) {
          bucket.delete(id);
        }
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}
