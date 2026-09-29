import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Search as SearchIcon, Users, Briefcase, Calendar, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [location.search]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.data);
      
      const newUrl = `${location.pathname}?q=${encodeURIComponent(searchQuery)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      {/* Search Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-center gap-3">
          <SearchIcon className="text-cmr-blue dark:text-blue-400" size={32} />
          Global Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Search across alumni, students, jobs, events, and news articles.
        </p>
        
        <form onSubmit={onSubmit} className="relative shadow-sm rounded-2xl overflow-hidden group border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-cmr-blue dark:focus-within:ring-blue-500/50 transition-all">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cmr-blue dark:group-focus-within:text-blue-400">
            <SearchIcon size={22} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, companies, job titles, event topics..."
            className="w-full pl-12 pr-24 py-4 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 outline-none text-lg placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-2 right-2 px-6 bg-cmr-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center mb-8">
          {error}
        </div>
      )}

      {/* Search Results */}
      {results && !loading && (
        <div className="space-y-10">
          
          {/* Users */}
          {results.users && results.users.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Users className="text-cmr-orange" size={24} /> Users
                </h2>
                <Link to="/directory" className="text-sm font-medium text-cmr-blue dark:text-blue-400 hover:underline flex items-center gap-1">
                  View Directory <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map(user => (
                  <Link key={user._id} to={`/user/${user._id}`} className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{user.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                      {(user.company || user.designation) && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{user.designation} {user.company ? `at ${user.company}` : ''}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {results.jobs && results.jobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="text-emerald-500" size={24} /> Jobs & Opportunities
                </h2>
                <Link to="/jobs" className="text-sm font-medium text-cmr-blue dark:text-blue-400 hover:underline flex items-center gap-1">
                  View All Jobs <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map(job => (
                  <Link key={job._id} to="/jobs" className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{job.title}</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{job.company}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{job.type}</span>
                      <span>{job.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {results.events && results.events.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="text-purple-500" size={24} /> Events
                </h2>
                <Link to="/events" className="text-sm font-medium text-cmr-blue dark:text-blue-400 hover:underline flex items-center gap-1">
                  View All Events <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.events.map(event => (
                  <Link key={event._id} to="/events" className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-md font-medium">{event.type}</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {results.news && results.news.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Newspaper className="text-blue-500" size={24} /> News & Updates
                </h2>
                <Link to="/news" className="text-sm font-medium text-cmr-blue dark:text-blue-400 hover:underline flex items-center gap-1">
                  View All News <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.news.map(item => (
                  <Link key={item._id} to="/news" className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 block uppercase tracking-wider">{item.category}</span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.users.length === 0 && results.jobs.length === 0 && results.events.length === 0 && results.news.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">No results found</h3>
              <p className="text-slate-500 dark:text-slate-400">We couldn't find anything matching "{query}". Try different keywords.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Search;
