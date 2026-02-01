import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from './auth.js'
import { config } from '../config/env.js'

export function adminMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' })
        return
    }

    if (req.user.email !== config.adminEmail) {
        res.status(403).json({ error: 'Forbidden - Admin access required' })
        return
    }

    next()
}
