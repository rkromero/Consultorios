import { Router } from 'express';
import * as CollectionsController from '../controllers/collections.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { Role } from '@clinica/db';

const router = Router();

const adminOnly = (req: any, res: any, next: any) => {
    if (req.role !== Role.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
};

router.get('/', authMiddleware, tenantMiddleware, adminOnly, CollectionsController.getAll);
router.patch('/:appointmentId/due-date', authMiddleware, tenantMiddleware, adminOnly, CollectionsController.updateDueDate);
router.post('/:appointmentId/mark-paid', authMiddleware, tenantMiddleware, adminOnly, CollectionsController.markAsPaid);

export default router;
