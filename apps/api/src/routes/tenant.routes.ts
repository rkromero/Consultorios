import { Router } from 'express';
import * as TenantController from '../controllers/tenant.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';
import { Role } from '@clinica/db';

const router = Router();

const adminOnly = (req: any, res: any, next: any) => {
    if (req.role !== Role.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};

router.get('/', authMiddleware, requireTenant, TenantController.getInfo);
router.put('/name', authMiddleware, requireTenant, adminOnly, TenantController.updateName);
router.post('/logo', authMiddleware, requireTenant, adminOnly, TenantController.uploadLogo);
router.delete('/logo', authMiddleware, requireTenant, adminOnly, TenantController.removeLogo);

export default router;
