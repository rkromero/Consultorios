import { Router } from 'express';
import * as LandingController from '../controllers/landing.controller';

const router = Router();

router.get('/landing/:slug', LandingController.getPublic);

export default router;
