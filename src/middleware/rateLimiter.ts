import rateLimit from 'express-rate-limit';

// Global Rate Limiter: 100 requests per 15 minutes window
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Authentication Rate Limiter: 10 requests per 15 minutes window (Strict for login/register/password reset)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

// File Upload Rate Limiter: 20 upload requests per 15 minutes window
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 file upload requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Upload limit exceeded for this IP, please try again after 15 minutes.',
  },
});
