import { useState } from 'react';
import api, { errorText } from '../api';

const blank = { name: '', fatherName: '', age: '', gender: 'Male', sport: '', federation: '', city: '', contact: '', email: '', notes: '', status: 'Active' };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter the athlete’s name';
  if (!f.fatherName.trim()) e.fatherName = 'Enter the father’s name';
  if (!(Number(f.age) >= 5 && Number(f.age) <= 80)) e.age = 'Age must be between 5 and 80';
  if (!f.sport) e.sport = 'Choose a sport';
  if (!f.federation) e.federation = 'Choose a federation';
  if (!f.city.trim()) e.city = 'Enter a city';
  if (!/^[0-9+\-\s]{7,15}$/.test(f.contact)) e.contact = 'Enter a valid phone number';
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email';
  if (f.notes.length > 500) e.notes = 'Notes can be up to 500 characters';
  return e;
}

export default function AthleteForm({ athlete, sports, federations, onSaved, onCancel }) {
  const [form, setForm] = useState(athlete
    ? { ...blank, ...athlete, email: athlete.email || '', notes: athlete.notes || '', sport: athlete.sport?._id, federation: athlete.federation?._id }
    : blank);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const err = (k) => errors[k] && <span className="err">{errors[k]}</span>;
  const input = (k, label, props = {}) => <label>{label}<input value={form[k]} onChange={set(k)} {...props} />{err(k)}</label>;
  const pick = (k, label, items, text) => (
    <label>{label}
      <select value={form[k]} onChange={set(k)}><option value="">Select…</option>{items.map((i) => <option key={i._id} value={i._id}>{i[text]}</option>)}</select>
      {err(k)}
    </label>
  );

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true); setServerError('');
    try {
      const body = { ...form, age: Number(form.age) };
      const { data } = athlete ? await api.put(`/athletes/${athlete._id}`, body) : await api.post('/athletes', body);
      onSaved(data);
    } catch (e) { setServerError(errorText(e)); } finally { setSaving(false); }
  };

  return (
    <form className="panel form-grid" onSubmit={submit} noValidate>
      <h2 className="wide">{athlete ? `Edit ${athlete.name}` : 'Add athlete'}</h2>
      {input('name', 'Full name')}
      {input('fatherName', 'Father’s name')}
      {input('age', 'Age', { type: 'number' })}
      <label>Gender<select value={form.gender} onChange={set('gender')}><option>Male</option><option>Female</option><option>Other</option></select></label>
      {pick('sport', 'Sport', sports, 'sportName')}
      {pick('federation', 'Federation', federations, 'federationName')}
      {input('city', 'City')}
      {input('contact', 'Contact number')}
      {input('email', 'Email (optional)', { type: 'email' })}
      <label>Status<select value={form.status} onChange={set('status')}><option>Active</option><option>Inactive</option><option>Suspended</option></select></label>
      <label className="wide">Notes (optional)<textarea rows="2" value={form.notes} onChange={set('notes')} />{err('notes')}</label>
      {serverError && <p className="err wide">{serverError}</p>}
      <div className="row wide">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save athlete'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
