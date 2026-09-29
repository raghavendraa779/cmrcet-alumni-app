import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkSuggestions } from '../../store/dashboardSlice';
import { getNews } from '../../store/newsSlice';
import { getJobs } from '../../store/jobSlice';
import { Users, Briefcase, ChevronRight, Newspaper, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const { networkSuggestions } = useSelector((state) => state.dashboard);
  const { news } = useSelector((state) => state.news);
  const { jobs } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchNetworkSuggestions());
    dispatch(getNews());
    dispatch(getJobs());
  }, [dispatch]);

  const recentNews = news.slice(0, 2);
  const recentJobs = jobs.slice(0, 2);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Network & Opportunities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mentor Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="text-cmr-green dark:text-emerald-400" size={20} /> Suggested Mentors
              </h2>
              <Link to="/directory" className="text-sm font-semibold text-cmr-blue dark:text-blue-400 hover:underline flex items-center">
                View Directory <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {networkSuggestions.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80">
                  No verified alumni from your branch yet. Check back soon!
                </div>
              ) : (
                networkSuggestions.map(mentor => (
                  <div key={mentor._id} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-green dark:text-emerald-400 flex items-center justify-center font-bold">
                      {mentor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{mentor.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{mentor.designation} at <span className="font-medium text-slate-700 dark:text-slate-300">{mentor.company}</span></p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">Class of {mentor.batchYear}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job Board */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Briefcase className="text-cmr-orange dark:text-amber-400" size={20} /> Latest Opportunities
              </h2>
              <Link to="/jobs" className="text-sm font-semibold text-cmr-blue dark:text-blue-400 hover:underline flex items-center">
                Explore Jobs <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {recentJobs.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <Briefcase className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={32} />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Job Board Coming Soon</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Alumni will post internships and jobs here.</p>
                </div>
              ) : (
                recentJobs.map(job => (
                  <div key={job._id} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{job.title}</h3>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <MapPin size={14} className="text-slate-400" /> {job.company} • {job.location}
                        </p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">{job.description.replace(/[#*]/g, '')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: News */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Newspaper className="text-cmr-blue dark:text-blue-400" size={20} /> Campus News
            </h2>
          </div>
          
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
            {recentNews.length === 0 ? (
              <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No recent news.</p>
            ) : (
              recentNews.map(item => (
                <div key={item._id} className="p-5 border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                  <Link to="/news" className="text-xs font-semibold text-cmr-blue dark:text-blue-400 hover:underline">Read more</Link>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default StudentDashboard;
