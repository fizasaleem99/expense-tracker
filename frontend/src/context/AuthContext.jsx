import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the httpOnly cookie on page load
  useEffect(() => {
    let off = false;
    api
      .get('/auth/me')
      .then((u) => !off && setUser(u))
      .catch(() => {})
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await api.post('/auth/login', { email, password })),
      register: async (name, email, password) => setUser(await api.post('/auth/register', { name, email, password })),
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          /* cookie may already be gone */
        }
        setUser(null);
      },
      expireSession: () => setUser(null),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
