import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AthleteList from './pages/AthleteList';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Manage from './pages/Manage';
import Users from './pages/Users';
import Activity from './pages/Activity';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  const admin = (el) => <ProtectedRoute adminOnly>{el}</ProtectedRoute>;
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to={isAdmin ? '/dashboard' : '/athletes'} replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={admin(<Dashboard />)} />
          <Route path="/athletes" element={<AthleteList />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/manage" element={admin(<Manage />)} />
          <Route path="/users" element={admin(<Users />)} />
          <Route path="/activity" element={admin(<Activity />)} />
          <Route path="*" element={<p className="empty">That page does not exist.</p>} />
        </Routes>
      </main>
    </div>
  );
}
