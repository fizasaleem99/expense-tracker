import { ALL_CATEGORIES } from '../constants';
import { monthLong } from '../utils';

export default function FilterBar({ filters, months, onChange }) {
  const active = filters.month || filters.category;
  return (
    <div className="filters">
      <label className="select">
        <span className="sr-only">Month</span>
        <select value={filters.month} onChange={(e) => onChange({ ...filters, month: e.target.value })}>
          <option value="">All time</option>
          {months.map((m) => (
            <option key={m} value={m}>{monthLong(m)}</option>
          ))}
        </select>
      </label>
      <label className="select">
        <span className="sr-only">Category</span>
        <select value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      {active && (
        <button className="link" onClick={() => onChange({ month: '', category: '' })}>
          Clear filters
        </button>
      )}
    </div>
  );
}
