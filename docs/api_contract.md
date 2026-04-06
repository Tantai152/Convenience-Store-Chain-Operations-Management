# API Contract — Convenience Store Chain

> **Base URL (local):** `http://localhost:3001/api`
> **Base URL (production):** `https://your-app.onrender.com/api`
>
> All protected routes require this header:
> ```
> Authorization: Bearer <token>
> ```
> All request/response bodies are `Content-Type: application/json`.

---

## Table of Contents

- [Auth](#auth)
- [Branches](#branches)
- [Employees](#employees)
- [Products & Inventory](#products--inventory)
- [Orders & Sales](#orders--sales)
- [Dashboard](#dashboard)

---

## ===================Authentication===================

### - - POST /auth/login

Login and receive a JWT token.

- Auth: Public — no token required

**Request body**
```json
{
  "email": "admin@store.com",
  "password": "123456"
}
```

**Success `200`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@store.com",
    "role": "admin"
  }
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"Email and password are required"` | Missing fields |
| `401` | `"Invalid email or password"` | Wrong credentials |

---

### - - POST /auth/logout

Logout — FE deletes token from localStorage. No BE action needed.

- Auth: Protected

**Success `200`**
```json
{ "message": "Logged out successfully" }
```

---

## ===================Branches===================

### - - GET /branches

Get all store branches.

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
[
  {
    "id": 1,
    "name": "Branch A - District 1",
    "address": "123 Nguyen Hue, D1, HCMC",
    "manager": "Nguyen Van A",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### - GET /branches/:id

Get a single branch by ID.

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
{
  "id": 1,
  "name": "Branch A - District 1",
  "address": "123 Nguyen Hue, D1, HCMC",
  "manager": "Nguyen Van A",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `404` | `"Branch not found"` | ID does not exist |

---

### - POST /branches

Create a new branch.

- Auth: Protected
- Roles: admin

**Request body**
```json
{
  "name": "Branch B - District 3",
  "address": "456 Vo Van Tan, D3, HCMC",
  "manager": "Tran Thi B"
}
```

**Success `201`**
```json
{
  "id": 2,
  "name": "Branch B - District 3",
  "address": "456 Vo Van Tan, D3, HCMC",
  "manager": "Tran Thi B",
  "status": "active",
  "created_at": "2024-01-10T00:00:00Z"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"Name and address are required"` | Missing required fields |
| `409` | `"Branch name already exists"` | Duplicate name |

---

### - PUT /branches/:id

Update an existing branch.

- Auth: Protected
- Roles: admin

**Request body** *(send only fields you want to update)*
```json
{
  "name": "Branch B - District 3 (Updated)",
  "address": "789 New Street, D3, HCMC",
  "manager": "Le Van C"
}
```

**Success `200`**
```json
{
  "id": 2,
  "name": "Branch B - District 3 (Updated)",
  "address": "789 New Street, D3, HCMC",
  "manager": "Le Van C",
  "status": "active",
  "created_at": "2024-01-10T00:00:00Z"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `404` | `"Branch not found"` | ID does not exist |

---

### - DELETE /branches/:id

Deactivate a branch (soft delete — sets `status = inactive`).

- Auth: Protected
- Roles: admin

**Success `200`**
```json
{ "message": "Branch deactivated successfully" }
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `404` | `"Branch not found"` | ID does not exist |

---

## ===================Employees===================

### - GET /employees

Get all employees. Filter by branch using query param.

- Auth: Protected
- Roles: admin, manager

**Query params**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `store_id` | number | No | Filter by branch ID |

**Example:** `GET /employees?store_id=1`

**Success `200`**
```json
[
  {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "nva@store.com",
    "role": "staff",
    "store_id": 1,
    "store_name": "Branch A - District 1",
    "shift": "morning",
    "status": "active"
  }
]
```

---

### - POST /employees

Add a new employee.

- Auth: Protected
- Roles: admin, manager

**Request body**
```json
{
  "name": "Tran Thi B",
  "email": "ttb@store.com",
  "role": "staff",
  "store_id": 1,
  "shift": "evening"
}
```

> `role` must be one of: `admin` `manager` `staff`
> `shift` must be one of: `morning` `afternoon` `evening`

**Success `201`**
```json
{
  "id": 2,
  "name": "Tran Thi B",
  "email": "ttb@store.com",
  "role": "staff",
  "store_id": 1,
  "shift": "evening",
  "status": "active"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"All fields are required"` | Missing fields |
| `400` | `"Invalid role"` | Role not in allowed list |
| `409` | `"Email already exists"` | Duplicate email |

---

### - PUT /employees/:id

Update employee info (role or shift).

- Auth: Protected
- Roles: admin, manager

**Request body**
```json
{
  "role": "manager",
  "shift": "morning"
}
```

**Success `200`**
```json
{
  "id": 2,
  "name": "Tran Thi B",
  "email": "ttb@store.com",
  "role": "manager",
  "store_id": 1,
  "shift": "morning",
  "status": "active"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `404` | `"Employee not found"` | ID does not exist |

---

### - DELETE /employees/:id

Deactivate an employee (soft delete).

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
{ "message": "Employee deactivated successfully" }
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `404` | `"Employee not found"` | ID does not exist |

---

## ===================Products & Inventory===================

### - GET /products

Get all products with current stock level.

- Auth: Protected
- Roles: admin, manager, staff

**Success `200`**
```json
[
  {
    "id": 1,
    "name": "Coca Cola 330ml",
    "category": "Beverages",
    "price": 12000,
    "current_stock": 45,
    "stock_threshold": 10,
    "stock_status": "ok"
  }
]
```

> `stock_status` is computed by BE:
> - `"ok"` — current_stock >= threshold
> - `"low"` — current_stock < threshold and > 0
> - `"critical"` — current_stock = 0

---

### - POST /products

Add a new product.

- Auth: Protected
- Roles: admin, manager

**Request body**
```json
{
  "name": "Pepsi 330ml",
  "category": "Beverages",
  "price": 11000,
  "stock_threshold": 10
}
```

**Success `201`**
```json
{
  "id": 2,
  "name": "Pepsi 330ml",
  "category": "Beverages",
  "price": 11000,
  "current_stock": 0,
  "stock_threshold": 10,
  "stock_status": "critical"
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"Name and price are required"` | Missing fields |
| `409` | `"Product already exists"` | Duplicate name |

---

### - PUT /products/:id

Update product info (name, price, threshold).

- Auth: Protected
- Roles: admin, manager

**Request body**
```json
{
  "price": 13000,
  "stock_threshold": 15
}
```

**Success `200`**
```json
{
  "id": 1,
  "name": "Coca Cola 330ml",
  "category": "Beverages",
  "price": 13000,
  "current_stock": 45,
  "stock_threshold": 15,
  "stock_status": "ok"
}
```

---

### - PUT /products/:id/stock

Update stock quantity (restock).

- Auth: Protected
- Roles: admin, manager

**Request body**
```json
{
  "quantity": 50
}
```

> `quantity` replaces the current stock value (it is NOT added on top).

**Success `200`**
```json
{
  "id": 1,
  "name": "Coca Cola 330ml",
  "current_stock": 50,
  "stock_status": "ok"
}
```

---

### - GET /inventory/alerts

Get all products where stock is below threshold.

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
[
  {
    "id": 3,
    "name": "Red Bull 250ml",
    "category": "Beverages",
    "current_stock": 2,
    "stock_threshold": 10,
    "stock_status": "low"
  }
]
```

---

## ===================Orders & Sales===================

### - GET /orders

Get the 50 most recent orders.

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
[
  {
    "id": 1,
    "store_id": 1,
    "store_name": "Branch A - District 1",
    "total_amount": 45000,
    "created_at": "2024-01-15T08:30:00Z",
    "items": [
      {
        "product_id": 1,
        "product_name": "Coca Cola 330ml",
        "quantity": 2,
        "unit_price": 12000
      },
      {
        "product_id": 3,
        "product_name": "Red Bull 250ml",
        "quantity": 1,
        "unit_price": 21000
      }
    ]
  }
]
```

---

### - POST /orders

Create a new order. Also updates inventory stock automatically.

- Auth: Protected
- Roles: admin, manager, staff

**Request body**
```json
{
  "store_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

**Success `201`**
```json
{
  "id": 10,
  "store_id": 1,
  "total_amount": 45000,
  "created_at": "2024-01-15T08:30:00Z",
  "items": [
    { "product_id": 1, "product_name": "Coca Cola 330ml", "quantity": 2, "unit_price": 12000 },
    { "product_id": 3, "product_name": "Red Bull 250ml", "quantity": 1, "unit_price": 21000 }
  ]
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"Items array is required"` | No items sent |
| `400` | `"Insufficient stock for product {id}"` | Stock < requested quantity |
| `404` | `"Product {id} not found"` | Invalid product_id |

---

### - GET /sales

Get aggregated revenue data. Use `period` query param to select range.

- Auth: Protected
- Roles: admin, manager

**Query params**
| Param | Type | Required | Values |
|-------|------|----------|--------|
| `period` | string | Yes | `daily` `weekly` `monthly` |

**Example:** `GET /sales?period=daily`

**Success `200` — daily**
```json
{
  "period": "daily",
  "data": [
    { "date": "2024-01-15", "revenue": 450000, "order_count": 12 },
    { "date": "2024-01-14", "revenue": 380000, "order_count": 9 },
    { "date": "2024-01-13", "revenue": 520000, "order_count": 15 }
  ],
  "total_revenue": 1350000,
  "total_orders": 36
}
```

**Success `200` — weekly**
```json
{
  "period": "weekly",
  "data": [
    { "week": "2024-W03", "revenue": 2800000, "order_count": 75 },
    { "week": "2024-W02", "revenue": 3100000, "order_count": 88 }
  ],
  "total_revenue": 5900000,
  "total_orders": 163
}
```

**Success `200` — monthly**
```json
{
  "period": "monthly",
  "data": [
    { "month": "2024-01", "revenue": 12000000, "order_count": 320 },
    { "month": "2023-12", "revenue": 10500000, "order_count": 285 }
  ],
  "total_revenue": 22500000,
  "total_orders": 605
}
```

**Errors**
| Status | Message | When |
|--------|---------|------|
| `400` | `"period must be daily, weekly, or monthly"` | Invalid param value |

---

## ===================Dashboard===================

### - GET /dashboard

Get all KPI data for the dashboard in one request.

- Auth: Protected
- Roles: admin, manager

**Success `200`**
```json
{
  "total_stores": 5,
  "total_products": 48,
  "low_stock_count": 6,
  "today_orders_count": 23,
  "top_products": [
    { "product_id": 1, "product_name": "Coca Cola 330ml", "total_sold": 320 },
    { "product_id": 3, "product_name": "Red Bull 250ml", "total_sold": 210 }
  ],
  "weekly_sales": [
    { "date": "2024-01-15", "revenue": 450000 },
    { "date": "2024-01-14", "revenue": 380000 },
    { "date": "2024-01-13", "revenue": 520000 },
    { "date": "2024-01-12", "revenue": 290000 },
    { "date": "2024-01-11", "revenue": 610000 },
    { "date": "2024-01-10", "revenue": 430000 },
    { "date": "2024-01-09", "revenue": 370000 }
  ]
}
```

---

## Common Error Responses

These apply to all protected routes:

| Status | Message | When |
|--------|---------|------|
| `401` | `"No token provided"` | Authorization header missing |
| `401` | `"Invalid or expired token"` | Token is wrong or expired |
| `403` | `"Access denied"` | Role does not have permission |
| `500` | `"Internal server error"` | Unexpected server error |

---