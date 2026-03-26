import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, GraduationCap, Hospital, AlertCircle, Briefcase, Settings, LogOut, User } from 'lucide-react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Govt Schemes', path: '/schemes' },
    { icon: GraduationCap, label: 'Scholarships', path: '/scholarships' },
    { icon: Hospital, label: 'Hospitals', path: '/hospitals' },
    { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
    { icon: Briefcase, label: 'Jobs & Skills', path: '/jobs' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ icon: Settings, label: 'Admin Panel', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight italic serif">Smart India Assistant</h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Public Service Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          {user ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{profile?.displayName || user.displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => auth.signOut()}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium"
            >
              Login / Register
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
