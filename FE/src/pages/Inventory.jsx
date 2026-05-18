/* eslint-disable no-empty */
import { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

function StockBadge({ status }) {
  const s = (status || '').toLowerCase();
  if (s === 'ok')       return <span className="badge-ok">OK</span>;
  if (s === 'low')      return <span className="badge-low">Low Stock</span>;
  if (s === 'critical') return <span className="badge-critical">Critical</span>;
  return <span className="badge-inactive">Unknown</span>;
}

function Tab({ label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px 8px 0 0',
      background: active ? 'var(--navy-card)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      transition: 'all 0.15s',
    }}>
      {label}
      {badge > 0 && (
        <span style={{ marginLeft: 6, background: 'var(--danger)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{badge}</span>
      )}
    </button>
  );
}

// ── TAB 1: Products ───────────────────────────────────────
function TabProducts() {
  const [products, setProducts]     = useState([]);
  const [search, setSearch]         = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [restockId, setRestockId]   = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Beverage', current_stock: '', threshold: '' });
  const productModalRef = useRef(null);
  const restockModalRef = useRef(null);
  const bsProd    = useRef(null);
  const bsRestock = useRef(null);
  const loadProducts = useRef(null);

  useEffect(() => {
    loadProducts.current = async () => {
      try {
        const r = await apiFetch('/products');
        const d = await r.json();
        setProducts(Array.isArray(d) ? d : (d.products || []));
      } catch {}
    };
    loadProducts.current();
    if (productModalRef.current && window.bootstrap) {
      bsProd.current = new window.bootstrap.Modal(productModalRef.current);
      productModalRef.current.addEventListener('hidden.bs.modal', () => {
        setEditingId(null);
        setForm({ name: '', category: 'Beverage', current_stock: '', threshold: '' });
      });
    }
    if (restockModalRef.current && window.bootstrap) {
      bsRestock.current = new window.bootstrap.Modal(restockModalRef.current);
      restockModalRef.current.addEventListener('hidden.bs.modal', () => {
        setRestockId(null); setRestockQty('');
      });
    }
  }, []);

  async function handleProductSubmit(e) {
    e.preventDefault();
    const payload = { ...form, current_stock: parseInt(form.current_stock), threshold: parseInt(form.threshold), price: 1000 };
    try {
      const r = await apiFetch(editingId ? `/products/${editingId}` : '/products', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      if (!r.ok) { const err = await r.json(); alert(err.message || 'Failed'); return; }
      bsProd.current?.hide();
      await loadProducts.current();
    } catch {}
  }

  async function handleRestock(e) {
    e.preventDefault();
    const qty = parseInt(restockQty);
    if (!restockId || isNaN(qty) || qty < 1) { alert('Invalid quantity'); return; }
    try {
      const r = await apiFetch(`/products/${restockId}/stock`, { method: 'PUT', body: JSON.stringify({ quantity: qty }) });
      if (r.ok) { bsRestock.current?.hide(); await loadProducts.current(); return; }
    } catch {}
    alert('Restock failed');
  }

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary-cs" onClick={() => { setEditingId(null); setForm({ name: '', category: 'Beverage', current_stock: '', threshold: '' }); bsProd.current?.show(); }}>
          + Add Product
        </button>
      </div>

      <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="cs-table">
          <thead><tr><th>Product Name</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.category || '—'}</td>
                <td style={{ fontWeight: 700, color: (p.current_stock || 0) <= (p.threshold || p.stock_threshold || 0) ? 'var(--warning)' : 'var(--text)' }}>{p.current_stock || 0}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.threshold || p.stock_threshold || 0}</td>
                <td><StockBadge status={p.status || p.stock_status} /></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost-cs" onClick={() => { setEditingId(p.id); setForm({ name: p.name, category: p.category || 'Beverage', current_stock: p.current_stock || 0, threshold: p.threshold || p.stock_threshold || 0 }); bsProd.current?.show(); }}>Edit</button>
                  <button className="btn-ghost-cs" style={{ color: 'var(--accent)', borderColor: 'rgba(56,189,248,0.3)' }} onClick={() => { setRestockId(p.id); bsRestock.current?.show(); }}>📦 Restock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <div className="modal fade" ref={productModalRef} tabIndex="-1">
        <div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">{editingId ? 'Edit Product' : 'Add Product'}</h5><button type="button" className="btn-close" data-bs-dismiss="modal"></button></div>
          <form onSubmit={handleProductSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="form-label">Product Name</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Beverage', 'Food', 'Snack', 'Personal Care', 'Spice', 'Household'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label className="form-label">Initial Stock</label><input type="number" className="form-control" min="0" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} required /></div>
                <div><label className="form-label">Alert Threshold</label><input type="number" className="form-control" min="0" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} required /></div>
              </div>
            </div>
            <div className="modal-footer"><button type="button" className="btn-ghost-cs" data-bs-dismiss="modal">Cancel</button><button type="submit" className="btn-primary-cs">Save</button></div>
          </form>
        </div></div>
      </div>

      {/* Restock Modal */}
      <div className="modal fade" ref={restockModalRef} tabIndex="-1">
        <div className="modal-dialog modal-sm"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Restock Product</h5><button type="button" className="btn-close" data-bs-dismiss="modal"></button></div>
          <form onSubmit={handleRestock}>
            <div className="modal-body"><label className="form-label">Quantity to Add</label><input type="number" className="form-control" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} required /></div>
            <div className="modal-footer"><button type="submit" className="btn-primary-cs">Confirm Restock</button></div>
          </form>
        </div></div>
      </div>
    </>
  );
}

// ── TAB 2: Stock Import ───────────────────────────────────
function TabImport() {
  const [products, setProducts] = useState([]);
  const [stores, setStores]     = useState([]);
  const [storeId, setStoreId]   = useState('');
  const [rows, setRows]         = useState([{ product_id: '', quantity: '' }]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [rp, rs] = await Promise.all([apiFetch('/products'), apiFetch('/stores')]);
        const dp = await rp.json();
        const ds = await rs.json();
        const list = ds.stores || [];
        setProducts(Array.isArray(dp) ? dp : []);
        setStores(list);
        if (list.length > 0) setStoreId(String(list[0].id));
        const saved = JSON.parse(localStorage.getItem('import_history') || '[]');
        setHistory(saved.slice(0, 20));
      } catch {}
    }
    load();
  }, []);

  function addRow() { setRows(r => [...r, { product_id: '', quantity: '' }]); }
  function removeRow(i) { setRows(r => r.filter((_, idx) => idx !== i)); }
  function updateRow(i, key, val) { setRows(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row)); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!storeId) { alert('Please select a branch!'); return; }
    const validRows = rows.filter(r => r.product_id && parseInt(r.quantity) > 0);
    if (validRows.length === 0) { alert('Add at least 1 valid product'); return; }
    setLoading(true);
    let successCount = 0;
    for (const row of validRows) {
      try {
        const r = await apiFetch(`/products/${row.product_id}/stock`, { method: 'PUT', body: JSON.stringify({ quantity: parseInt(row.quantity) }) });
        if (r.ok) successCount++;
      } catch {}
    }
    const pNames = validRows.map(r => {
      const p = products.find(p => String(p.id) === String(r.product_id));
      return `${p?.name || 'P#' + r.product_id} (+${r.quantity})`;
    });
    const storeName = stores.find(s => String(s.id) === storeId)?.name || '';
    const entry = { time: new Date().toLocaleString('en-US'), store: storeName, items: pNames };
    const saved = JSON.parse(localStorage.getItem('import_history') || '[]');
    saved.unshift(entry);
    localStorage.setItem('import_history', JSON.stringify(saved.slice(0, 50)));
    setHistory(saved.slice(0, 20));
    alert(`✅ Stock import successful: ${successCount}/${validRows.length} products`);
    setRows([{ product_id: '', quantity: '' }]);
    setLoading(false);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      <div className="cs-card">
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>📥 Stock Import Form</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Branch</label>
            <select className="form-select" value={storeId} onChange={e => setStoreId(e.target.value)}>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Products to Import</label>
            {rows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 6, marginBottom: 6 }}>
                <select className="form-select" value={row.product_id} onChange={e => updateRow(i, 'product_id', e.target.value)} required>
                  <option value="">-- Select product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" className="form-control" placeholder="Qty" min="1" value={row.quantity} onChange={e => updateRow(i, 'quantity', e.target.value)} required />
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)', borderRadius: 8, cursor: 'pointer', fontSize: '1rem' }}>×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addRow} className="btn-ghost-cs" style={{ marginTop: 4, fontSize: '0.8rem' }}>+ Add Row</button>
          </div>
          <button type="submit" className="btn-primary-cs" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing…' : '✅ Confirm Import'}
          </button>
        </form>
      </div>

      <div className="cs-card">
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>📋 Import History</div>
        {history.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No import history yet</div>
        ) : history.map((h, i) => (
          <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{h.store}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.time}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.items.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Alerts ─────────────────────────────────────────
function TabAlerts() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await apiFetch('/inventory/alerts');
        const d = await r.json();
        setAlerts(d.alerts || []);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const critical = alerts.filter(a => a.status === 'critical');
  const low      = alerts.filter(a => a.status === 'low');

  if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        <div className="cs-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{critical.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Out of Stock</div>
        </div>
        <div className="cs-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{low.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Low Stock</div>
        </div>
        <div className="cs-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{alerts.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Total Alerts</div>
        </div>
      </div>

      {critical.length > 0 && (
        <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--danger)' }}>🚨</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Out of Stock — Reorder immediately</span>
          </div>
          <table className="cs-table">
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {critical.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.category || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{p.current_stock || 0}</td>
                  <td>{p.threshold || p.stock_threshold || 0}</td>
                  <td><span className="badge-critical">Out of Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {low.length > 0 && (
        <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Low Stock — Monitor closely</span>
          </div>
          <table className="cs-table">
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {low.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.category || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--warning)' }}>{p.current_stock || 0}</td>
                  <td>{p.threshold || p.stock_threshold || 0}</td>
                  <td><span className="badge-low">Low Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="cs-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 600, color: 'var(--success)' }}>All products are well stocked!</div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────
export default function Inventory() {
  const [tab, setTab]               = useState('products');
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      try {
        const r = await apiFetch('/inventory/alerts');
        const d = await r.json();
        setAlertCount(d.count || 0);
      } catch {}
    }
    loadCount();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>Inventory</h1>
            <p>Manage stock levels, imports and alerts</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <Tab label="📦 Products"     active={tab === 'products'} onClick={() => setTab('products')} />
          <Tab label="📥 Stock Import" active={tab === 'import'}   onClick={() => setTab('import')} />
          <Tab label="🚨 Alerts"       active={tab === 'alerts'}   onClick={() => setTab('alerts')} badge={alertCount} />
        </div>

        {tab === 'products' && <TabProducts />}
        {tab === 'import'   && <TabImport />}
        {tab === 'alerts'   && <TabAlerts />}
      </main>
    </div>
  );
}
