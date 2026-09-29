import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkSuggestions } from '../../store/dashboardSlice';
import { getNews } from '../../store/newsSlice';
import { getJobs } from '../../store/jobSlice';
import { Users, Briefcase, ChevronRight, Newspaper } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AlumniDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Alumni Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your network and opportunities.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs')}
          className="bg-cmr-orange dark:bg-amber-500/10 dark:text-amber-400 dark:border dark:border-amber-500/20 text-white px-5 py-2 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all text-sm whitespace-nowrap self-start"
        >
          Hire from CMR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Network & Opportunities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Batchmates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="text-cmr-blue dark:text-blue-400" size={20} /> Class of {user.batchYear} Network
              </h2>
              <Link to="/directory" className="text-sm font-semibold text-cmr-blue dark:text-blue-400 hover:underline flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {networkSuggestions.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80">
                  No other batchmates verified yet. Invite them!
                </div>
              ) : (
                networkSuggestions.map(peer => (
                  <div key={peer._id} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold">
                      {peer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{peer.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{peer.designation} at <span className="font-medium text-slate-700 dark:text-slate-300">{peer.company}</span></p>
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
                <Briefcase className="text-cmr-green dark:text-emerald-400" size={20} /> Latest Career Opportunities
              </h2>
              <Link to="/jobs" className="text-sm font-semibold text-cmr-blue dark:text-blue-400 hover:underline flex items-center">
                View Board <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {recentJobs.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <Briefcase className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={32} />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Jobs Posted Yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Be the first to post an opportunity!</p>
                </div>
              ) : (
                recentJobs.map(job => (
                  <div key={job._id} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{job.title}</h3>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{job.company}</p>
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
              <Newspaper className="text-cmr-orange dark:text-amber-400" size={20} /> Campus Updates
            </h2>
          </div>
          
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
            {recentNews.length === 0 ? (
              <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No recent news.</p>
            ) : (
              recentNews.map(item => (
                <div key={item._id} className="p-5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
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

export default AlumniDashboard;
