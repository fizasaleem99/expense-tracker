import { money } from '../utils';

export default function SummaryHero({ totals, loading, period }) {
  const t = totals || { income: 0, expense: 0, balance: 0, count: 0 };
  const spentPct = t.income > 0 ? Math.min(100, (t.expense / t.income) * 100) : t.expense > 0 ? 100 : 0;
  const over = t.expense > t.income;

  let note = 'Nothing logged for this period yet.';
  if (t.count > 0) {
    if (t.income === 0) note = 'No income recorded for this period.';
    else if (over) note = `You spent ${money(t.expense - t.income)} more than you earned.`;
    else note = `${Math.round(spentPct)}% of your income has been spent.`;
  }

  return (
    <section className={`hero ${loading ? 'is-loading' : ''}`} aria-label="Summary">
      <div className="hero-main">
        <p className="hero-label">Balance <span>{period}</span></p>
        <p className={`hero-balance ${t.balance < 0 ? 'neg' : ''}`}>{money(t.balance)}</p>
        <div className="flow" role="img" aria-label={note}>
          <div className={`flow-fill ${over ? 'over' : ''}`} style={{ width: `${spentPct}%` }} />
        </div>
        <p className="hero-note">{note}</p>
      </div>

      <dl className="hero-stats">
        <div>
          <dt><i className="dot dot-in" /> Income</dt>
          <dd>{money(t.income)}</dd>
        </div>
        <div>
          <dt><i className="dot dot-out" /> Expenses</dt>
          <dd>{money(t.expense)}</dd>
        </div>
        <div>
          <dt>Transactions</dt>
          <dd>{t.count}</dd>
        </div>
      </dl>
    </section>
  );
}
