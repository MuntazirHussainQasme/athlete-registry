import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const finish = ({ data }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const login = async (email, password) => finish(await api.post('/auth/login', { email, password }));
  const register = async (form) => finish(await api.post('/auth/register', form));
  const logout = () => { localStorage.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>{children}</AuthContext.Provider>;
}
