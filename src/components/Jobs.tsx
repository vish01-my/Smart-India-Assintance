import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, BookOpen, Search, Filter, ExternalLink, Star, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Jobs() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'skills'>('jobs');

  useEffect(() => {
    const fetchData = async () => {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (jobsData.length === 0) {
        setJobs([
          {
            id: '1',
            title: 'Frontend Developer',
            company: 'Tech Solutions India',
            location: 'Remote / Bangalore',
            salary: '₹8L - ₹15L',
            skills: ['React', 'TypeScript', 'Tailwind'],
            applyLink: '#'
          },
          {
            id: '2',
            title: 'Data Analyst',
            company: 'Data Insights Co.',
            location: 'Mumbai',
            salary: '₹6L - ₹12L',
            skills: ['Python', 'SQL', 'Tableau'],
            applyLink: '#'
          },
          {
            id: '3',
            title: 'Digital Marketing Specialist',
            company: 'Growth Hackers',
            location: 'Delhi',
            salary: '₹5L - ₹10L',
            skills: ['SEO', 'Google Ads', 'Content Strategy'],
            applyLink: '#'
          }
        ]);
      } else {
        setJobs(jobsData);
      }

      if (coursesData.length === 0) {
        setCourses([
          {
            id: '1',
            title: 'Full Stack Web Development',
            provider: 'Coursera (Google)',
            duration: '6 Months',
            rating: 4.8,
            link: '#'
          },
          {
            id: '2',
            title: 'Data Science Professional Certificate',
            provider: 'IBM',
            duration: '10 Months',
            rating: 4.7,
            link: '#'
          },
          {
            id: '3',
            title: 'Cloud Architecture with AWS',
            provider: 'Udacity',
            duration: '4 Months',
            rating: 4.9,
            link: '#'
          }
        ]);
      } else {
        setCourses(coursesData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Jobs & Skill Development</h1>
          <p className="text-neutral-500 mt-1">Personalized career recommendations and skill-building courses.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={cn(
            "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'jobs' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Job Recommendations
          {activeTab === 'jobs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={cn(
            "px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'skills' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
          )}
        >
          Skill Development
          {activeTab === 'skills' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'jobs' ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 border border-neutral-100">
                          <Briefcase size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900">{job.title}</h3>
                          <p className="text-sm text-neutral-500">{job.company} • {job.location}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {job.salary}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill: string) => (
                        <span key={skill} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Zap size={12} className="text-amber-500" />
                        <span className="font-bold text-neutral-900">95% Match</span> based on your profile
                      </div>
                      <a
                        href={job.applyLink}
                        className="flex items-center gap-2 text-sm font-bold text-neutral-900 hover:gap-3 transition-all"
                      >
                        Apply Now <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-neutral-50 rounded-xl text-neutral-900">
                        <BookOpen size={24} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-neutral-900">{course.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-neutral-500 mb-6 flex-1">{course.provider} • {course.duration}</p>

                    <a
                      href={course.link}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Start Learning <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Profile Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                Skill Profile
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Web Development</span>
                    <span className="text-xs font-bold text-neutral-900">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Data Analysis</span>
                    <span className="text-xs font-bold text-neutral-900">40%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">UI/UX Design</span>
                    <span className="text-xs font-bold text-neutral-900">60%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-900 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition-colors">
                Update Skills
              </button>
            </div>

            <div className="bg-neutral-900 text-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold mb-4">Career Advice</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Based on your interest in Frontend Development, we recommend learning **Next.js** and **TypeScript** to increase your job match by 20%.
              </p>
              <button className="mt-6 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Read More <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
