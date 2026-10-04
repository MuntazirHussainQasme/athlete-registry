import { useEffect, useState } from 'react';
import api, { errorText, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const load = () => api.get('/users').then((r) => setUsers(r.data)).catch((e) => setError(errorText(e)));
  useEffect(() => { load(); }, []);

  const act = async (fn) => { try { await fn(); setError(''); load(); } catch (e) { setError(errorText(e)); } };
  const remove = (u) => window.confirm(`Delete the account for ${u.name}?`) && act(() => api.delete(`/users/${u._id}`));

  return (
    <>
      <h1>Users</h1>
      <p className="muted">Anyone can create a Viewer account. Promote people to Administrator here.</p>
      {error && <p className="err">{error}</p>}
      <div className="scroll"><table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td><b>{u.name}</b>{u._id === me.id && <span className="muted"> (you)</span>}</td><td>{u.email}</td><td>{fmtDate(u.createdAt)}</td>
              <td><select value={u.role} disabled={u._id === me.id} onChange={(e) => act(() => api.put(`/users/${u._id}/role`, { role: e.target.value }))}><option value="user">Viewer</option><option value="admin">Administrator</option></select></td>
              <td>{u._id !== me.id && <button className="btn small danger" onClick={() => remove(u)}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </>
  );
}
