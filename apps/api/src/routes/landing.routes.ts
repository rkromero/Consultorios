import { Router } from 'express';
import * as LandingController from '../controllers/landing.controller';
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

router.get('/', authMiddleware, requireTenant, LandingController.get);
router.put('/', authMiddleware, requireTenant, adminOnly, LandingController.upsert);
router.put('/enable', authMiddleware, requireTenant, adminOnly, LandingController.enable);
router.put('/disable', authMiddleware, requireTenant, adminOnly, LandingController.disable);
router.put('/slug', authMiddleware, requireTenant, adminOnly, LandingController.updateSlug);
router.post('/upload', authMiddleware, requireTenant, adminOnly, LandingController.upload);
router.post('/remove-image', authMiddleware, requireTenant, adminOnly, LandingController.removeImage);

export default router;
