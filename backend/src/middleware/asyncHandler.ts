import { Request, Response, NextFunction, RequestHandler } from 'express'
import { AuthenticatedRequest } from './auth.js'

/**
 * Wraps an async route handler to properly handle the types for AuthenticatedRequest
 * This fixes TypeScript errors with Express route handlers
 */
export function asyncHandler(
    fn: (req: AuthenticatedRequest, res: Response) => Promise<void>
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req as AuthenticatedRequest, res)).catch(next)
    }
}
