import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EXPENSE_COLOR, INCOME_COLOR } from '../../constants';
import { compact, money, monthLong, monthShortYear } from '../../utils';
import EmptyState from '../EmptyState';

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tip">
      <div className="tip-title">{monthLong(label)}</div>
      <div className="tip-row"><span><i className="dot dot-in" /> Income</span><strong>{money(d.income)}</strong></div>
      <div className="tip-row"><span><i className="dot dot-out" /> Expenses</span><strong>{money(d.expense)}</strong></div>
      <div className="tip-row tip-net"><span>Net</span><strong>{money(d.net)}</strong></div>
    </div>
  );
}

export default function TrendChart({ data, loading, selectedMonth, category }) {
  const rows = data || [];
  const marker = selectedMonth && rows.some((r) => r.month === selectedMonth) ? selectedMonth : null;

  return (
    <section className="panel" aria-labelledby="trend-title">
      <div className="panel-head">
        <h2 id="trend-title">Monthly trend{category ? `: ${category}` : ''}</h2>
        <div className="legend">
          <span><i className="dot dot-in" /> Income</span>
          <span><i className="dot dot-out" /> Expenses</span>
        </div>
      </div>

      {loading && !data ? (
        <div className="skeleton" style={{ height: 260 }} />
      ) : rows.length === 0 ? (
        <EmptyState title="No trend yet" text="Add a few transactions across different months and your trend will appear here." />
      ) : (
        <div className={loading ? 'dim' : ''}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="month" tickFormatter={monthShortYear} axisLine={{ stroke: '#E3E7EE' }} tickLine={false} tick={{ fill: '#8A94A6', fontSize: 12 }} minTickGap={16} />
              <YAxis tickFormatter={compact} axisLine={false} tickLine={false} width={56} tick={{ fill: '#8A94A6', fontSize: 12 }} />
              <Tooltip content={<Tip />} cursor={{ stroke: '#CDD4DF' }} />
              {marker && <ReferenceLine x={marker} stroke="#0E1B2C" strokeDasharray="4 4" strokeOpacity={0.35} />}
              <Line type="monotone" dataKey="income" stroke={INCOME_COLOR} strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 0, fill: INCOME_COLOR }} activeDot={{ r: 5 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="expense" stroke={EXPENSE_COLOR} strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 0, fill: EXPENSE_COLOR }} activeDot={{ r: 5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          {marker && <p className="chart-foot">Dashed line marks {monthLong(marker)}, your selected month.</p>}
        </div>
      )}
    </section>
  );
}
