import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { FileText, Search, Filter, CheckCircle, ExternalLink, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Schemes() {
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchSchemes = async () => {
      const querySnapshot = await getDocs(collection(db, 'schemes'));
      const schemesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no schemes in DB, use some initial data for demo
      if (schemesData.length === 0) {
        setSchemes([
          {
            id: '1',
            title: 'PM-Kisan Samman Nidhi',
            description: 'Income support of ₹6,000 per year to all landholding farmers.',
            benefits: '₹2,000 every 4 months directly to bank account.',
            eligibility: { occupation: 'Farmer', income: 200000 },
            applyLink: 'https://pmkisan.gov.in/',
            category: 'Agriculture'
          },
          {
            id: '2',
            title: 'Ayushman Bharat (PM-JAY)',
            description: 'World\'s largest health insurance scheme providing ₹5 lakh per family per year.',
            benefits: 'Cashless treatment at public and private empanelled hospitals.',
            eligibility: { income: 500000 },
            applyLink: 'https://pmjay.gov.in/',
            category: 'Health'
          },
          {
            id: '3',
            title: 'PM Awas Yojana (PMAY)',
            description: 'Affordable housing for all by providing interest subsidy on home loans.',
            benefits: 'Subsidy up to ₹2.67 lakh on home loan interest.',
            eligibility: { income: 1800000 },
            applyLink: 'https://pmay-urban.gov.in/',
            category: 'Housing'
          },
          {
            id: '4',
            title: 'Atal Pension Yojana',
            description: 'Pension scheme for workers in the unorganized sector.',
            benefits: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month.',
            eligibility: { age: 40 },
            applyLink: 'https://npscra.nsdl.co.in/scheme-details.php',
            category: 'Social Security'
          }
        ]);
      } else {
        setSchemes(schemesData);
      }
      setLoading(false);
    };

    fetchSchemes();
  }, []);

  const categories = ['All', ...new Set(schemes.map(s => s.category))];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isEligible = (scheme: any) => {
    if (!profile) return false;
    const { eligibility } = scheme;
    if (!eligibility) return true;

    if (eligibility.age && profile.age > eligibility.age) return false;
    if (eligibility.income && profile.income > eligibility.income) return false;
    if (eligibility.occupation && profile.occupation !== eligibility.occupation) return false;

    return true;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Government Schemes</h1>
          <p className="text-neutral-500 mt-1">Discover and apply for central and state government schemes.</p>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X size={16} />
            </button>
          )}
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
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="group bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-neutral-50 rounded-xl text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                    {scheme.category}
                  </span>
                  {profile && isEligible(scheme) && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      <CheckCircle size={10} /> Eligible
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 mb-2">{scheme.title}</h3>
              <p className="text-sm text-neutral-500 mb-6 flex-1">{scheme.description}</p>

              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Benefits</p>
                    <p className="text-xs text-neutral-500 mt-1">{scheme.benefits}</p>
                  </div>
                </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={scheme.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Apply <ExternalLink size={14} />
                    </a>
                    <button className="p-2 border border-neutral-200 rounded-lg text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all">
                      <Info size={18} />
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSchemes.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No schemes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
