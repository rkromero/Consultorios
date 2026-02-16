import { Router } from 'express';
import * as SiteController from '../controllers/sites.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/', SiteController.getAll);
router.get('/:id', SiteController.getById);
router.post('/', SiteController.create);
router.put('/:id', SiteController.update);
router.delete('/:id', SiteController.remove);

export default router;
