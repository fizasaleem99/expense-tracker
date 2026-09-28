import { useAuth } from '../context/AuthContext';
import { Logo, LogOut, Plus } from './Icons';

export default function Header({ onAdd }) {
  const { user, logout } = useAuth();
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <Logo size={30} />
          <span>Tally</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus /> <span className="hide-sm">Add transaction</span>
            <span className="show-sm">Add</span>
          </button>
          <div className="user">
            <span className="avatar" aria-hidden="true">{initial}</span>
            <span className="user-name hide-sm">{user?.name}</span>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
