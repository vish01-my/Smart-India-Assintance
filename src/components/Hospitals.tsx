import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Hospital as HospitalIcon, Search, MapPin, Phone, Navigation, ExternalLink, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation(position),
        (error) => console.error("Geolocation error: ", error)
      );
    }

    const fetchHospitals = async () => {
      const querySnapshot = await getDocs(collection(db, 'hospitals'));
      const hospitalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (hospitalsData.length === 0) {
        setHospitals([
          {
            id: '1',
            name: 'AIIMS New Delhi',
            address: 'Ansari Nagar, New Delhi, Delhi 110029',
            contact: '011 2658 8500',
            rating: 4.5,
            type: 'Public',
            specialties: ['General Medicine', 'Cardiology', 'Neurology']
          },
          {
            id: '2',
            name: 'Apollo Hospital',
            address: 'Sarita Vihar, Delhi Mathura Road, New Delhi, Delhi 110076',
            contact: '011 2692 5858',
            rating: 4.2,
            type: 'Private',
            specialties: ['Orthopedics', 'Oncology', 'Transplant']
          },
          {
            id: '3',
            name: 'Fortis Memorial Research Institute',
            address: 'Sector 44, Gurugram, Haryana 122002',
            contact: '0124 4921021',
            rating: 4.4,
            type: 'Private',
            specialties: ['Pediatrics', 'Gynecology', 'Urology']
          },
          {
            id: '4',
            name: 'Safdarjung Hospital',
            address: 'Ansari Nagar East, New Delhi, Delhi 110029',
            contact: '011 2673 0000',
            rating: 3.8,
            type: 'Public',
            specialties: ['Emergency', 'Burn Unit', 'General Surgery']
          }
        ]);
      } else {
        setHospitals(hospitalsData);
      }
      setLoading(false);
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Hospital Finder</h1>
          <p className="text-neutral-500 mt-1">Locate nearby hospitals and healthcare facilities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-600 uppercase tracking-widest shadow-sm">
          <MapPin size={14} className="text-neutral-400" />
          {userLocation ? 'Location Active' : 'Location Disabled'}
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by hospital name or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-32 h-32 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 border border-neutral-100">
                <HospitalIcon size={48} />
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{hospital.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-neutral-900">{hospital.rating}</span>
                      <span className="text-xs text-neutral-400 ml-1">Rating</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                    hospital.type === 'Public' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {hospital.type}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-neutral-500 flex items-start gap-2">
                    <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                    {hospital.address}
                  </p>
                  <p className="text-sm text-neutral-500 flex items-center gap-2">
                    <Phone size={16} className="text-neutral-400 shrink-0" />
                    {hospital.contact}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {hospital.specialties.map((spec: string) => (
                    <span key={spec} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-600">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-neutral-100">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                    <Navigation size={16} /> Directions
                  </button>
                  <button className="p-2 border border-neutral-200 rounded-lg text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-all">
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredHospitals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No hospitals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
