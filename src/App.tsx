import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Schemes from './components/Schemes';
import Scholarships from './components/Scholarships';
import Hospitals from './components/Hospitals';
import Complaints from './components/Complaints';
import Jobs from './components/Jobs';
import AdminPanel from './components/AdminPanel';
import Auth from './components/Auth';
import Profile from './components/Profile';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/complaints" element={user ? <Complaints /> : <Navigate to="/auth" />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
