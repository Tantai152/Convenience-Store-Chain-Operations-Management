-- ============================================================
-- CS Chain — Convenience Store Management System
-- DB Schema FINAL (LOCKED after Day 8)
-- Database: PostgreSQL (Supabase)
-- Owner: BE Dev 1 + BE Dev 2
-- ============================================================

-- -------------------------------------------------------
-- Drop tables in reverse dependency order (for re-runs)
-- -------------------------------------------------------
DROP TABLE IF EXISTS order_items  CASCADE;
DROP TABLE IF EXISTS orders       CASCADE;
DROP TABLE IF EXISTS inventory    CASCADE;
DROP TABLE IF EXISTS employees    CASCADE;
DROP TABLE IF EXISTS products     CASCADE;
DROP TABLE IF EXISTS users        CASCADE;
DROP TABLE IF EXISTS stores       CASCADE;
DROP TABLE IF EXISTS roles        CASCADE;

-- -------------------------------------------------------
-- 1. roles
-- -------------------------------------------------------
CREATE TABLE roles (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(50)  NOT NULL UNIQUE   -- 'admin' | 'manager' | 'staff'
);

-- -------------------------------------------------------
-- 2. stores  (no FK to users yet — users refs stores)
-- -------------------------------------------------------
CREATE TABLE stores (
  id         SERIAL        PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  address    TEXT,
  manager_id INT,                      -- FK added after users table
  is_active  BOOLEAN       NOT NULL DEFAULT true,
  created_at TIMESTAMP     NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 3. users
-- -------------------------------------------------------
CREATE TABLE users (
  id         SERIAL        PRIMARY KEY,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,      -- bcrypt hash
  full_name  VARCHAR(100),
  role_id    INT           NOT NULL REFERENCES roles(id)  ON DELETE RESTRICT,
  store_id   INT                    REFERENCES stores(id) ON DELETE SET NULL,
  is_active  BOOLEAN       NOT NULL DEFAULT true,
  created_at TIMESTAMP     NOT NULL DEFAULT now()
);

-- Now add the deferred FK on stores.manager_id
ALTER TABLE stores
  ADD CONSTRAINT fk_stores_manager
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- -------------------------------------------------------
-- 4. products
-- -------------------------------------------------------
CREATE TABLE products (
  id              SERIAL         PRIMARY KEY,
  name            VARCHAR(100)   NOT NULL,
  category        VARCHAR(50),
  price           DECIMAL(10,2)  NOT NULL CHECK (price >= 0),
  stock_threshold INT            NOT NULL DEFAULT 10,
  created_at      TIMESTAMP      NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 5. inventory  (stock per product per store)
-- -------------------------------------------------------
CREATE TABLE inventory (
  id            SERIAL    PRIMARY KEY,
  product_id    INT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id      INT       NOT NULL REFERENCES stores(id)   ON DELETE CASCADE,
  current_stock INT       NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  updated_at    TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT uq_inventory_product_store UNIQUE (product_id, store_id)
);

-- -------------------------------------------------------
-- 6. employees
-- -------------------------------------------------------
CREATE TABLE employees (
  id         SERIAL        PRIMARY KEY,
  full_name  VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  role       VARCHAR(20)   CHECK (role IN ('manager','staff','cashier')),
  store_id   INT           REFERENCES stores(id)  ON DELETE SET NULL,
  shift      VARCHAR(20)   CHECK (shift IN ('morning','afternoon','night')),
  is_active  BOOLEAN       NOT NULL DEFAULT true,
  created_at TIMESTAMP     NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 7. orders
-- -------------------------------------------------------
CREATE TABLE orders (
  id           SERIAL         PRIMARY KEY,
  store_id     INT            NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  created_by   INT            REFERENCES users(id)           ON DELETE SET NULL,
  total_amount DECIMAL(10,2)  NOT NULL CHECK (total_amount >= 0),
  status       VARCHAR(20)    NOT NULL DEFAULT 'completed'
                              CHECK (status IN ('completed','pending','cancelled')),
  created_at   TIMESTAMP      NOT NULL DEFAULT now()
);

-- -------------------------------------------------------
-- 8. order_items
-- -------------------------------------------------------
CREATE TABLE order_items (
  id         SERIAL         PRIMARY KEY,
  order_id   INT            NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id INT            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INT            NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2)  NOT NULL CHECK (unit_price >= 0)
);

-- -------------------------------------------------------
-- Indexes (performance)
-- -------------------------------------------------------
CREATE INDEX idx_inventory_store   ON inventory  (store_id);
CREATE INDEX idx_inventory_product ON inventory  (product_id);
CREATE INDEX idx_orders_store      ON orders     (store_id);
CREATE INDEX idx_orders_created_at ON orders     (created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_employees_store   ON employees  (store_id);
CREATE INDEX idx_users_store       ON users      (store_id);