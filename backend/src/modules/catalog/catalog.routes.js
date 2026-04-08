import express from 'express';
import * as catalogController from './catalog.controller.js';

const router = express.Router();

router.get('/', catalogController.getProducts);

export default router;
