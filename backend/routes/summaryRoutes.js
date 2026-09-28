const express = require('express');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');
const { buildMatch } = require('../utils/filters');

const router = express.Router();
router.use(authMiddleware);

const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Every month between the first and last one that has data (gaps become zeros,
// so the trend line never skips a month).
function fillMonths(byMonth) {
  const keys = Object.keys(byMonth).sort();
  if (!keys.length) return [];
  const out = [];
  let [y, m] = keys[0].split('-').map(Number);
  const [ey, em] = keys[keys.length - 1].split('-').map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    const row = byMonth[key] || { income: 0, expense: 0 };
    out.push({ month: key, income: round(row.income), expense: round(row.expense), net: round(row.income - row.expense) });
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

// GET /api/summary/totals?month=&category=  -> KPI numbers
router.get('/totals', async (req, res) => {
  const rows = await Transaction.aggregate([
    { $match: buildMatch(req.user.id, req.query) },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const get = (t) => rows.find((r) => r._id === t) || { total: 0, count: 0 };
  const income = round(get('income').total);
  const expense = round(get('expense').total);
  res.json({ income, expense, balance: round(income - expense), count: get('income').count + get('expense').count });
});

// GET /api/summary/by-category?month=&category=&type=expense
router.get('/by-category', async (req, res) => {
  const type = req.query.type === 'income' ? 'income' : 'expense';
  const data = await Transaction.aggregate([
    { $match: buildMatch(req.user.id, { ...req.query, type }) },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $project: { _id: 0, category: '$_id', total: { $round: ['$total', 2] }, count: 1 } },
    { $sort: { total: -1 } },
  ]);
  res.json(data);
});

// GET /api/summary/monthly?category=  -> [{ month, income, expense, net }]
router.get('/monthly', async (req, res) => {
  const rows = await Transaction.aggregate([
    { $match: buildMatch(req.user.id, { category: req.query.category }) },
    {
      $group: {
        _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);
  const byMonth = {};
  for (const { _id, total } of rows) {
    byMonth[_id.month] = byMonth[_id.month] || { income: 0, expense: 0 };
    byMonth[_id.month][_id.type] = total;
  }
  res.json(fillMonths(byMonth));
});

// GET /api/summary/months -> ["2026-09", "2026-08", ...] months that have data
router.get('/months', async (req, res) => {
  const rows = await Transaction.aggregate([
    { $match: buildMatch(req.user.id) },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } } } },
    { $sort: { _id: -1 } },
  ]);
  res.json(rows.map((r) => r._id));
});

module.exports = router;
