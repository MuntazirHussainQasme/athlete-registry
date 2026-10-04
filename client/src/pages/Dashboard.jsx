import { useEffect, useState } from 'react';
import api, { errorText, fmtDate } from '../api';
import { Bib, Donut, BarList, Columns } from '../components/ui';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/stats').then((r) => setS(r.data)).catch((e) => setError(errorText(e))); }, []);

  if (error) return <p className="err">{error}</p>;
  if (!s) return <p className="muted">Loading…</p>;
  const tiles = [['Athletes', s.athletes], ['Sports', s.sports], ['Federations', s.federations], ['Events', s.events],
    ['Medals awarded', s.medals.Gold + s.medals.Silver + s.medals.Bronze]];

  return (
    <>
      <h1>Dashboard</h1>
      <section className="tiles">{tiles.map(([label, n]) => <div className="tile" key={label}><b>{n}</b><span>{label}</span></div>)}</section>

      <div className="dash">
        <section className="panel"><h2>Athletes by sport</h2><BarList data={s.perSport} color="#0f4c33" /></section>
        <section className="panel"><h2>Age categories</h2><Donut data={s.perCategory} /></section>
        <section className="panel"><h2>Registrations, last 6 months</h2><Columns data={s.months} /></section>
        <section className="panel"><h2>Gender</h2><Donut data={s.perGender} /></section>
        <section className="panel"><h2>Top cities</h2><BarList data={s.perCity} color="#d8a31a" /></section>
        <section className="panel">
          <h2>Medal table</h2>
          <div className="medals">
            <div className="medal-box gold"><b>{s.medals.Gold}</b>Gold</div>
            <div className="medal-box silver"><b>{s.medals.Silver}</b>Silver</div>
            <div className="medal-box bronze"><b>{s.medals.Bronze}</b>Bronze</div>
          </div>
          {s.leaderboard.length === 0 ? <p className="empty">No medals recorded yet.</p> : (
            <table className="table slim"><tbody>
              {s.leaderboard.map((l) => (
                <tr key={l.athleteId}><td><Bib id={l.athleteId} /></td><td>{l.name}</td><td className="num">{l.gold}G {l.silver}S {l.bronze}B</td></tr>
              ))}
            </tbody></table>
          )}
        </section>
        <section className="panel wide-panel">
          <h2>Recently registered</h2>
          <table className="table"><tbody>
            {s.recent.map((a) => <tr key={a._id}><td><Bib id={a.athleteId} /></td><td>{a.name}</td><td>{a.sport?.sportName}</td><td className="muted">{fmtDate(a.createdAt)}</td></tr>)}
          </tbody></table>
        </section>
      </div>
    </>
  );
}
