import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Admin from '../models/Admin';
import Teacher from '../models/Teacher';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const signJWT = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
};

export const verifyJWT = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Return the decoded token information directly
    return {
      id: decoded.id,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
};
