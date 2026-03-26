import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Settings, Users, FileText, GraduationCap, Hospital, AlertCircle, Plus, CheckCircle, Clock, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function AdminPanel() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'complaints' | 'content'>('complaints');
  const [users, setUsers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsubscribeComplaints = onSnapshot(q, (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    fetchUsers();
    return () => unsubscribeComplaints();
  }, [profile]);

  const updateComplaintStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'complaints', id), { status: newStatus });
      toast.success(`Complaint marked as ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-neutral-200">
        <AlertCircle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900">Access Denied</h2>
        <p className="text-neutral-500 mt-2">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Admin Control Panel</h1>
          <p className="text-neutral-500 mt-1">Manage users, complaints, and platform content.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('complaints')}
          className={cn(
            "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'complaints' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Manage Complaints
          {activeTab === 'complaints' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'users' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          User Management
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'content' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Platform Content
          {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-neutral-900">{complaint.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-500">{complaint.location}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          className={cn(
                            "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-neutral-900 cursor-pointer",
                            complaint.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                            complaint.status === 'In Progress' ? "bg-blue-100 text-blue-700" :
                            "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                    <Users size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 truncate">{user.displayName}</h3>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <button className="text-neutral-400 hover:text-neutral-900 transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Schemes', icon: FileText, count: 12 },
                { label: 'Scholarships', icon: GraduationCap, count: 8 },
                { label: 'Hospitals', icon: Hospital, count: 24 },
              ].map((item) => (
                <div key={item.label} className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center text-center group hover:border-neutral-900 transition-all cursor-pointer">
                  <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all mb-4">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{item.label}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{item.count} items active</p>
                  <button className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900">
                    <Plus size={14} /> Add New
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
