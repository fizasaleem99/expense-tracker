// Demo data: node seed.js  ->  login demo@tally.app / demo1234
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const spend = [
  ['Food', 'Groceries', 90, 160], ['Food', 'Lunch out', 12, 35], ['Transport', 'Fuel', 30, 70],
  ['Shopping', 'Clothes', 40, 150], ['Bills', 'Electricity', 60, 110], ['Bills', 'Internet', 35, 45],
  ['Entertainment', 'Cinema', 15, 40], ['Health', 'Pharmacy', 10, 60],
];

// small deterministic pseudo-random so every run gives similar-looking data
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const between = (a, b) => Math.round((a + rnd() * (b - a)) * 100) / 100;

(async () => {
  await mongoose.connect(process.env.MONGO_URI, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {});
  await User.deleteOne({ email: 'demo@tally.app' });
  const user = await User.create({ name: 'Demo User', email: 'demo@tally.app', password: await bcrypt.hash('demo1234', 10) });

  const now = new Date();
  const docs = [];
  for (let i = 5; i >= 0; i--) {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth() - i;
    const day = (d) => new Date(Date.UTC(y, m, d));
    const isCurrent = i === 0;
    docs.push({ type: 'income', category: 'Salary', description: 'Monthly salary', amount: 3200, date: day(1) });
    if (i % 2 === 0) docs.push({ type: 'income', category: 'Freelance', description: 'Design project', amount: between(300, 700), date: day(14) });
    docs.push({ type: 'expense', category: 'Rent', description: 'Apartment rent', amount: 1100, date: day(2) });
    const n = isCurrent ? Math.min(6, Math.max(3, now.getUTCDate() / 4)) : 9;
    for (let k = 0; k < n; k++) {
      const [category, description, lo, hi] = spend[Math.floor(rnd() * spend.length)];
      const d = isCurrent ? Math.min(now.getUTCDate(), 3 + k * 3) : 3 + Math.floor(rnd() * 24);
      docs.push({ type: 'expense', category, description, amount: between(lo, hi), date: day(d) });
    }
  }
  await Transaction.deleteMany({ user: user._id });
  await Transaction.insertMany(docs.map((d) => ({ ...d, user: user._id })));
  console.log(`Seeded ${docs.length} transactions. Login: demo@tally.app / demo1234`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
