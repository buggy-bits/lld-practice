import { describe, it, expect } from 'vitest';
import { rateLimiter } from '@/lib/rateLimit';
import { TextSubmission } from '@/domain/submission/Submission';

describe('Security & Protection Mechanisms', () => {
  it('rateLimiter blocks requests exceeding the defined limit', () => {
    const testIp = '192.168.1.100';
    const bucket = 'testBucket';
    const limit = 3;
    const windowMs = 60000;

    expect(rateLimiter.check(bucket, testIp, limit, windowMs).isAllowed).toBe(true);
    expect(rateLimiter.check(bucket, testIp, limit, windowMs).isAllowed).toBe(true);
    expect(rateLimiter.check(bucket, testIp, limit, windowMs).isAllowed).toBe(true);

    const blocked = rateLimiter.check(bucket, testIp, limit, windowMs);
    expect(blocked.isAllowed).toBe(false);
    expect(blocked.resetTimeMs).toBeGreaterThan(0);
  });

  it('TextSubmission validation rejects inputs exceeding maximum character caps', () => {
    const longText = 'A'.repeat(5001); // Exceeds 5000 chars

    const submission = new TextSubmission({
      assumptions: 'Valid assumptions text here.',
      classes: 'Valid classes text here.',
      responsibilities: 'Valid responsibilities text here.',
      explanation: longText,
    });

    const validation = submission.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('exceeds maximum limit'))).toBe(true);
  });
});
