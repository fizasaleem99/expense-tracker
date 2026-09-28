import { useState } from 'react';
import { colorFor } from '../constants';
import { dateLabel, money } from '../utils';
import { Pencil, Trash } from './Icons';
import EmptyState from './EmptyState';

const TABS = [['all', 'All'], ['income', 'Income'], ['expense', 'Expenses']];

export default function TransactionList({ items, loading, typeFilter, onTypeFilter, hasFilters, onClear, onAdd, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <section className="panel" aria-labelledby="tx-title">
      <div className="panel-head">
        <h2 id="tx-title">
          Transactions {items && <span className="count">{items.length}</span>}
        </h2>
        <div className="seg" role="group" aria-label="Filter by type">
          {TABS.map(([value, label]) => (
            <button key={value} className={typeFilter === value ? 'on' : ''} onClick={() => onTypeFilter(value)}>{label}</button>
          ))}
        </div>
      </div>

      {loading && !items ? (
        <div className="skeleton-list">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}
        </div>
      ) : items.length === 0 ? (
        hasFilters || typeFilter !== 'all' ? (
          <EmptyState title="No matching transactions" text="Nothing fits these filters." action={hasFilters ? 'Clear filters' : 'Show all'} onAction={hasFilters ? onClear : () => onTypeFilter('all')} />
        ) : (
          <EmptyState title="No transactions yet" text="Add your first income or expense and your charts will come to life." action="Add transaction" onAction={onAdd} />
        )
      ) : (
        <ul className={`tx-list ${loading ? 'dim' : ''}`}>
          {items.map((t) => {
            const color = colorFor(t.category);
            const confirming = confirmId === t._id;
            return (
              <li className="tx" key={t._id}>
                <span className="tx-badge" style={{ background: `${color}1F`, color }} aria-hidden="true">{t.category.charAt(0)}</span>
                <div className="tx-main">
                  <p className="tx-title">{t.description || t.category}</p>
                  <p className="tx-date">{dateLabel(t.date)}</p>
                </div>
                <span className="chip"><i className="dot" style={{ background: color }} />{t.category}</span>
                <span className={`tx-amount ${t.type}`}>{t.type === 'income' ? '+' : '−'}{money(t.amount)}</span>
                <div className="tx-actions">
                  {confirming ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => { setConfirmId(null); onDelete(t); }}>Delete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Keep</button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" onClick={() => onEdit(t)} aria-label={`Edit ${t.description || t.category}`}><Pencil size={16} /></button>
                      <button className="icon-btn" onClick={() => setConfirmId(t._id)} aria-label={`Delete ${t.description || t.category}`}><Trash size={16} /></button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
