import { Router } from 'express';
import * as Controller from '../controllers/medical-notes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireTenant);

router.get('/patient/:patientId', Controller.getByPatient);
router.post('/', upload.array('attachments', 5), Controller.create);

export default router;
