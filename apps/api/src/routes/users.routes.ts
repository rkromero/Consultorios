import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
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

router.get('/', authMiddleware, tenantMiddleware, UserController.getAll);
router.post('/invite', authMiddleware, tenantMiddleware, adminOnly, UserController.invite);
router.delete('/:userId', authMiddleware, tenantMiddleware, adminOnly, UserController.remove);
router.put('/:userId/role', authMiddleware, tenantMiddleware, adminOnly, UserController.updateRole);

export default router;
