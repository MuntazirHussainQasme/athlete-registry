import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../api';
import { AuthLayout } from './Login';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Enter your name');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email');
    if (form.password.length < 6) return setError('Password needs at least 6 characters');
    try { await register(form); navigate('/athletes'); } catch (err) { setError(errorText(err)); }
  };

  return (
    <AuthLayout title="Create account">
      <form onSubmit={submit} noValidate className="stack">
        <label>Name<input value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" value={form.password} onChange={set('password')} /></label>
        {error && <p className="err">{error}</p>}
        <button className="btn">Create account</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
