import { useEffect, useState } from 'react';
import api, { errorText } from '../api';

export default function Activity() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/activity').then((r) => setRows(r.data)).catch((e) => setError(errorText(e))); }, []);

  return (
    <>
      <h1>Activity log</h1>
      <p className="muted">The latest 100 changes made by administrators.</p>
      {error && <p className="err">{error}</p>}
      {rows.length === 0 && !error && <p className="empty">Nothing has been changed yet.</p>}
      <ul className="timeline">
        {rows.map((r) => (
          <li key={r._id}>
            <b>{r.action}</b> {r.detail}
            <span className="muted">{r.user} · {new Date(r.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
