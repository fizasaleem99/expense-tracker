import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { currentMonth, greeting, monthLong } from '../utils';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import SummaryHero from '../components/SummaryHero';
import CategoryChart from '../components/Charts/CategoryChart';
import TrendChart from '../components/Charts/TrendChart';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import { Alert } from '../components/Icons';

// Runs `loader` whenever `deps` change; keeps the previous data on screen while reloading.
function useLoad(loader, deps, onError) {
  const [state, setState] = useState({ data: null, loading: true });
  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true }));
    loader()
      .then((data) => !off && setState({ data, loading: false }))
      .catch((err) => {
        if (off) return;
        setState((s) => ({ ...s, loading: false }));
        onError(err);
      });
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export default function Dashboard() {
  const { user, expireSession } = useAuth();
  const [filters, setFilters] = useState({ month: '', category: '' });
  const [txType, setTxType] = useState('all');
  const [catType, setCatType] = useState('expense');
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState(null); // null | { item }
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const handleError = useCallback(
    (err) => (err.status === 401 ? expireSession() : setError(err.message)),
    [expireSession]
  );

  // The same { month, category } filters drive the list AND every chart.
  const params = { month: filters.month, category: filters.category };
  const list = useLoad(() => api.get('/transactions', { ...params, type: txType === 'all' ? '' : txType }), [filters, txType, version], handleError);
  const totals = useLoad(() => api.get('/summary/totals', params), [filters, version], handleError);
  const byCategory = useLoad(() => api.get('/summary/by-category', { ...params, type: catType }), [filters, catType, version], handleError);
  const monthly = useLoad(() => api.get('/summary/monthly', { category: filters.category }), [filters.category, version], handleError);
  const monthsQ = useLoad(() => api.get('/summary/months'), [version], handleError);

  const months = useMemo(() => {
    const set = new Set(monthsQ.data || []);
    set.add(currentMonth());
    if (filters.month) set.add(filters.month);
    return [...set].sort().reverse();
  }, [monthsQ.data, filters.month]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const hasFilters = Boolean(filters.month || filters.category);
  const period = [filters.month ? monthLong(filters.month) : 'All time', filters.category].filter(Boolean).join(', ');

  const refresh = (message) => {
    if (message) setToast(message);
    setVersion((v) => v + 1);
  };

  async function remove(t) {
    try {
      await api.del(`/transactions/${t._id}`);
      refresh('Transaction deleted');
    } catch (err) {
      handleError(err);
    }
  }

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <>
      <Header onAdd={() => setModal({ item: null })} />

      <main className="container page">
        <div className="page-head">
          <div>
            <h1>{greeting()}, {user?.name?.split(' ')[0]}</h1>
            <p className="page-sub">Here is how your money is moving.</p>
          </div>
          <FilterBar filters={filters} months={months} onChange={setFilters} />
        </div>

        {error && (
          <div className="alert alert-page" role="alert">
            <Alert /> <span>{error}</span>
            <button className="link" onClick={() => { setError(''); refresh(); }}>Try again</button>
          </div>
        )}

        <SummaryHero totals={totals.data} loading={totals.loading} period={period} />

        <div className="grid-2">
          <CategoryChart data={byCategory.data} loading={byCategory.loading} type={catType} onTypeChange={setCatType} />
          <TrendChart data={monthly.data} loading={monthly.loading} selectedMonth={filters.month} category={filters.category} />
        </div>

        <TransactionList
          items={list.data}
          loading={list.loading}
          typeFilter={txType}
          onTypeFilter={setTxType}
          hasFilters={hasFilters}
          onClear={() => setFilters({ month: '', category: '' })}
          onAdd={() => setModal({ item: null })}
          onEdit={(item) => setModal({ item })}
          onDelete={remove}
        />
      </main>

      {modal && (
        <TransactionModal
          item={modal.item}
          onClose={closeModal}
          onUnauthorized={expireSession}
          onSaved={(msg) => { setModal(null); refresh(msg); }}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
