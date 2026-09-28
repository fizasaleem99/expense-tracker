const mongoose = require('mongoose');

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// One place that turns ?month=&category=&type= into a $match / find() filter.
// The list, the totals and both charts all use it, so they can never disagree.
function buildMatch(userId, query = {}) {
  const match = { user: new mongoose.Types.ObjectId(userId) };
  const { month, category, type } = query;

  if (typeof month === 'string' && MONTH_RE.test(month)) {
    const [y, m] = month.split('-').map(Number);
    match.date = {
      $gte: new Date(Date.UTC(y, m - 1, 1)),
      $lt: new Date(Date.UTC(y, m, 1)),
    };
  }
  // String() stops object injection such as ?category[$ne]=x
  if (typeof category === 'string' && category && category !== 'all') match.category = category;
  if (type === 'income' || type === 'expense') match.type = type;

  return match;
}

module.exports = { buildMatch, MONTH_RE };
