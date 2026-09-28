const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');
const { buildMatch } = require('../utils/filters');

const router = express.Router();
router.use(authMiddleware);

// Only these fields can be written by the client (never `user`).
const pick = (b = {}) => ({
  amount: Number(b.amount),
  type: b.type,
  category: typeof b.category === 'string' ? b.category : '',
  description: typeof b.description === 'string' ? b.description : '',
  date: b.date ? new Date(b.date) : undefined,
});

function handleError(err, res) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid value: ' + err.path });
  throw err;
}

// GET /api/transactions?category=&month=YYYY-MM&type=
router.get('/', async (req, res) => {
  const items = await Transaction.find(buildMatch(req.user.id, req.query))
    .sort({ date: -1, createdAt: -1 })
    .limit(500)
    .lean();
  res.json(items);
});

router.post('/', async (req, res) => {
  try {
    const tx = await Transaction.create({ ...pick(req.body), user: req.user.id });
    res.status(201).json(tx);
  } catch (err) {
    handleError(err, res);
  }
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id.' });
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(tx);
  } catch (err) {
    handleError(err, res);
  }
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id.' });
  const result = await Transaction.deleteOne({ _id: req.params.id, user: req.user.id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Transaction not found.' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
