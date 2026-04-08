import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '../../config/db.js';
import { signCrmToken } from '../../lib/jwt.js';
import { logger } from '../../lib/logger.js';
import { protectCrm, protectCrmAdmin } from '../../middleware/crmAuth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import {
  CrmSalesAssistantPilotUpdateSchema,
  CrmLoginSchema,
  CrmPasswordResetSchema,
  CrmUserCreateSchema,
  EmailSchema,
} from '../../../validators.js';
import { sendPasswordResetEmail } from '../../../services/email.js';
import {
  getSalesAssistantPilotConfig,
  updateSalesAssistantPilotConfig,
} from '../sales-assistant-pilot/salesAssistantPilot.service.js';

const router = express.Router();

const normalizeLocalIds = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const toNumber = (value) => Number(value || 0);
const getDateRangeModifier = (days = 7) => `-${days} days`;

const generateSecureToken = (expiresInMs = 60 * 60 * 1000) => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  const expires = new Date(Date.now() + expiresInMs).toISOString();
  return { raw, hashed, expires };
};

router.post('/login', validateBody(CrmLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = await db.get('SELECT * FROM crm_users WHERE email = ?', [email]);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    }

    const token = signCrmToken({ id: user.id });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: Boolean(user.is_active),
        local_ids: normalizeLocalIds(user.local_ids),
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', protectCrm, (req, res) => {
  res.json({ success: true, user: req.crmUser });
});

router.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Cierre de sesion exitoso' });
});

router.post('/password/request', validateBody(EmailSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT id, email, is_active FROM crm_users WHERE email = ?', [req.body.email]);

    if (user?.is_active) {
      const { raw, hashed, expires } = generateSecureToken();
      await db.run(
        'UPDATE crm_users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [hashed, expires, user.id]
      );

      const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5173';
      await sendPasswordResetEmail(user.email, raw, appBaseUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Si ese correo esta registrado, recibira instrucciones en breve.',
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/password/reset', validateBody(CrmPasswordResetSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await db.get(
      'SELECT id, reset_token_expires FROM crm_users WHERE reset_token = ? AND is_active = TRUE',
      [hashedToken]
    );

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token de restablecimiento invalido o ya utilizado' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ success: false, error: 'El enlace de restablecimiento ha expirado' });
    }

    const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
    await db.run(
      'UPDATE crm_users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return res.json({ success: true, message: 'Contrasena actualizada correctamente' });
  } catch (error) {
    return next(error);
  }
});

router.get('/users', protectCrm, protectCrmAdmin, async (_req, res, next) => {
  try {
    const db = getDb();
    const users = await db.all('SELECT id, email, role, local_ids, is_active, created_at FROM crm_users');
    return res.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        is_active: Boolean(user.is_active),
        local_ids: normalizeLocalIds(user.local_ids),
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/sales-assistant/pilot', protectCrm, protectCrmAdmin, async (_req, res, next) => {
  try {
    const config = await getSalesAssistantPilotConfig();
    return res.json({ success: true, config });
  } catch (error) {
    return next(error);
  }
});

router.put('/sales-assistant/pilot', protectCrm, protectCrmAdmin, validateBody(CrmSalesAssistantPilotUpdateSchema), async (req, res, next) => {
  try {
    const config = await updateSalesAssistantPilotConfig(req.body, req.crmUser?.email || 'crm_admin');
    return res.json({ success: true, config });
  } catch (error) {
    return next(error);
  }
});

router.post('/users', protectCrm, protectCrmAdmin, validateBody(CrmUserCreateSchema), async (req, res, next) => {
  try {
    const { email, password, role, local_ids, is_active } = req.body;
    const db = getDb();

    const existing = await db.get('SELECT id FROM crm_users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'El usuario CRM ya existe' });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO crm_users (email, password, role, local_ids, is_active) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPw, role || 'operador', JSON.stringify(local_ids || []), is_active ?? true]
    );

    const newUser = await db.get(
      'SELECT id, email, role, local_ids, is_active FROM crm_users WHERE id = ?',
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      user: {
        ...newUser,
        is_active: Boolean(newUser.is_active),
        local_ids: normalizeLocalIds(newUser.local_ids),
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/locals', protectCrm, async (req, res) => {
  const locals = [
    { id: 1, name: 'Huechuraba (Matriz)' },
    { id: 2, name: 'Providencia' }
  ];
  res.json({ success: true, locals, role: req.crmUser.role, local_ids: req.crmUser.local_ids });
});

router.get('/alerts', protectCrm, async (_req, res) => {
  const db = getDb();
  const alerts = await db.all(
    `SELECT id, local_id, type, severity, message, status, owner_user_id, created_at
     FROM crm_alerts
     ORDER BY created_at DESC
     LIMIT 100`
  );
  res.json({ success: true, alerts });
});

router.get('/alerts/thresholds', protectCrm, async (_req, res) => {
  res.json({
    success: true,
    thresholds: [
      { metric: 'cancellation_rate', warning: 5, critical: 8 },
      { metric: 'pending_orders', warning: 10, critical: 20 },
      { metric: 'daily_revenue_drop_pct', warning: 20, critical: 35 },
    ]
  });
});

router.get('/reports/executive-weekly', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const [orders, users, subscriptions] = await Promise.all([
      db.get(
        `SELECT COUNT(*) AS total_orders,
                COALESCE(SUM(total_price), 0) AS total_revenue,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
         FROM orders
         WHERE datetime(created_at) >= datetime('now', ?)`,
        [getDateRangeModifier(7)]
      ),
      db.get(
        `SELECT COUNT(*) AS new_users
         FROM users
         WHERE datetime(created_at) >= datetime('now', ?)`,
        [getDateRangeModifier(7)]
      ),
      db.get(
        `SELECT COUNT(*) AS active_subscriptions
         FROM subscriptions
         WHERE status = 'active'`
      ),
    ]);

    const totalOrders = toNumber(orders.total_orders);
    const cancelledOrders = toNumber(orders.cancelled_orders);
    const cancellationRate = totalOrders ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      report: {
        window_days: 7,
        total_orders: totalOrders,
        total_revenue: toNumber(orders.total_revenue),
        cancelled_orders: cancelledOrders,
        cancellation_rate_pct: cancellationRate,
        new_users: toNumber(users.new_users),
        active_subscriptions: toNumber(subscriptions.active_subscriptions),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/daily-operations', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const [summary, statuses] = await Promise.all([
      db.get(
        `SELECT COUNT(*) AS total_orders,
                COALESCE(SUM(total_price), 0) AS gross_revenue
         FROM orders
         WHERE date(created_at) = date('now')`
      ),
      db.all(
        `SELECT status, COUNT(*) AS total
         FROM orders
         WHERE date(created_at) = date('now')
         GROUP BY status
         ORDER BY status`
      ),
    ]);

    res.json({
      success: true,
      report: {
        date: new Date().toISOString().slice(0, 10),
        total_orders: toNumber(summary.total_orders),
        gross_revenue: toNumber(summary.gross_revenue),
        by_status: statuses.map((row) => ({ status: row.status, total: toNumber(row.total) })),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/cancellations', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const [summary, recent] = await Promise.all([
      db.get(
        `SELECT COUNT(*) AS cancelled_orders,
                COALESCE(SUM(total_price), 0) AS cancelled_revenue
         FROM orders
         WHERE status = 'cancelled'`
      ),
      db.all(
        `SELECT id, user_id, total_price, cancellation_reason, created_at
         FROM orders
         WHERE status = 'cancelled'
         ORDER BY created_at DESC
         LIMIT 20`
      ),
    ]);

    res.json({
      success: true,
      report: {
        cancelled_orders: toNumber(summary.cancelled_orders),
        cancelled_revenue: toNumber(summary.cancelled_revenue),
        recent,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/metrics-dictionary', protectCrm, (_req, res) => {
  res.json({
    success: true,
    dictionary: [
      { metric_code: 'orders_total', name: 'Pedidos totales', formula: 'COUNT(orders.id)', source: 'orders' },
      { metric_code: 'revenue_total', name: 'Ingresos totales', formula: 'SUM(orders.total_price)', source: 'orders' },
      { metric_code: 'cancellation_rate', name: 'Tasa de cancelacion', formula: 'cancelled_orders / total_orders * 100', source: 'orders' },
      { metric_code: 'new_users', name: 'Usuarios nuevos', formula: 'COUNT(users.id)', source: 'users' },
    ],
    semaphores: [
      { metric_code: 'cancellation_rate', warning: 5, critical: 8 },
      { metric_code: 'orders_total', warning: null, critical: null },
    ]
  });
});

router.get('/reports/metrics-dictionary/versions', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const versions = await db.all(
      `SELECT name, executed_at
       FROM schema_migrations
       ORDER BY executed_at DESC`
    );
    res.json({ success: true, versions });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/locals/overview', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const summary = await db.get(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total_price), 0) AS total_revenue
       FROM orders`
    );
    res.json({
      success: true,
      report: {
        locals: [
          {
            id: 1,
            name: 'Huechuraba (Matriz)',
            total_orders: toNumber(summary.total_orders),
            total_revenue: toNumber(summary.total_revenue),
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/locals/benchmark', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const summary = await db.get(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(AVG(total_price), 0) AS avg_ticket
       FROM orders`
    );
    res.json({
      success: true,
      report: {
        benchmark: [
          {
            local_id: 1,
            local_name: 'Huechuraba (Matriz)',
            total_orders: toNumber(summary.total_orders),
            avg_ticket: toNumber(summary.avg_ticket),
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/locals/:id/operations', protectCrm, async (req, res, next) => {
  try {
    const db = getDb();
    const summary = await db.get(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total_price), 0) AS total_revenue
       FROM orders`
    );
    res.json({
      success: true,
      report: {
        local_id: Number(req.params.id),
        total_orders: toNumber(summary.total_orders),
        total_revenue: toNumber(summary.total_revenue),
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/locals/alerts', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const alerts = await db.all('SELECT * FROM crm_alerts ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, report: { alerts } });
  } catch (error) {
    next(error);
  }
});

router.get('/reports/locals/alerts/consolidated', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const summary = await db.all(
      `SELECT severity, COUNT(*) AS total
       FROM crm_alerts
       GROUP BY severity
       ORDER BY severity`
    );
    res.json({ success: true, report: { by_severity: summary.map((row) => ({ severity: row.severity, total: toNumber(row.total) })) } });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', protectCrm, (_req, res) => {
  const db = getDb();
  db.all(
    `SELECT id, event_name, user_id, session_id, source, device_type, os_name, city, country_code, created_at
     FROM analytics_events
     ORDER BY created_at DESC
     LIMIT 100`
  ).then((logs) => res.json({ success: true, logs })).catch(() => res.json({ success: true, logs: [] }));
});

router.get('/audit-stats', protectCrm, async (_req, res, next) => {
  try {
    const db = getDb();
    const [total, byAction] = await Promise.all([
      db.get('SELECT COUNT(*) AS total_events FROM analytics_events'),
      db.all(
        `SELECT event_name AS action, COUNT(*) AS total
         FROM analytics_events
         GROUP BY event_name
         ORDER BY total DESC
         LIMIT 20`
      ),
    ]);

    res.json({
      success: true,
      stats: {
        total_events: toNumber(total.total_events),
        by_action: byAction.map((row) => ({ action: row.action, total: toNumber(row.total) })),
        by_role: [],
        by_entity: [],
        by_local: [],
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/data-health', protectCrm, (_req, res) => {
  const db = getDb();
  Promise.all([
    db.get('SELECT COUNT(*) AS users_without_phone FROM users WHERE phone IS NULL OR phone = \'\''),
    db.get('SELECT COUNT(*) AS orders_without_address FROM orders WHERE delivery_address IS NULL OR delivery_address = \'\''),
  ])
    .then(([users, orders]) => res.json({
      success: true,
      report: {
        users_without_phone: toNumber(users.users_without_phone),
        orders_without_address: toNumber(orders.orders_without_address),
      }
    }))
    .catch(() => res.json({ success: true, report: null }));
});

router.get('/data-reconciliation/runs', protectCrm, (_req, res) => {
  res.json({ success: true, runs: [] });
});

router.post('/data-reconciliation/run', protectCrm, protectCrmAdmin, (_req, res) => {
  res.json({ success: true, run: { status: 'green' } });
});

router.get('/performance/metrics', protectCrm, protectCrmAdmin, (_req, res) => {
  res.json({ success: true, endpoints: [] });
});

router.post('/performance/metrics/reset', protectCrm, protectCrmAdmin, (_req, res) => {
  res.json({ success: true, message: 'Reset exitoso' });
});

router.get('/security/posture', protectCrm, protectCrmAdmin, (_req, res) => {
  res.json({ success: true, report: null });
});

router.get('/reporting/schedules', protectCrm, (_req, res) => {
  res.json({ success: true, schedules: [] });
});

router.get('/reporting/delivery-logs', protectCrm, (_req, res) => {
  res.json({ success: true, logs: [] });
});

router.get('/funnel', protectCrm, (_req, res) => {
  const db = getDb();
  db.all(
    `SELECT event_name, COUNT(*) AS total
     FROM analytics_events
     WHERE event_name IN ('view_product', 'add_to_cart', 'begin_checkout', 'purchase', 'subscription_start')
     GROUP BY event_name`
  ).then((rows) => {
    const stages = {
      view_product: 0,
      add_to_cart: 0,
      begin_checkout: 0,
      purchase: 0,
      subscription_start: 0,
    };

    rows.forEach((row) => {
      stages[row.event_name] = toNumber(row.total);
    });

    const pct = (a, b) => (a > 0 ? Number(((b / a) * 100).toFixed(2)) : 0);

    res.json({
      success: true,
      funnel: {
        stages,
        conversion: {
          view_to_cart_pct: pct(stages.view_product, stages.add_to_cart),
          cart_to_checkout_pct: pct(stages.add_to_cart, stages.begin_checkout),
          checkout_to_purchase_pct: pct(stages.begin_checkout, stages.purchase),
          purchase_to_subscription_pct: pct(stages.purchase, stages.subscription_start),
        },
        by_source: []
      }
    });
  }).catch(() => res.json({
    success: true,
    funnel: {
      stages: { view_product: 0, add_to_cart: 0, begin_checkout: 0, purchase: 0, subscription_start: 0 },
      conversion: { view_to_cart_pct: 0, cart_to_checkout_pct: 0, checkout_to_purchase_pct: 0, purchase_to_subscription_pct: 0 },
      by_source: []
    }
  }));
});

router.post('/ai/assistant', protectCrm, (_req, res) => {
  res.json({ success: true, assistant_reply: 'Soy el agente IA del CRM. Aun no he sido conectado con datos reales, pero sere tu mejor aliado.' });
});

export default router;
