import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Search, Filter, Calendar, ExternalLink, Info, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Scholarships() {
  const { profile } = useAuth();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchScholarships = async () => {
      const querySnapshot = await getDocs(collection(db, 'scholarships'));
      const scholarshipsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (scholarshipsData.length === 0) {
        setScholarships([
          {
            id: '1',
            title: 'National Scholarship Portal (NSP)',
            description: 'One-stop solution for various scholarship schemes offered by Central and State governments.',
            deadline: '2026-10-31',
            applyLink: 'https://scholarships.gov.in/',
            category: 'Government',
            eligibility: { income: 250000, marks: 50 }
          },
          {
            id: '2',
            title: 'HDFC Bank Parivartan ECS Scholarship',
            description: 'Merit-cum-means scholarship for students from Class 6 to post-graduation.',
            deadline: '2026-09-30',
            applyLink: 'https://www.buddy4study.com/page/hdfc-bank-parivartan-ecs-scholarship',
            category: 'Private',
            eligibility: { income: 600000, marks: 60 }
          },
          {
            id: '3',
            title: 'INSPIRE Scholarship',
            description: 'Scholarship for Higher Education (SHE) for students pursuing Basic and Natural Sciences.',
            deadline: '2026-12-15',
            applyLink: 'https://online-inspire.gov.in/',
            category: 'Science',
            eligibility: { marks: 95 }
          },
          {
            id: '4',
            title: 'Reliance Foundation Undergraduate Scholarship',
            description: 'Supports students from all fields of study with a focus on merit and need.',
            deadline: '2026-11-20',
            applyLink: 'https://www.reliancefoundation.org/scholarships',
            category: 'Private',
            eligibility: { income: 1500000, marks: 60 }
          }
        ]);
      } else {
        setScholarships(scholarshipsData);
      }
      setLoading(false);
    };

    fetchScholarships();
  }, []);

  const categories = ['All', ...new Set(scholarships.map(s => s.category))];

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scholarship.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isEligible = (scholarship: any) => {
    if (!profile) return false;
    const { eligibility } = scholarship;
    if (!eligibility) return true;

    if (eligibility.income && profile.income > eligibility.income) return false;
    // Assuming profile has marks, otherwise skip marks check
    if (eligibility.marks && profile.marks && profile.marks < eligibility.marks) return false;

    return true;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Scholarship Finder</h1>
          <p className="text-neutral-500 mt-1">Find and apply for scholarships based on your academic profile.</p>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                selectedCategory === category
                  ? "bg-neutral-900 text-white shadow-md"
                  : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-400"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScholarships.map((scholarship) => (
            <div key={scholarship.id} className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
              {scholarship.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={scholarship.imageUrl} 
                    alt={scholarship.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-neutral-50 rounded-xl text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                      {scholarship.category}
                    </span>
                    {profile && isEligible(scholarship) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle size={10} /> Eligible
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-2">{scholarship.title}</h3>
                <p className="text-sm text-neutral-500 mb-6 flex-1">{scholarship.description}</p>

                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar size={14} className="text-neutral-400" />
                      Deadline: <span className="font-bold text-neutral-900">{new Date(scholarship.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Info size={14} className="text-neutral-400" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {scholarship.eligibility?.income ? `Max Income: ₹${scholarship.eligibility.income / 100000}L` : 'Merit Based'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={scholarship.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Apply Now <ExternalLink size={14} />
                    </a>
                    <button className="p-2 border border-neutral-200 rounded-lg text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all">
                      <Info size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredScholarships.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No scholarships found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
