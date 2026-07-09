import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit each email/IP to 3 requests per window
  message: { message: 'Too many password‑reset attempts, please try again later.' },
  keyGenerator: (req) => ipKeyGenerator(req),
});
