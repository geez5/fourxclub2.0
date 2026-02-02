import { Request, Response, NextFunction } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config/env.js'
import { prisma } from '../config/prisma.js'

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string
        email: string
        name: string | null
    }
}

export interface JwtPayload {
    userId: string
    email: string
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            res.status(401).json({ error: 'Unauthorized' })
            return
        }

        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, fullName: true },
        })

        if (!user) {
            res.status(401).json({ error: 'User not found' })
            return
        }

        req.user = {
            id: user.id,
            email: user.email!,
            name: user.fullName || user.name,
        }

        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
}

export function generateToken(userId: string, email: string): string {
    const options: SignOptions = {
        expiresIn: '7d',
    }
    return jwt.sign({ userId, email }, config.jwtSecret, options)
}
