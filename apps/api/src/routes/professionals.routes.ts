import { Router } from 'express';
import * as ProfessionalController from '../controllers/professionals.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/', ProfessionalController.getAll);
router.get('/:id', ProfessionalController.getById);
router.post('/', ProfessionalController.create);
router.put('/:id', ProfessionalController.update);

export default router;
