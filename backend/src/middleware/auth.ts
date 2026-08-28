import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

function getJWTSecret(): string {
  return process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-in-production';
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const JWT_SECRET = getJWTSecret();
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Missing or invalid authorization header' },
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const JWT_SECRET = getJWTSecret();
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;

    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}