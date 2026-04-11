// ============================================================
// CS Chain — Seed Script (clean version)
// Run: node db/seed.js
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── helper ───────────────────────────────────────────────────
async function insert(table, rows) {
  const { error } = await supabase.from(table).insert(rows);
  if (error) {
    console.error(`❌ ${table}:`, error.message);
    process.exit(1);
  }
  console.log(`✅ ${table} — ${rows.length} rows`);
}

// ── utils ─────────────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── main ─────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Seeding database...\n');

  // 1. roles
  await insert('roles', [
    { id: 1, name: 'admin'   },
    { id: 2, name: 'manager' },
    { id: 3, name: 'staff'   },
  ]);

  // 2. stores (manager_id gán sau khi có users)
  await insert('stores', [
    { id: 1, name: 'CS Chain Quận 1',      address: '123 Nguyễn Huệ, Q.1, TP.HCM', is_active: true  },
    { id: 2, name: 'CS Chain Quận 3',      address: '45 Võ Văn Tần, Q.3, TP.HCM',  is_active: true  },
    { id: 3, name: 'CS Chain Bình Thạnh',  address: '88 Xô Viết Nghệ Tĩnh, Q.BT',  is_active: true  },
    { id: 4, name: 'CS Chain Gò Vấp',      address: '210 Quang Trung, Q.GV',        is_active: true  },
    { id: 5, name: 'CS Chain Tân Bình',    address: '55 Hoàng Văn Thụ, Q.TB',       is_active: false },
  ]);

  // 3. users
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  await insert('users', [
    { id: 1, email: 'admin@cschain.vn',    password: hash('Admin@123'),   full_name: 'Nguyễn Admin',  role_id: 1, store_id: null, is_active: true },
    { id: 2, email: 'manager1@cschain.vn', password: hash('Manager@123'), full_name: 'Trần Văn Quản', role_id: 2, store_id: 1,   is_active: true },
    { id: 3, email: 'manager2@cschain.vn', password: hash('Manager@123'), full_name: 'Lê Thị Hương',  role_id: 2, store_id: 2,   is_active: true },
  ]);

  // 4. gán manager_id cho stores
  await supabase.from('stores').update({ manager_id: 2 }).eq('id', 1);
  await supabase.from('stores').update({ manager_id: 3 }).eq('id', 2);
  console.log('✅ stores — manager_id updated');

  // 5. products
  const products = [
    { id:  1, name: 'Coca Cola 330ml',     category: 'Beverage', price: 15000, stock_threshold: 20  },
    { id:  2, name: 'Pepsi 330ml',          category: 'Beverage', price: 15000, stock_threshold: 20  },
    { id:  3, name: 'Nước suối Aquafina',   category: 'Beverage', price:  8000, stock_threshold: 30  },
    { id:  4, name: 'Trà xanh 0° 455ml',   category: 'Beverage', price: 12000, stock_threshold: 25  },
    { id:  5, name: 'Sting dâu 330ml',      category: 'Beverage', price: 12000, stock_threshold: 20  },
    { id:  6, name: 'Mì Hảo Hảo tôm chua', category: 'Food',     price:  5000, stock_threshold: 50  },
    { id:  7, name: 'Bánh mì sandwich',     category: 'Food',     price: 18000, stock_threshold: 15  },
    { id:  8, name: 'Xôi gà hộp',           category: 'Food',     price: 25000, stock_threshold: 10  },
    { id:  9, name: 'Bánh Kinh Đô',         category: 'Food',     price: 22000, stock_threshold: 15  },
    { id: 10, name: 'Cơm hộp văn phòng',    category: 'Food',     price: 35000, stock_threshold:  8  },
    { id: 11, name: 'Kẹo Alpenliebe',       category: 'Snack',    price:  3000, stock_threshold: 100 },
    { id: 12, name: 'Pringles Original',    category: 'Snack',    price: 45000, stock_threshold: 10  },
    { id: 13, name: 'Snack Oishi 40g',      category: 'Snack',    price:  8000, stock_threshold: 30  },
    { id: 14, name: 'Bánh quy Oreo',        category: 'Snack',    price: 16000, stock_threshold: 20  },
    { id: 15, name: 'Hạt điều rang muối',   category: 'Snack',    price: 35000, stock_threshold: 12  },
    { id: 16, name: 'Dầu gội Clear 180ml',  category: 'Personal', price: 38000, stock_threshold:  8  },
    { id: 17, name: 'Kem đánh răng P/S',    category: 'Personal', price: 24000, stock_threshold: 10  },
    { id: 18, name: 'Khăn giấy Bless You',  category: 'Personal', price: 12000, stock_threshold: 15  },
    { id: 19, name: 'Pin AA Panasonic',     category: 'Other',    price: 22000, stock_threshold:  5  },
    { id: 20, name: 'Bao cao su Durex',     category: 'Other',    price: 55000, stock_threshold:  5  },
  ];
  await insert('products', products);

  // 6. inventory (20 products × 5 stores = 100 rows)
  const inventory = [];
  for (let storeId = 1; storeId <= 5; storeId++) {
    for (const p of products) {
      const roll = Math.random();
      let stock;
      if (roll < 0.15)      stock = Math.max(0, p.stock_threshold - 8);          // critical
      else if (roll < 0.30) stock = Math.max(1, p.stock_threshold - Math.floor(p.stock_threshold / 3)); // low
      else                  stock = p.stock_threshold + randInt(0, p.stock_threshold * 3); // ok
      inventory.push({ product_id: p.id, store_id: storeId, current_stock: stock });
    }
  }
  await insert('inventory', inventory);

  // 7. employees
  await insert('employees', [
    { id:  1, full_name: 'Phạm Văn An',     email: 'an.pham@cschain.vn',     role: 'cashier', store_id: 1, shift: 'morning',   is_active: true  },
    { id:  2, full_name: 'Nguyễn Thị Bình', email: 'binh.nguyen@cschain.vn', role: 'staff',   store_id: 1, shift: 'afternoon', is_active: true  },
    { id:  3, full_name: 'Trần Minh Cường', email: 'cuong.tran@cschain.vn',  role: 'cashier', store_id: 2, shift: 'morning',   is_active: true  },
    { id:  4, full_name: 'Lê Thị Dung',     email: 'dung.le@cschain.vn',     role: 'staff',   store_id: 2, shift: 'night',     is_active: true  },
    { id:  5, full_name: 'Hoàng Văn Em',    email: 'em.hoang@cschain.vn',    role: 'cashier', store_id: 3, shift: 'morning',   is_active: true  },
    { id:  6, full_name: 'Vũ Thị Phương',   email: 'phuong.vu@cschain.vn',   role: 'staff',   store_id: 3, shift: 'afternoon', is_active: true  },
    { id:  7, full_name: 'Đặng Văn Giang',  email: 'giang.dang@cschain.vn',  role: 'cashier', store_id: 4, shift: 'night',     is_active: true  },
    { id:  8, full_name: 'Bùi Thị Hoa',     email: 'hoa.bui@cschain.vn',     role: 'staff',   store_id: 4, shift: 'morning',   is_active: true  },
    { id:  9, full_name: 'Đinh Văn Ích',    email: 'ich.dinh@cschain.vn',    role: 'cashier', store_id: 5, shift: 'afternoon', is_active: false },
    { id: 10, full_name: 'Cao Thị Kim',     email: 'kim.cao@cschain.vn',     role: 'staff',   store_id: 5, shift: 'night',     is_active: true  },
  ]);

  // 8. orders + order_items (build cùng lúc, insert orders trước)
  const priceMap  = Object.fromEntries(products.map(p => [p.id, p.price]));
  const statuses  = ['completed', 'completed', 'completed', 'completed', 'pending', 'cancelled'];
  const orderRows = [];
  const itemRows  = [];

  for (let orderId = 1; orderId <= 50; orderId++) {
    const daysAgo   = randInt(0, 29);
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
    const storeId   = (orderId % 5) + 1;
    const createdBy = storeId === 1 ? 2 : storeId === 2 ? 3 : 1;
    const status    = statuses[randInt(0, statuses.length - 1)];
    const pickedIds = shuffle([...Array(20).keys()].map(i => i + 1)).slice(0, randInt(1, 4));

    let total = 0;
    for (const pid of pickedIds) {
      const qty   = randInt(1, 5);
      const price = priceMap[pid];
      total += qty * price;
      itemRows.push({ order_id: orderId, product_id: pid, quantity: qty, unit_price: price });
    }

    orderRows.push({
      id:           orderId,
      store_id:     storeId,
      created_by:   createdBy,
      total_amount: total,
      status,
      created_at:   createdAt,
    });
  }

  await insert('orders', orderRows);
  await insert('order_items', itemRows);

  console.log('\n🎉 Seed hoàn tất! Kết quả:\n');
  console.log('   roles       →  3 rows');
  console.log('   stores      →  5 rows');
  console.log('   users       →  3 rows');
  console.log('   products    → 20 rows');
  console.log('   inventory   → 100 rows');
  console.log('   employees   → 10 rows');
  console.log('   orders      → 50 rows');
  console.log(`   order_items → ${itemRows.length} rows`);
  process.exit(0);
}

seed().catch(err => {
  console.error('\n💥 Lỗi không mong muốn:', err);
  process.exit(1);
});