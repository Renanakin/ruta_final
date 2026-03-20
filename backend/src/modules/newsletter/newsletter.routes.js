import { Router } from 'express';
import * as newsletterController from './newsletter.controller.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { NewsletterSubscribeSchema } from '../../../validators.js';

const router = Router();

router.post('/subscribe', validateBody(NewsletterSubscribeSchema), newsletterController.subscribe);

export default router;
