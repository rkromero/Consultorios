import { Router } from 'express';
import * as SpecialtyController from '../controllers/specialties.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/', SpecialtyController.getAll);
router.post('/', SpecialtyController.create);
router.delete('/:id', SpecialtyController.remove);

export default router;
