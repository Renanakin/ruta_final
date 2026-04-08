import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  EmailSchema,
  LoginSchema,
  RegisterSchema,
} from '../../../validators.js';
import * as authController from './auth.controller.js';

const router = express.Router();

router.post('/register', validateBody(RegisterSchema), authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/forgot-password', validateBody(EmailSchema), authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-verification', authController.resendVerification);
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);

export default router;
