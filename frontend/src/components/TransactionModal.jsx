import { useEffect, useState } from 'react';
import { api } from '../api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { currencySymbol, todayISO } from '../utils';
import { Alert, Close } from './Icons';

export default function TransactionModal({ item, onClose, onSaved, onUnauthorized }) {
  const editing = Boolean(item?._id);
  const [form, setForm] = useState({
    type: item?.type || 'expense',
    amount: item?.amount ?? '',
    category: item?.category || '',
    description: item?.description || '',
    date: item?.date ? item.date.slice(0, 10) : todayISO(),
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function setType(type) {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((f) => ({ ...f, type, category: list.includes(f.category) ? f.category : '' }));
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError('Enter an amount greater than 0.');
    if (!form.category) return setError('Choose a category.');
    if (!form.date) return setError('Pick a date.');

    setBusy(true);
    setError('');
    try {
      const body = { ...form, amount };
      if (editing) await api.put(`/transactions/${item._id}`, body);
      else await api.post('/transactions', body);
      onSaved(editing ? 'Transaction updated' : 'Transaction added');
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <h2 id="modal-title">{editing ? 'Edit transaction' : 'New transaction'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Close /></button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="seg seg-wide" role="group" aria-label="Transaction type">
            <button type="button" className={form.type === 'expense' ? 'on out' : ''} onClick={() => setType('expense')}>Expense</button>
            <button type="button" className={form.type === 'income' ? 'on in' : ''} onClick={() => setType('income')}>Income</button>
          </div>

          <div className="field">
            <label htmlFor="amount">Amount</label>
            <div className="input-wrap">
              <span className="input-prefix">{currencySymbol}</span>
              <input id="amount" className="input has-prefix" type="number" inputMode="decimal" step="0.01" min="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" autoFocus />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" className="input" value={form.category} onChange={set('category')}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" className="input" type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="note">Note <span className="optional">optional</span></label>
            <input id="note" className="input" maxLength={140} value={form.description} onChange={set('description')} placeholder="What was it for?" />
          </div>

          {error && (
            <div className="alert" role="alert"><Alert /> <span>{error}</span></div>
          )}

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
