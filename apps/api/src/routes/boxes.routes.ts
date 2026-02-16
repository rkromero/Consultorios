import { Router } from 'express';
import * as BoxController from '../controllers/boxes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/', BoxController.getAll);
router.get('/:id', BoxController.getById);
router.post('/', BoxController.create);
router.put('/:id', BoxController.update);
router.delete('/:id', BoxController.remove);

export default router;
