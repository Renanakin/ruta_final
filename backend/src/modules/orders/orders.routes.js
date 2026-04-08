import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { protectCrm, protectCrmAdmin } from '../../middleware/crmAuth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { IdParamSchema, OrderCreateSchema, OrderUpdateSchema } from '../../../validators.js';
import * as ordersController from './orders.controller.js';

const router = express.Router();

router.post('/', protect, validateBody(OrderCreateSchema), ordersController.createOrder);
router.get('/me', protect, ordersController.getMyOrders);
router.get('/', protectCrm, protectCrmAdmin, ordersController.getAllOrders);
router.patch('/:id', protectCrm, protectCrmAdmin, validateParams(IdParamSchema), validateBody(OrderUpdateSchema), ordersController.updateOrder);

export default router;
