import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { colorFor } from '../../constants';
import { compact, money } from '../../utils';
import EmptyState from '../EmptyState';

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tip">
      <div className="tip-title"><i className="dot" style={{ background: colorFor(d.category) }} /> {d.category}</div>
      <div className="tip-row"><span>Total</span><strong>{money(d.total)}</strong></div>
      <div className="tip-row"><span>Transactions</span><strong>{d.count}</strong></div>
    </div>
  );
}

export default function CategoryChart({ data, loading, type, onTypeChange }) {
  const rows = data || [];
  const height = Math.max(220, rows.length * 46 + 24);

  return (
    <section className="panel" aria-labelledby="cat-title">
      <div className="panel-head">
        <h2 id="cat-title">By category</h2>
        <div className="seg" role="group" aria-label="Chart type">
          <button className={type === 'expense' ? 'on' : ''} onClick={() => onTypeChange('expense')}>Expenses</button>
          <button className={type === 'income' ? 'on' : ''} onClick={() => onTypeChange('income')}>Income</button>
        </div>
      </div>

      {loading && !data ? (
        <div className="skeleton" style={{ height: 260 }} />
      ) : rows.length === 0 ? (
        <EmptyState title={`No ${type} data`} text="Nothing matches the current filters. Try another month or category." />
      ) : (
        <div className={loading ? 'dim' : ''}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, left: 4, bottom: 4 }} barCategoryGap={12}>
              <CartesianGrid horizontal={false} stroke="#EEF1F5" />
              <XAxis type="number" tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fill: '#8A94A6', fontSize: 12 }} />
              <YAxis type="category" dataKey="category" width={92} axisLine={false} tickLine={false} tick={{ fill: '#33415A', fontSize: 13 }} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(14,27,44,0.04)' }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={20} isAnimationActive={false}>
                {rows.map((r) => <Cell key={r.category} fill={colorFor(r.category)} />)}
                <LabelList dataKey="total" position="right" formatter={compact} style={{ fill: '#33415A', fontSize: 12, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
