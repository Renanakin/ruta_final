CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_alerts_status_created_at ON crm_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE cart_items
  DROP CONSTRAINT IF EXISTS chk_cart_items_quantity_positive;

ALTER TABLE cart_items
  ADD CONSTRAINT chk_cart_items_quantity_positive CHECK (quantity > 0);

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS chk_orders_total_price_non_negative;

ALTER TABLE orders
  ADD CONSTRAINT chk_orders_total_price_non_negative CHECK (total_price >= 0);
