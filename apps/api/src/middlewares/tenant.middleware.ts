import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
        // For some routes (like login/register generic), tenant might not be needed yet.
        // But for most, it is. We'll handle this check in specific routes or making it optional here.
        // For now, let's just attach it if present.
        return next();
    }

    req.tenantId = tenantId;
    next();
};

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required (x-tenant-id header)' });
    }
    next();
};
