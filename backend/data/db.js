// In-memory data store for demo / testing
const { addDays } = require('../utils/dateUtils');

// Stores (branches)
const stores = [
  { id: 1, name: 'CS Chain Quận 1', address: '123 Nguyễn Huệ, Q.1', is_active: true },
  { id: 2, name: 'CS Chain Quận 3', address: '45 Võ Văn Tần, Q.3', is_active: true },
  { id: 3, name: 'CS Chain Bình Thạnh', address: '789 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh', is_active: true },
  { id: 4, name: 'CS Chain Thủ Đức', address: '12 Hàn Thuyên, TP. Thủ Đức', is_active: true },
  { id: 5, name: 'CS Chain Tân Bình', address: '102 Cộng Hòa, Q. Tân Bình', is_active: true },
  { id: 6, name: 'CS Chain Gò Vấp', address: '55 Quang Trung, Q. Gò Vấp', is_active: false },
];

// Products
const products = [
  { id: 1, name: 'Coca Cola 330ml', category: 'Beverage', price: 15000, current_stock: 50, threshold: 20 },
  { id: 2, name: 'Pepsi 330ml', category: 'Beverage', price: 15000, current_stock: 5, threshold: 20 },
  { id: 3, name: 'Aquafina 500ml', category: 'Beverage', price: 8000, current_stock: 0, threshold: 30 },
  { id: 4, name: 'Mì Hảo Hảo Tôm Chua Cay', category: 'Food', price: 5000, current_stock: 120, threshold: 50 },
  { id: 5, name: 'Bánh Kinh Đô AFC', category: 'Snack', price: 22000, current_stock: 12, threshold: 15 },
  { id: 6, name: 'Sữa Tươi Vinamilk 180ml', category: 'Beverage', price: 9000, current_stock: 85, threshold: 30 },
  { id: 7, name: 'Khăn Giấy Choice L', category: 'Personal Care', price: 18000, current_stock: 40, threshold: 10 },
  { id: 8, name: 'Xúc Xích Vissan', category: 'Food', price: 12000, current_stock: 60, threshold: 20 },
  { id: 9, name: 'Nước Tương Maggi', category: 'Spice', price: 25000, current_stock: 15, threshold: 10 },
  { id: 10, name: 'Cà Phê Sữa Highland 180ml', category: 'Beverage', price: 16000, current_stock: 25, threshold: 15 },
  { id: 11, name: 'Trà Xanh Không Độ', category: 'Beverage', price: 12000, current_stock: 45, threshold: 20 },
  { id: 12, name: 'Mì Trộn Omachi', category: 'Food', price: 10000, current_stock: 8, threshold: 25 },
];

// Employees
const employees = [
  { id: 1, email: 'admin@cschain.vn', full_name: 'Đặng Hoàng Nguyên', role: 'admin', store_id: null, store_name: null, shift: 'morning', is_active: true, created_at: '2024-01-01' },
  // Store 1: Quận 1
  { id: 2, email: 'thach.pn@cschain.vn', full_name: 'Phạm Ngọc Thạch', role: 'manager', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'morning', is_active: true, created_at: '2024-01-10' },
  { id: 3, email: 'huong.lt@cschain.vn', full_name: 'Lê Thị Hương', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'afternoon', is_active: true, created_at: '2024-02-12' },
  { id: 4, email: 'tai.ntt@cschain.vn', full_name: 'Nguyễn Tất Tấn Tài', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'night', is_active: true, created_at: '2024-03-05' },
  { id: 5, email: 'phu.ntt@cschain.vn', full_name: 'Thái Nguyễn Thanh Phú', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'morning', is_active: true, created_at: '2024-03-15' },
  { id: 6, email: 'chuong.vt@cschain.vn', full_name: 'Vũ Thanh Chương', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'afternoon', is_active: true, created_at: '2024-03-20' },
  { id: 7, email: 'sang.nd@cschain.vn', full_name: 'Nguyễn Đình Sang', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'night', is_active: false, created_at: '2024-03-25' },
  { id: 8, email: 'quan.nph@cschain.vn', full_name: 'Nguyễn Phan Hoàng Quân', role: 'staff', store_id: 1, store_name: 'CS Chain Quận 1', shift: 'morning', is_active: true, created_at: '2024-04-01' },
  // Store 2: Quận 3
  { id: 9, email: 'quan.pn@cschain.vn', full_name: 'Phạm Như Quân', role: 'manager', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'morning', is_active: true, created_at: '2024-01-15' },
  { id: 10, email: 'dung.hv@cschain.vn', full_name: 'Hoàng Văn Dũng', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'afternoon', is_active: true, created_at: '2024-02-20' },
  { id: 11, email: 'lan.tk@cschain.vn', full_name: 'Trần Kim Lan', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'night', is_active: true, created_at: '2024-02-25' },
  { id: 12, email: 'minh.lt@cschain.vn', full_name: 'Lý Tùng Minh', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'morning', is_active: true, created_at: '2024-03-10' },
  { id: 13, email: 'anh.nt@cschain.vn', full_name: 'Nguyễn Tuyết Anh', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'afternoon', is_active: true, created_at: '2024-03-12' },
  { id: 14, email: 'duc.hh@cschain.vn', full_name: 'Hoàng Hồng Đức', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'night', is_active: true, created_at: '2024-03-15' },
  { id: 15, email: 'vy.ttt@cschain.vn', full_name: 'Trần Thị Thu Vy', role: 'staff', store_id: 2, store_name: 'CS Chain Quận 3', shift: 'morning', is_active: true, created_at: '2024-03-18' },
  // Store 3: Bình Thạnh
  { id: 16, email: 'tuan.am@cschain.vn', full_name: 'An Minh Tuấn', role: 'manager', store_id: 3, store_name: 'CS Chain Bình Thạnh', shift: 'morning', is_active: true, created_at: '2024-01-20' },
  { id: 17, email: 'hoa.nt@cschain.vn', full_name: 'Nguyễn Thanh Hoa', role: 'staff', store_id: 3, store_name: 'CS Chain Bình Thạnh', shift: 'afternoon', is_active: true, created_at: '2024-02-22' },
  { id: 18, email: 'loc.pt@cschain.vn', full_name: 'Phan Thành Lộc', role: 'staff', store_id: 3, store_name: 'CS Chain Bình Thạnh', shift: 'night', is_active: true, created_at: '2024-02-28' },
  { id: 19, email: 'trung.vd@cschain.vn', full_name: 'Võ Duy Trung', role: 'staff', store_id: 3, store_name: 'CS Chain Bình Thạnh', shift: 'morning', is_active: false, created_at: '2024-03-05' },
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
  if (!updated || typeof updated !== 'object') return;
  Object.keys(updated).forEach(k => {
    if (module.exports[k] && Array.isArray(module.exports[k]) && Array.isArray(updated[k])) {
      const snapshot = updated[k].slice(); // ← copy trước khi xóa
      module.exports[k].length = 0;
      snapshot.forEach(item => module.exports[k].push(item));
    } else {
      module.exports[k] = updated[k];
    }
  });
};
