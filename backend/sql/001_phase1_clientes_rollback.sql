-- Rollback Fase 1: clientes/suscripciones/carrito
-- Ejecutar SOLO si necesitas revertir la fase.

ALTER TABLE orders DROP FOREIGN KEY fk_orders_subscription;
ALTER TABLE orders DROP FOREIGN KEY fk_orders_customer;

DROP INDEX idx_orders_subscription_id ON orders;
DROP INDEX idx_orders_customer_id ON orders;

ALTER TABLE orders DROP COLUMN subscription_id;
ALTER TABLE orders DROP COLUMN customer_id;

DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS customer_addresses;
DROP TABLE IF EXISTS customers;
