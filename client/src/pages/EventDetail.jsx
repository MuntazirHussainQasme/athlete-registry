import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorText, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import { Bib, Medal } from '../components/ui';

export default function EventDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [entries, setEntries] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [pick, setPick] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event); setEntries(data.entries);
      if (isAdmin) setCandidates((await api.get('/athletes', { params: { sport: data.event.sport._id, status: 'Active', limit: 50 } })).data.items);
    } catch (e) { setError(errorText(e)); }
  };
  useEffect(() => { load(); }, [id]);

  const act = async (fn) => { try { await fn(); setError(''); await load(); } catch (e) { setError(errorText(e)); } };
  const enter = () => pick && act(async () => { await api.post(`/events/${id}/entries`, { athlete: pick }); setPick(''); });
  const result = (r, patch) => act(() => api.put(`/events/${id}/entries/${r._id}`, { medal: r.medal, position: r.position, ...patch }));
  const withdraw = (r) => window.confirm(`Remove ${r.athlete?.name} from this event?`) && act(() => api.delete(`/events/${id}/entries/${r._id}`));
  const removeEvent = async () => {
    if (!window.confirm('Delete this event and all its entries?')) return;
    try { await api.delete(`/events/${id}`); navigate('/events'); } catch (e) { setError(errorText(e)); }
  };
  const setStatus = (status) => act(() => api.put(`/events/${id}`, { status }));

  if (!event) return error ? <p className="err">{error}</p> : <p className="muted">Loading…</p>;
  const entered = new Set(entries.map((r) => r.athlete?._id));
  const open = candidates.filter((a) => !entered.has(a._id));

  return (
    <>
      <p><Link to="/events">← All events</Link></p>
      <div className="head">
        <div>
          <h1>{event.title}</h1>
          <p className="muted">{event.sport?.sportName} · {fmtDate(event.startDate)}{event.venue ? ` · ${event.venue}` : ''}{event.city ? `, ${event.city}` : ''}</p>
          {event.description && <p>{event.description}</p>}
        </div>
        {isAdmin && (
          <div className="row">
            <select value={event.status} onChange={(e) => setStatus(e.target.value)}><option>Upcoming</option><option>Ongoing</option><option>Completed</option></select>
            <button className="btn danger" onClick={removeEvent}>Delete event</button>
          </div>
        )}
      </div>
      {error && <p className="err">{error}</p>}

      {isAdmin && (
        <div className="panel row">
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{open.length ? `Enter an athlete (${event.sport?.sportName})…` : `No more active ${event.sport?.sportName} athletes to enter`}</option>
            {open.map((a) => <option key={a._id} value={a._id}>{a.athleteId} · {a.name}</option>)}
          </select>
          <button className="btn" disabled={!pick} onClick={enter}>Enter athlete</button>
        </div>
      )}

      <h2>Entries ({entries.length})</h2>
      {entries.length === 0 ? <p className="empty">No athletes entered yet.</p> : (
        <div className="scroll"><table className="table">
          <thead><tr><th>ID</th><th>Athlete</th><th>City</th><th>Position</th><th>Medal</th>{isAdmin && <th />}</tr></thead>
          <tbody>
            {entries.map((r) => (
              <tr key={r._id}>
                <td><Bib id={r.athlete?.athleteId} /></td><td><b>{r.athlete?.name}</b></td><td>{r.athlete?.city}</td>
                {isAdmin ? (
                  <>
                    <td><input className="mini" type="number" min="1" defaultValue={r.position || ''} onBlur={(e) => Number(e.target.value) !== (r.position || 0) && result(r, { position: Number(e.target.value) || null })} /></td>
                    <td><select value={r.medal} onChange={(e) => result(r, { medal: e.target.value })}><option>None</option><option>Gold</option><option>Silver</option><option>Bronze</option></select></td>
                    <td><button className="btn small danger" onClick={() => withdraw(r)}>Remove</button></td>
                  </>
                ) : (<><td>{r.position ? `#${r.position}` : '—'}</td><td><Medal type={r.medal} /></td></>)}
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
