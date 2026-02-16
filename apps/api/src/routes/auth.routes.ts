import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/select-tenant', authMiddleware, AuthController.selectTenant);

export default router;
