import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@clinica/db';
import { config } from '../config';

const prisma = new PrismaClient(); // In a real app, inject this or import singleton

interface JwtPayload {
    userId: string;
    tenantId?: string;
    role?: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = config.JWT_SECRET;
        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user;

        // If token has tenantId, enforce it matches header if present
        if (decoded.tenantId) {
            if (req.tenantId && req.tenantId !== decoded.tenantId) {
                return res.status(403).json({ message: 'Tenant mismatch' });
            }
            req.tenantId = decoded.tenantId;
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
