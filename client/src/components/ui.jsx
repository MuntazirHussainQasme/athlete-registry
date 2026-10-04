import { useEffect } from 'react';

// Race-bib style athlete number
export const Bib = ({ id }) => <span className="bib">{id}</span>;

export const Medal = ({ type }) => (type && type !== 'None' ? <span className={`medal ${type.toLowerCase()}`}>{type}</span> : <span className="muted">—</span>);

export function Drawer({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="head"><h2>{title}</h2><button className="btn ghost small" onClick={onClose}>Close</button></div>
        {children}
      </aside>
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }) {
  return (
    <div className="pager">
      <span className="muted">{total} athlete{total === 1 ? '' : 's'}</span>
      <div className="row">
        <button className="btn ghost small" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn ghost small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

const COLORS = ['#0f4c33', '#d8a31a', '#5f8f78', '#14201a', '#9aa5a0', '#a8693a'];

export function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const stops = data.map((d, i) => { const from = (acc / total) * 100; acc += d.value; return `${COLORS[i % COLORS.length]} ${from}% ${(acc / total) * 100}%`; });
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#e4e9e6' }}><span>{total}</span></div>
      <ul className="legend">
        {data.map((d, i) => <li key={d.label}><i style={{ background: COLORS[i % COLORS.length] }} />{d.label}<b>{d.value}</b></li>)}
      </ul>
    </div>
  );
}

export function BarList({ data, color }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="empty">No data yet.</p>;
  return data.map((d) => (
    <div className="bar-row" key={d.label}>
      <span>{d.label}</span>
      <div className="bar"><i style={{ width: `${(d.value / max) * 100}%`, background: color }} /></div>
      <b>{d.value}</b>
    </div>
  ));
}

export function Columns({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="cols">
      {data.map((d) => (
        <div key={d.label} className="col">
          <b>{d.value}</b>
          <i style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
