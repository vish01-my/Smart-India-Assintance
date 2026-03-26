import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Plus, Search, Filter, Camera, MapPin, Clock, CheckCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('Road');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const categories = ['Road', 'Garbage', 'Water', 'Street Light', 'Pollution'];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'complaints'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(complaintsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      toast.error("Failed to load complaints");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'complaints'), {
        uid: user.uid,
        category,
        description,
        location,
        imageUrl: image,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Complaint registered successfully');
      setShowForm(false);
      setDescription('');
      setLocation('');
      setImage(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={12} />;
      case 'In Progress': return <Clock size={12} />;
      case 'Resolved': return <CheckCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Public Complaints</h1>
          <p className="text-neutral-500 mt-1">Register and track complaints about public services.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors shadow-lg"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> New Complaint</>}
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-neutral-400" />
            Register New Complaint
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                        category === cat
                          ? "bg-neutral-900 text-white shadow-md"
                          : "bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or landmark"
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Upload Image (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-neutral-200 transition-colors">
                  <Camera size={18} />
                  {image ? 'Change Image' : 'Select Image'}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {image && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute top-0 right-0 p-0.5 bg-neutral-900 text-white rounded-bl-lg"
                    >
                      <Plus size={12} className="rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors shadow-lg"
            >
              Submit Complaint
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
              {complaint.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img src={complaint.imageUrl} alt="Complaint" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                    getStatusColor(complaint.status)
                  )}>
                    {getStatusIcon(complaint.status)} {complaint.status}
                  </span>
                  <button className="text-neutral-400 hover:text-neutral-900 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-1">{complaint.category}</h3>
                <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                  <MapPin size={12} /> {complaint.location}
                </p>
                
                <p className="text-sm text-neutral-600 mb-6 flex-1 line-clamp-3">{complaint.description}</p>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <button className="text-xs font-bold text-neutral-900 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {complaints.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-neutral-200">
          <AlertCircle size={48} className="mx-auto text-neutral-200 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900">No complaints yet</h3>
          <p className="text-neutral-500 mt-1">Register your first complaint to track public service issues.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-6 py-2 bg-neutral-900 text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors"
          >
            New Complaint
          </button>
        </div>
      )}
    </div>
  );
}
