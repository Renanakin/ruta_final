import express from 'express';
import { getDb } from '../../config/db.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validate.middleware.js';
import { CartItemSchema, CartPatchSchema, CheckoutSchema, IdParamSchema } from '../../../validators.js';

const router = express.Router();

const getCartResponse = async (db, userId) => {
  const items = await db.all(`
    SELECT c.id as id, c.id as cart_item_id, p.id as product_id, p.name as product_name, p.price, p.image, c.quantity
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
  `, [userId]);

  let total_items = 0;
  let subtotal = 0;

  items.forEach((item) => {
    total_items += item.quantity;
    item.subtotal = item.price * item.quantity;
    subtotal += item.subtotal;
  });

  return { items, summary: { total_items, subtotal } };
};

const updateCartItem = async (req, res, next) => {
  try {
    const db = getDb();
    const { quantity } = req.body;

    if (quantity === 0) {
      await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    } else {
      await db.run(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, req.params.id, req.user.id]
      );
    }

    const cartData = await getCartResponse(db, req.user.id);
    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
};

router.get('/', protect, async (req, res, next) => {
  try {
    const db = getDb();
    const cartData = await getCartResponse(db, req.user.id);
    res.status(200).json(cartData);
  } catch (error) {
    next(error);
  }
});

router.post('/items', protect, validateBody(CartItemSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const { product_id, quantity } = req.body;

    const product = await db.get('SELECT id, price FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    const existing = await db.get(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing) {
      await db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await db.run(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );
    }

    const cartData = await getCartResponse(db, req.user.id);
    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
});

router.put('/items/:id', protect, validateParams(IdParamSchema), validateBody(CartPatchSchema), updateCartItem);
router.patch('/items/:id', protect, validateParams(IdParamSchema), validateBody(CartPatchSchema), updateCartItem);

router.delete('/items/:id', protect, validateParams(IdParamSchema), async (req, res, next) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    const cartData = await getCartResponse(db, req.user.id);
    res.status(200).json({ success: true, ...cartData });
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', protect, validateBody(CheckoutSchema), async (req, res, next) => {
  const db = getDb();

  try {
    await db.exec('BEGIN');
    const { delivery_schedule, delivery_address, notes } = req.body;

    const cartData = await getCartResponse(db, req.user.id);
    if (cartData.items.length === 0) {
      await db.exec('ROLLBACK');
      return res.status(400).json({ success: false, error: 'El carrito esta vacio' });
    }

    const total_price = cartData.summary.subtotal;

    const result = await db.run(
      `INSERT INTO orders (user_id, total_price, status, delivery_address, delivery_schedule, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, total_price, 'pending', delivery_address, delivery_schedule || null, notes || '']
    );

    await Promise.all(cartData.items.map((item) => db.run(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, product_name)
       VALUES (?, ?, ?, ?, ?)`,
      [result.lastID, item.product_id, item.quantity, item.price, item.product_name]
    )));

    await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await db.exec('COMMIT');

    return res.status(200).json({
      success: true,
      order_id: result.lastID,
      orders_count: 1,
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    try {
      await db.exec('ROLLBACK');
    } catch {
      // noop
    }
    return next(error);
  }
});

export default router;
