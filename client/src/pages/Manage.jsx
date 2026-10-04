import { useEffect, useState } from 'react';
import api, { errorText } from '../api';

function Lookup({ title, path, nameKey, fields }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const load = () => api.get(path).then((r) => setItems(r.data)).catch((e) => setError(errorText(e)));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form[nameKey]?.trim()) return setError('Enter a name');
    try { await api.post(path, form); setForm({}); setError(''); load(); } catch (err) { setError(errorText(err)); }
  };
  const remove = async (item) => { try { await api.delete(`${path}/${item._id}`); setError(''); load(); } catch (err) { setError(errorText(err)); } };

  return (
    <section className="panel">
      <h2>{title}</h2>
      <form className="inline" onSubmit={add}>
        {fields.map(([key, label]) => <input key={key} placeholder={label} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}
        <button className="btn">Add</button>
      </form>
      {error && <p className="err">{error}</p>}
      <ul className="list">
        {items.map((i) => <li key={i._id}><span>{i[nameKey]}</span><button className="btn small danger" onClick={() => remove(i)}>Delete</button></li>)}
        {items.length === 0 && <li className="empty">Nothing here yet.</li>}
      </ul>
    </section>
  );
}

export default function Manage() {
  return (
    <>
      <h1>Sports &amp; federations</h1>
      <div className="two-col">
        <Lookup title="Sports" path="/sports" nameKey="sportName" fields={[['sportName', 'Sport name'], ['description', 'Description']]} />
        <Lookup title="Federations" path="/federations" nameKey="federationName" fields={[['federationName', 'Federation name'], ['president', 'President'], ['contact', 'Contact']]} />
      </div>
    </>
  );
}
