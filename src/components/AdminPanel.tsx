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
  const [contentTab, setContentTab] = useState<'schemes' | 'scholarships' | 'hospitals' | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScholarship, setNewScholarship] = useState({
    title: '',
    description: '',
    category: 'Merit Based',
    deadline: '',
    applyLink: '',
    imageUrl: '',
    eligibility: {
      income: 0,
      education: 'Any'
    }
  });

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

    const unsubscribeScholarships = onSnapshot(collection(db, 'scholarships'), (snapshot) => {
      setScholarships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchUsers();
    return () => {
      unsubscribeComplaints();
      unsubscribeScholarships();
    };
  }, [profile]);

  const handleAddScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'scholarships'), {
        ...newScholarship,
        createdAt: new Date().toISOString()
      });
      toast.success('Scholarship added successfully');
      setShowAddModal(false);
      setNewScholarship({
        title: '',
        description: '',
        category: 'Merit Based',
        deadline: '',
        applyLink: '',
        imageUrl: '',
        eligibility: { income: 0, education: 'Any' }
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteScholarship = async (id: string) => {
    try {
      // In a real app, we'd use deleteDoc, but for now let's just toast
      toast.info('Delete functionality would go here');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
            <div className="space-y-6">
              {!contentTab ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'schemes', label: 'Schemes', icon: FileText, count: 12 },
                    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, count: scholarships.length },
                    { id: 'hospitals', label: 'Hospitals', icon: Hospital, count: 24 },
                  ].map((item) => (
                    <div 
                      key={item.label} 
                      onClick={() => setContentTab(item.id as any)}
                      className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center text-center group hover:border-neutral-900 transition-all cursor-pointer"
                    >
                      <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-all mb-4">
                        <item.icon size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">{item.label}</h3>
                      <p className="text-sm text-neutral-500 mt-1">{item.count} items active</p>
                      <button className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900">
                        <Plus size={14} /> Manage
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setContentTab(null)}
                      className="text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      ← Back to Content
                    </button>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      <Plus size={16} /> Add {contentTab.charAt(0).toUpperCase() + contentTab.slice(1)}
                    </button>
                  </div>

                  {contentTab === 'scholarships' && (
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Scholarship</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">Deadline</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {scholarships.map((s) => (
                            <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {s.imageUrl && (
                                    <img src={s.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-neutral-200" referrerPolicy="no-referrer" />
                                  )}
                                  <span className="text-sm font-bold text-neutral-900">{s.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                  {s.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                                  {new Date(s.deadline).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => deleteScholarship(s.id)}
                                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add Scholarship Modal */}
                  {showAddModal && contentTab === 'scholarships' && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold text-neutral-900">Add New Scholarship</h2>
                          <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-900">
                            <Plus size={24} className="rotate-45" />
                          </button>
                        </div>

                        <form onSubmit={handleAddScholarship} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Title</label>
                              <input
                                required
                                type="text"
                                value={newScholarship.title}
                                onChange={(e) => setNewScholarship({ ...newScholarship, title: e.target.value })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Category</label>
                              <select
                                value={newScholarship.category}
                                onChange={(e) => setNewScholarship({ ...newScholarship, category: e.target.value })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              >
                                <option value="Merit Based">Merit Based</option>
                                <option value="Need Based">Need Based</option>
                                <option value="Minority">Minority</option>
                                <option value="Sports">Sports</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Description</label>
                            <textarea
                              required
                              rows={3}
                              value={newScholarship.description}
                              onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                              className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Deadline</label>
                              <input
                                required
                                type="date"
                                value={newScholarship.deadline}
                                onChange={(e) => setNewScholarship({ ...newScholarship, deadline: e.target.value })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Apply Link</label>
                              <input
                                required
                                type="url"
                                value={newScholarship.applyLink}
                                onChange={(e) => setNewScholarship({ ...newScholarship, applyLink: e.target.value })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Image URL</label>
                            <input
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={newScholarship.imageUrl}
                              onChange={(e) => setNewScholarship({ ...newScholarship, imageUrl: e.target.value })}
                              className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                            />
                            <p className="text-[10px] text-neutral-400">Provide a direct link to an image for this scholarship.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Max Income (₹)</label>
                              <input
                                type="number"
                                value={newScholarship.eligibility.income}
                                onChange={(e) => setNewScholarship({ 
                                  ...newScholarship, 
                                  eligibility: { ...newScholarship.eligibility, income: parseInt(e.target.value) } 
                                })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Min Education</label>
                              <select
                                value={newScholarship.eligibility.education}
                                onChange={(e) => setNewScholarship({ 
                                  ...newScholarship, 
                                  eligibility: { ...newScholarship.eligibility, education: e.target.value } 
                                })}
                                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
                              >
                                <option value="Any">Any</option>
                                <option value="10th Pass">10th Pass</option>
                                <option value="12th Pass">12th Pass</option>
                                <option value="Graduate">Graduate</option>
                                <option value="Post Graduate">Post Graduate</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowAddModal(false)}
                              className="flex-1 px-6 py-3 border border-neutral-200 text-neutral-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-50 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
                            >
                              Add Scholarship
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
