import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorText, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

const blank = { title: '', sport: '', venue: '', city: '', startDate: '', status: 'Upcoming', description: '' };

export default function Events() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/events').then((r) => setEvents(r.data)).catch((e) => setError(errorText(e)));
  useEffect(() => { load(); api.get('/sports').then((r) => setSports(r.data)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.sport || !form.startDate) return setError('Title, sport and start date are required');
    try { await api.post('/events', form); setForm(null); setError(''); load(); } catch (err) { setError(errorText(err)); }
  };
  const shown = events.filter((e) => !filter || e.status === filter);

  return (
    <>
      <div className="head">
        <h1>Events</h1>
        <div className="row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All events</option><option>Upcoming</option><option>Ongoing</option><option>Completed</option></select>
          {isAdmin && !form && <button className="btn" onClick={() => setForm(blank)}>Create event</button>}
        </div>
      </div>

      {form && (
        <form className="panel form-grid" onSubmit={save} noValidate>
          <h2 className="wide">New event</h2>
          <label>Title<input value={form.title} onChange={set('title')} /></label>
          <label>Sport<select value={form.sport} onChange={set('sport')}><option value="">Select…</option>{sports.map((s) => <option key={s._id} value={s._id}>{s.sportName}</option>)}</select></label>
          <label>Start date<input type="date" value={form.startDate} onChange={set('startDate')} /></label>
          <label>Venue<input value={form.venue} onChange={set('venue')} /></label>
          <label>City<input value={form.city} onChange={set('city')} /></label>
          <label>Status<select value={form.status} onChange={set('status')}><option>Upcoming</option><option>Ongoing</option><option>Completed</option></select></label>
          <label className="wide">Description (optional)<textarea rows="2" value={form.description} onChange={set('description')} /></label>
          {error && <p className="err wide">{error}</p>}
          <div className="row wide"><button className="btn">Save event</button><button type="button" className="btn ghost" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}

      {!form && error && <p className="err">{error}</p>}
      {shown.length === 0 && <p className="empty">No events here yet.{isAdmin ? ' Create one to start taking entries.' : ''}</p>}
      <section className="grid">
        {shown.map((e) => (
          <Link to={`/events/${e._id}`} className="card event" key={e._id}>
            <span className={`pill ${e.status.toLowerCase()}`}>{e.status}</span>
            <h3>{e.title}</h3>
            <p className="muted">{e.sport?.sportName}</p>
            <p>{fmtDate(e.startDate)}{e.city ? ` · ${e.city}` : ''}</p>
            <p className="muted">{e.entries} athlete{e.entries === 1 ? '' : 's'} entered</p>
          </Link>
        ))}
      </section>
    </>
  );
}
