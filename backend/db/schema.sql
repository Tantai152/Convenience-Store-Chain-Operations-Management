-- ============================================================
-- Convenience Store Chain — Database Schema
-- Platform: Supabase (PostgreSQL)
-- ============================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(50) NOT NULL UNIQUE  -- 'admin', 'manager', 'staff'
);

-- 2. STORES (Branches)
CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  address    TEXT,
  manager    VARCHAR(100),
  status     VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'inactive'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,         -- hashed
  role_id    INTEGER REFERENCES roles(id),
  store_id   INTEGER REFERENCES stores(id), -- NULL nếu là admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL UNIQUE,
  category        VARCHAR(50),
  price           NUMERIC(10, 2) NOT NULL,
  current_stock   INTEGER NOT NULL DEFAULT 0,
  stock_threshold INTEGER NOT NULL DEFAULT 10,  -- ngưỡng cảnh báo low stock
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INVENTORY (stock per store — optional detail table)
CREATE TABLE IF NOT EXISTS inventory (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, product_id)
);

-- 6. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  role       VARCHAR(20) NOT NULL DEFAULT 'staff',   -- 'admin', 'manager', 'staff'
  store_id   INTEGER REFERENCES stores(id),
  shift      VARCHAR(20) NOT NULL DEFAULT 'morning', -- 'morning', 'afternoon', 'evening'
  status     VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'inactive'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL PRIMARY KEY,
  store_id     INTEGER REFERENCES stores(id),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL
);

-- 9. SALES (aggregated — optional, có thể tính từ orders)
CREATE TABLE IF NOT EXISTS sales (
  id           SERIAL PRIMARY KEY,
  store_id     INTEGER REFERENCES stores(id),
  date         DATE NOT NULL,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  order_count  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (store_id, date)
);