import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, UserController.getAll);

export default router;
