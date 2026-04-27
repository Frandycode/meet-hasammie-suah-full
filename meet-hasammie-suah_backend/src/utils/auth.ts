/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const EXPIRY  = '7d';

export interface TokenPayload {
  adminId: string;
  username: string;
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRY });

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};
