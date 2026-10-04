import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../api';

export function AuthLayout({ title, children }) {
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <h1>Athlete<br />Registry</h1>
        <p>Register athletes, enter them in events and keep every result in one place.</p>
        <span className="bib big">ATH-0001</span>
      </section>
      <section className="auth-form"><h2>{title}</h2>{children}</section>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Enter your email and password');
    try { const u = await login(form.email, form.password); navigate(u.role === 'admin' ? '/dashboard' : '/athletes'); }
    catch (err) { setError(errorText(err)); }
  };

  return (
    <AuthLayout title="Log in">
      <form onSubmit={submit} noValidate className="stack">
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="err">{error}</p>}
        <button className="btn">Log in</button>
        <p className="muted">No account? <Link to="/register">Create one</Link></p>
      </form>
    </AuthLayout>
  );
}
