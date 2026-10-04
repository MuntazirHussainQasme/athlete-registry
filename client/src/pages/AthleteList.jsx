import { useEffect, useState } from 'react';
import api, { errorText, download, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import AthleteForm from '../components/AthleteForm';
import { Bib, Medal, Drawer, Pagination } from '../components/ui';

const emptyFilters = { q: '', sport: '', category: '', city: '', gender: '', status: '', sort: 'newest' };

export default function AthleteList() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [sports, setSports] = useState([]);
  const [federations, setFederations] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('table');
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/sports'), api.get('/federations')])
      .then(([s, f]) => { setSports(s.data); setFederations(f.data); }).catch((e) => setError(errorText(e)));
  }, []);

  const params = () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/athletes', { params: { ...params(), page, limit: view === 'table' ? 10 : 12 } })
        .then((r) => { setData(r.data); setError(''); }).catch((e) => setError(errorText(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [filters, page, view, reload]);

  const set = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };
  const saved = () => { setEditing(null); setReload((n) => n + 1); };
  const remove = async (a) => {
    if (!window.confirm(`Delete ${a.name}? Their event entries are removed too. This cannot be undone.`)) return;
    try { await api.delete(`/athletes/${a._id}`); setReload((n) => n + 1); } catch (e) { setError(errorText(e)); }
  };
  const open = async (a) => { try { setDetail((await api.get(`/athletes/${a._id}`)).data); } catch (e) { setError(errorText(e)); } };
  const exportCsv = () => download('/athletes/export', params(), 'athletes.csv').catch((e) => setError(errorText(e)));

  const actions = (a) => isAdmin && (
    <div className="row" onClick={(e) => e.stopPropagation()}>
      <button className="btn small" onClick={() => setEditing(a)}>Edit</button>
      <button className="btn small danger" onClick={() => remove(a)}>Delete</button>
    </div>
  );

  return (
    <>
      <div className="head">
        <h1>Athletes</h1>
        <div className="row">
          {isAdmin && <button className="btn ghost" onClick={exportCsv}>Export CSV</button>}
          {isAdmin && !editing && <button className="btn" onClick={() => setEditing({})}>Add athlete</button>}
        </div>
      </div>

      {editing && <AthleteForm athlete={editing._id ? editing : null} sports={sports} federations={federations} onSaved={saved} onCancel={() => setEditing(null)} />}

      <section className="filters">
        <input placeholder="Search name or ATH-number" value={filters.q} onChange={set('q')} />
        <select value={filters.sport} onChange={set('sport')}><option value="">All sports</option>{sports.map((s) => <option key={s._id} value={s._id}>{s.sportName}</option>)}</select>
        <select value={filters.category} onChange={set('category')}><option value="">All ages</option><option>Junior</option><option>Senior</option><option>Masters</option></select>
        <select value={filters.gender} onChange={set('gender')}><option value="">Any gender</option><option>Male</option><option>Female</option><option>Other</option></select>
        <select value={filters.status} onChange={set('status')}><option value="">Any status</option><option>Active</option><option>Inactive</option><option>Suspended</option></select>
        <input placeholder="City" value={filters.city} onChange={set('city')} />
        <select value={filters.sort} onChange={set('sort')}><option value="newest">Newest first</option><option value="name">Name A–Z</option><option value="age">Age</option><option value="city">City</option></select>
        <div className="row">
          <button className={`btn small ${view === 'table' ? '' : 'ghost'}`} onClick={() => setView('table')}>Table</button>
          <button className={`btn small ${view === 'cards' ? '' : 'ghost'}`} onClick={() => setView('cards')}>Cards</button>
          <button className="btn ghost small" onClick={() => { setFilters(emptyFilters); setPage(1); }}>Clear</button>
        </div>
      </section>

      {error && <p className="err">{error}</p>}
      {data.items.length === 0 && !error && <p className="empty">No athletes match these filters.</p>}

      {view === 'table' && data.items.length > 0 && (
        <div className="scroll"><table className="table">
          <thead><tr><th>ID</th><th>Athlete</th><th>Sport</th><th>Federation</th><th>Category</th><th>City</th><th>Status</th>{isAdmin && <th />}</tr></thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={a._id} className="click" onClick={() => open(a)}>
                <td><Bib id={a.athleteId} /></td>
                <td><b>{a.name}</b><div className="muted">S/O {a.fatherName}</div></td>
                <td>{a.sport?.sportName}</td><td>{a.federation?.federationName}</td>
                <td>{a.ageCategory} · {a.age}</td><td>{a.city}</td>
                <td><span className={`pill ${a.status.toLowerCase()}`}>{a.status}</span></td>
                {isAdmin && <td>{actions(a)}</td>}
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {view === 'cards' && (
        <section className="grid">
          {data.items.map((a) => (
            <article key={a._id} className={`card status-${a.status.toLowerCase()}`} onClick={() => open(a)}>
              <Bib id={a.athleteId} />
              <h3>{a.name}</h3>
              <p className="muted">{a.sport?.sportName} · {a.federation?.federationName}</p>
              <p>{a.ageCategory}, age {a.age} · {a.city}</p>
              <span className={`pill ${a.status.toLowerCase()}`}>{a.status}</span>
              {actions(a)}
            </article>
          ))}
        </section>
      )}

      {data.total > 0 && <Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} />}

      {detail && (
        <Drawer title={detail.athlete.name} onClose={() => setDetail(null)}>
          <Bib id={detail.athlete.athleteId} />
          <dl>
            <dt>Father</dt><dd>{detail.athlete.fatherName}</dd>
            <dt>Sport</dt><dd>{detail.athlete.sport?.sportName}</dd>
            <dt>Federation</dt><dd>{detail.athlete.federation?.federationName}</dd>
            <dt>Category</dt><dd>{detail.athlete.ageCategory} (age {detail.athlete.age}, {detail.athlete.gender})</dd>
            <dt>City</dt><dd>{detail.athlete.city}</dd>
            <dt>Contact</dt><dd>{detail.athlete.contact}</dd>
            {detail.athlete.email && <><dt>Email</dt><dd>{detail.athlete.email}</dd></>}
            <dt>Status</dt><dd>{detail.athlete.status}</dd>
            <dt>Registered</dt><dd>{fmtDate(detail.athlete.createdAt)}</dd>
          </dl>
          {detail.athlete.notes && <p className="note">{detail.athlete.notes}</p>}
          <h3>Event history</h3>
          {detail.entries.length === 0 ? <p className="empty">Not entered in any event yet.</p> : (
            <table className="table slim"><tbody>
              {detail.entries.map((r) => (
                <tr key={r._id}><td>{r.event?.title}<div className="muted">{r.event && fmtDate(r.event.startDate)} · {r.event?.city}</div></td>
                  <td>{r.position ? `#${r.position}` : ''}</td><td><Medal type={r.medal} /></td></tr>
              ))}
            </tbody></table>
          )}
        </Drawer>
      )}
    </>
  );
}
