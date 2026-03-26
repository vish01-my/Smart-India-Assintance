import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FileText, GraduationCap, Hospital, AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Active Complaints', value: 3, icon: AlertCircle, color: 'text-amber-500' },
    { label: 'Eligible Schemes', value: 12, icon: FileText, color: 'text-blue-500' },
    { label: 'Scholarships', value: 5, icon: GraduationCap, color: 'text-emerald-500' },
  ];

  const complaintData = [
    { name: 'Pending', count: 2, color: '#f59e0b' },
    { name: 'In Progress', count: 1, color: '#3b82f6' },
    { name: 'Resolved', count: 4, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Namaste, <span className="italic serif">{profile?.displayName || 'Citizen'}</span>
        </h1>
        <p className="text-neutral-500 mt-1">Welcome to your Smart India Assistant dashboard.</p>
      </header>

      {/* Profile Completion Prompt */}
      {(!profile?.age || !profile?.income) && (
        <div className="bg-neutral-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-lg font-semibold">Complete your profile</h3>
            <p className="text-neutral-400 text-sm">Add your age, income, and occupation to get personalized scheme recommendations.</p>
          </div>
          <Link to="/profile" className="px-6 py-2 bg-white text-neutral-900 rounded-full text-sm font-bold hover:bg-neutral-100 transition-colors">
            Update Profile
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={stat.color}>
                <stat.icon size={24} />
              </div>
              <span className="text-2xl font-bold text-neutral-900">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complaint Status Chart */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-neutral-400" />
            Complaint Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Schemes */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText size={20} className="text-neutral-400" />
              Recommended Schemes
            </h3>
            <Link to="/schemes" className="text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-neutral-900 transition-colors flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { title: 'PM-Kisan Samman Nidhi', category: 'Agriculture', status: 'Eligible' },
              { title: 'Ayushman Bharat', category: 'Health', status: 'Eligible' },
              { title: 'PM Awas Yojana', category: 'Housing', status: 'Check Details' },
            ].map((scheme) => (
              <div key={scheme.title} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{scheme.title}</h4>
                  <p className="text-xs text-neutral-500">{scheme.category}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white border border-neutral-200 rounded-full text-neutral-600">
                  {scheme.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
