import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert, Eye, EyeOff, Logo } from '../components/Icons';

const SAMPLE = [
  { name: 'Rent', pct: 62, color: '#2F5BEA', amount: '1,100' },
  { name: 'Food', pct: 24, color: '#F2A007', amount: '428' },
  { name: 'Transport', pct: 11, color: '#0EA5B7', amount: '196' },
  { name: 'Bills', pct: 9, color: '#8B5CF6', amount: '160' },
];

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function switchMode() {
    setMode(isLogin ? 'register' : 'login');
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <aside className="auth-aside">
        <div className="brand brand-light">
          <Logo size={34} />
          <span>Tally</span>
        </div>

        <div className="auth-pitch">
          <h1>See exactly where your money goes.</h1>
          <p>Log income and expenses in seconds, then let the charts show what changed month to month.</p>

          <div className="sample" aria-hidden="true">
            <div className="sample-head">
              <span>A typical month</span>
              <strong>$1,884 spent</strong>
            </div>
            {SAMPLE.map((row) => (
              <div className="sample-row" key={row.name}>
                <span>{row.name}</span>
                <div className="sample-track">
                  <div style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
                <em>{row.amount}</em>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-card">
          <div className="brand brand-mobile">
            <Logo size={30} />
            <span>Tally</span>
          </div>

          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-sub">{isLogin ? 'Log in to see your dashboard.' : 'It takes less than a minute.'}</p>

          <form onSubmit={submit} noValidate>
            {!isLogin && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" className="input" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Jane Doe" required />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  className="input"
                  type={show ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                  required
                />
                <button type="button" className="input-action" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert" role="alert">
                <Alert /> <span>{error}</span>
              </div>
            )}

            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" className="link" onClick={switchMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
