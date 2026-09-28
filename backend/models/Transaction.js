const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be greater than 0'] },
    type: { type: String, enum: { values: ['income', 'expense'], message: 'Type must be income or expense' }, required: true },
    category: { type: String, required: [true, 'Category is required'], trim: true, maxlength: 40 },
    description: { type: String, trim: true, maxlength: 140, default: '' },
    date: { type: Date, required: [true, 'Date is required'], default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
