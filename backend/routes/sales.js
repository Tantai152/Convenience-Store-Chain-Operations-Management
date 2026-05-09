const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { orders } = require('../data/db');

function fmtDate(d) { const dt = new Date(d); return dt.toISOString().split('T')[0]; }

// aggregate daily for last 7 days
function aggregateDaily() {
  const res = [];
  const now = new Date();
  for (let i=0;i<7;i++) {
    const day = new Date(now); day.setDate(now.getDate()-i);
    const key = fmtDate(day);
    const dayOrders = orders.filter(o=>fmtDate(o.created_at)===key);
    const revenue = dayOrders.reduce((s,o)=>s+o.total,0);
    res.push({ date: key, revenue, order_count: dayOrders.length });
  }
  return res;
}

// aggregate weekly for last 4 weeks (ISO week starting Monday approximation)
function aggregateWeekly() {
  const res = [];
  const now = new Date();
  for (let w=0; w<4; w++) {
    const end = new Date(now); end.setDate(now.getDate() - w*7);
    const start = new Date(end); start.setDate(end.getDate()-6);
    const weekOrders = orders.filter(o=>{ const d=new Date(o.created_at); return d>=start && d<=end; });
    const revenue = weekOrders.reduce((s,o)=>s+o.total,0);
    res.push({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], revenue, order_count: weekOrders.length });
  }
  return res;
}

// monthly last 3 months
function aggregateMonthly() {
  const res = [];
  const now = new Date();
  for (let m=0;m<3;m++) {
    const d = new Date(now.getFullYear(), now.getMonth()-m, 1);
    const month = d.getMonth(); const year = d.getFullYear();
    const monthOrders = orders.filter(o=>{ const od=new Date(o.created_at); return od.getFullYear()===year && od.getMonth()===month; });
    const revenue = monthOrders.reduce((s,o)=>s+o.total,0);
    res.push({ month: `${year}-${String(month+1).padStart(2,'0')}`, revenue, order_count: monthOrders.length });
  }
  return res;
}

// GET /api/sales?period=daily|weekly|monthly
router.get('/', authenticate, (req, res) => {
  const period = (req.query.period || 'daily').toLowerCase();
  if (period==='weekly') return res.json(aggregateWeekly());
  if (period==='monthly') return res.json(aggregateMonthly());
  return res.json(aggregateDaily());
});

module.exports = router;
