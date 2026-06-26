import { Request, Response, NextFunction } from 'express';

export const verifyReCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-recaptcha-token'] as string;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Allow bypassing reCAPTCHA check if keys are completely missing in non-production.
    // This facilitates running tests or local development easily.
    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: reCAPTCHA Secret Key is missing in production environment variables.');
        return res.status(500).json({ error: 'Security system configuration error.' });
      }
      console.warn('reCAPTCHA Secret Key is missing. Bypassing check in development.');
      return next();
    }

    if (process.env.SKIP_RECAPTCHA === 'true') {
      console.warn('reCAPTCHA check explicitly bypassed via SKIP_RECAPTCHA=true env variable.');
      return next();
    }

    if (!token) {
      return res.status(400).json({ error: 'Security verification token is missing.' });
    }

    if (token === 'bypass-token') {
      if (process.env.NODE_ENV === 'production' && process.env.SKIP_RECAPTCHA !== 'true') {
        console.error('CRITICAL: reCAPTCHA bypass-token was submitted in production mode. Blocking request.');
        return res.status(400).json({ error: 'Security validation failed.' });
      }
      console.warn('reCAPTCHA verification bypassed in development mode using bypass-token.');
      return next();
    }

    console.log(`[reCAPTCHA] Verifying token (length: ${token ? token.length : 0}) with secret starting with: ${secretKey ? secretKey.substring(0, 6) + '...' : 'none'}`);

    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!verifyResponse.ok) {
      console.error('[reCAPTCHA] Failed to contact Google. HTTP status:', verifyResponse.status);
      return res.status(502).json({ error: 'Failed to contact Google verification servers.' });
    }

    const result = await verifyResponse.json() as {
      success: boolean;
      score?: number;
      'error-codes'?: string[];
    };

    console.log('[reCAPTCHA] Google verification response:', result);

    if (!result.success) {
      console.error('[reCAPTCHA] Verification failed! Error codes:', result['error-codes']);
      return res.status(400).json({ 
        error: 'Security validation failed.',
        details: result['error-codes']
      });
    }

    // Enforce threshold score check for v3 (default 0.5)
    const minScore = 0.5;
    if (result.score !== undefined && result.score < minScore) {
      return res.status(403).json({ 
        error: 'Suspicious bot activity detected. Access denied.',
        score: result.score
      });
    }

    next();
  } catch (error) {
    console.error('reCAPTCHA middleware error:', error);
    return res.status(500).json({ error: 'Internal security verification error' });
  }
};
