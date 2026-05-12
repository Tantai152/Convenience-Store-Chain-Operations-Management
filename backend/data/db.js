// In-memory data store for demo / testing
const { addDays } = require('../utils/dateUtils');

// Stores (branches)
const stores = [
  { id: 1, name: 'CS Chain Quận 1', address: '123 Nguyễn Huệ, Q.1', is_active: true },
  { id: 2, name: 'CS Chain Quận 3', address: '45 Võ Văn Tần, Q.3', is_active: true },
  { id: 3, name: 'CS Chain Bình Thạnh', address: '789 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh', is_active: false },
];

// Products
const products = [
  { id: 1, name: 'Coca Cola 330ml', category: 'Beverage', price: 15000, current_stock: 50, threshold: 20 },
  { id: 2, name: 'Pepsi 330ml', category: 'Beverage', price: 15000, current_stock: 5, threshold: 20 },
  { id: 3, name: 'Aquafina 500ml', category: 'Beverage', price: 8000, current_stock: 0, threshold: 30 },
  { id: 4, name: 'Mì Hảo Hảo', category: 'Food', price: 5000, current_stock: 100, threshold: 50 },
  { id: 5, name: 'Bánh Kinh Đô', category: 'Snack', price: 22000, current_stock: 10, threshold: 15 },
];

// Employees
const employees = [
  { id: 1, email: 'admin@cschain.vn', full_name: 'Nguyễn Admin', role: 'admin', store_id: null, store_name: null, shift: 'morning', is_active: true, created_at: '2024-01-01' },
  { id: 2, email: 'manager1@cschain.vn', full_name: 'Trần Văn Quản', role: 'manager', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'morning', is_active: true, created_at: '2024-01-10' },
  { id: 3, email: 'staff1@cschain.vn', full_name: 'Lê Thị Hương', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'afternoon', is_active: true, created_at: '2024-02-12' },
  { id: 4, email: 'staff2@cschain.vn', full_name: 'Phạm Văn B', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'night', is_active: true, created_at: '2024-03-05' },
];

// Orders - generate sample orders for recent 90 days
const orders = [];
(function seedOrders() {
  const now = new Date();
  let id = 1;
  for (let d = 0; d < 30; d++) {
    const date = addDays(now, -d).toISOString();
    // create 1-3 orders per day
    const perDay = (d % 3) + 1;
    for (let j = 0; j < perDay; j++) {
      const items = [];
      const count = (j % 3) + 1;
      let total = 0;
      for (let k = 0; k < count; k++) {
        const p = products[(id + k) % products.length];
        const qty = ((id + k) % 4) + 1;
        items.push({ product_id: p.id, name: p.name, quantity: qty, price: p.price });
        total += p.price * qty;
      }
      orders.push({ id: id++, items, total, created_at: date });
    }
  }
})();

module.exports = {
  stores,
  products,
  employees,
  orders,
};

// saveData is a no-op in this demo (keeps API calls compatible with code that expects persistence)
module.exports.saveData = function(updated) {
  // In a real app we'd persist to disk or DB. Here we simply merge keys for compatibility.
  if (!updated || typeof updated !== 'object') return;
  Object.keys(updated).forEach(k => {
    if (module.exports[k] && Array.isArray(module.exports[k]) && Array.isArray(updated[k])) {
      // replace array contents
      module.exports[k].length = 0;
      updated[k].forEach(item => module.exports[k].push(item));
    } else {
      module.exports[k] = updated[k];
    }
  });
};
