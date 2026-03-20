-- Fase 1: esquema base clientes/suscripciones/carrito
-- Ejecutar en MySQL (XAMPP) sobre DB ruta_del_nido

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  label VARCHAR(80) DEFAULT 'casa',
  address_line VARCHAR(255) NOT NULL,
  commune VARCHAR(120),
  region VARCHAR(120) DEFAULT 'Región Metropolitana',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_addresses_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  plan_code ENUM('personal', 'home_chef', 'resto_pro') NOT NULL,
  egg_type ENUM('blanco_extra', 'gallina_libre', 'omega_3') NOT NULL,
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  monthly_price DECIMAL(10,0) NOT NULL,
  next_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscriptions_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_cart_customer_product UNIQUE (customer_id, product_id),
  CONSTRAINT fk_cart_items_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id INT NULL AFTER customer_phone,
  ADD COLUMN IF NOT EXISTS subscription_id INT NULL AFTER product_id;

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_subscription_id ON orders(subscription_id);

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id)
  ON DELETE SET NULL;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_subscription
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  ON DELETE SET NULL;
