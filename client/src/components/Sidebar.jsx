import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  ['/dashboard', 'Dashboard', true], ['/athletes', 'Athletes'], ['/events', 'Events'],
  ['/manage', 'Sports & federations', true], ['/users', 'Users', true], ['/activity', 'Activity log', true],
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="side">
      <div className="logo">Athlete<br />Registry</div>
      <nav>
        {LINKS.filter(([, , adminOnly]) => !adminOnly || isAdmin).map(([to, label]) => (
          <NavLink key={to} to={to}>{label}</NavLink>
        ))}
      </nav>
      <div className="me">
        <b>{user.name}</b>
        <span>{user.role === 'admin' ? 'Administrator' : 'Viewer'}</span>
        <button className="btn ghost light small" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
      </div>
    </aside>
  );
}
