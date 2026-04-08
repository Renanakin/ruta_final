import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { getDb } from '../../config/db.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { IdParamSchema, ProfileUpdateSchema, SubscriptionCreateSchema } from '../../../validators.js';
import { getUserOrders } from '../orders/orders.service.js';

const router = express.Router();

const updateSubscription = async (req, res, next) => {
  try {
    const db = getDb();
    const { plan_code, egg_type, status, next_delivery_date, notes } = req.body;
    await db.run(
      'UPDATE subscriptions SET plan_code = ?, egg_type = ?, status = ?, next_delivery_date = ?, notes = ? WHERE id = ? AND user_id = ?',
      [plan_code, egg_type, status, next_delivery_date || null, notes || null, req.params.id, req.user.id]
    );
    const sub = await db.get('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (!sub) {
      return res.status(404).json({ success: false, error: 'Suscripcion no encontrada' });
    }

    return res.json({ success: true, subscription: sub });
  } catch (error) {
    return next(error);
  }
};

router.get('/profile', protect, async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', protect, validateBody(ProfileUpdateSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const { full_name, phone } = req.body;

    await db.run(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name, phone || null, req.user.id]
    );

    const updatedUser = await db.get(
      'SELECT id, email, full_name, phone, email_verified FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, profile: updatedUser });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', protect, async (req, res, next) => {
  try {
    const orders = await getUserOrders(req.user.id);
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.get('/subscription', protect, async (req, res, next) => {
  try {
    const db = getDb();
    const sub = await db.get('SELECT * FROM subscriptions WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, subscription: sub || null });
  } catch (error) {
    next(error);
  }
});

router.post('/subscription', protect, validateBody(SubscriptionCreateSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const { plan_code, egg_type, status, next_delivery_date, notes } = req.body;

    const existing = await db.get('SELECT id FROM subscriptions WHERE user_id = ?', [req.user.id]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'El usuario ya tiene una suscripcion' });
    }

    const result = await db.run(
      `INSERT INTO subscriptions (user_id, plan_code, egg_type, status, next_delivery_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, plan_code, egg_type, status, next_delivery_date || null, notes || null]
    );

    const sub = await db.get('SELECT * FROM subscriptions WHERE id = ?', [result.lastID]);
    res.status(201).json({ success: true, subscription: sub });
  } catch (error) {
    next(error);
  }
});

router.put('/subscription/:id', protect, validateParams(IdParamSchema), validateBody(SubscriptionCreateSchema), updateSubscription);
router.patch('/subscription/:id', protect, validateParams(IdParamSchema), validateBody(SubscriptionCreateSchema), updateSubscription);

export default router;
