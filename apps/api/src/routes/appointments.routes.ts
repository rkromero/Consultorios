import { Router } from 'express';
import * as Controller from '../controllers/appointments.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/', Controller.getAll);
router.post('/', Controller.create);
router.put('/:id', Controller.update);

export default router;
