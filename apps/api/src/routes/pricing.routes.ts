import { Router } from 'express';
import * as PricingController from '../controllers/pricing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { Role } from '@clinica/db';

const router = Router();

// Restricted to ADMIN
const adminOnly = (req: any, res: any, next: any) => {
    if (req.role !== Role.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};

router.get('/', authMiddleware, tenantMiddleware, adminOnly, PricingController.getCurrentPrice);
router.post('/', authMiddleware, tenantMiddleware, adminOnly, PricingController.createPriceVersion);
router.post('/setup', authMiddleware, tenantMiddleware, adminOnly, async (req: any, res: any) => {
    try {
        const { BackfillService } = require('../services/backfill.service');
        const service = new BackfillService();
        const result = await service.runBackfill(req.user.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
