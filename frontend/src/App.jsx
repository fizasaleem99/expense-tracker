import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { Logo } from './components/Icons';

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="boot" aria-label="Loading">
        <Logo size={44} />
      </div>
    );
  }
  return user ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
