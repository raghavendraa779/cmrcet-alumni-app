import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDirectory, resetDirectory, deleteUser } from '../store/directorySlice';
import { Search, MapPin, Briefcase, GraduationCap, Users, Link as LinkIcon, Mail, FilterX, Sparkles, Trash2, Eye } from 'lucide-react';


const Directory = () => {
  const dispatch = useDispatch();
  const { profiles, isLoading } = useSelector((state) => state.directory);
  const validProfiles = Array.isArray(profiles) ? profiles : (profiles?.data || profiles?.users || []);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');

  useEffect(() => {
    dispatch(getDirectory());
    return () => { dispatch(resetDirectory()); };
  }, [dispatch]);

  // Extract unique branches and batch years for dropdowns
  const uniqueBranches = useMemo(() => {
    return [...new Set(validProfiles.map(p => p.branch).filter(Boolean))].sort();
  }, [validProfiles]);

  const uniqueBatches = useMemo(() => {
    return [...new Set(validProfiles.map(p => p.batchYear).filter(Boolean))].sort((a, b) => b - a);
  }, [validProfiles]);

  // Filter profiles
  const filteredProfiles = validProfiles.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    const matchesBranch = branchFilter === 'All' || p.branch === branchFilter;
    const matchesBatch = batchFilter === 'All' || p.batchYear === Number(batchFilter);
    
    return matchesSearch && matchesRole && matchesBranch && matchesBatch;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
    setBranchFilter('All');
    setBatchFilter('All');
  };

  const handleMyBatchmates = () => {
    if (user.role === 'Alumni' || user.role === 'Student') {
      setRoleFilter(user.role);
      setBatchFilter(user.batchYear ? user.batchYear.toString() : 'All');
      setBranchFilter(user.branch || 'All');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading directory...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
            <Users className="text-cmr-blue dark:text-blue-400" size={32} />
            Community Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Find and connect with verified CMRCET students, alumni, and faculty.</p>
        </div>
        
        {(user.role === 'Alumni' || user.role === 'Student') && (
          <button 
            onClick={handleMyBatchmates}
            className="flex items-center gap-2 bg-gradient-to-r from-cmr-orange to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} /> My Batchmates
          </button>
        )}
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search names or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-10 pr-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue dark:focus:ring-blue-500/50 focus:outline-none transition-all text-sm"
          />
        </div>
        
        {/* Dropdowns */}
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue dark:focus:ring-blue-500/50 focus:outline-none text-sm min-w-[130px]"
          >
            <option value="All">All Roles</option>
            <option value="Alumni">Alumni</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue dark:focus:ring-blue-500/50 focus:outline-none text-sm max-w-[200px] truncate"
          >
            <option value="All">All Branches</option>
            {uniqueBranches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue dark:focus:ring-blue-500/50 focus:outline-none text-sm min-w-[110px]"
          >
            <option value="All">All Years</option>
            {uniqueBatches.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button 
            onClick={clearFilters}
            className="flex items-center justify-center p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Filters"
          >
            <FilterX size={18} />
          </button>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No users found matching your filters.</p>
            <button onClick={clearFilters} className="mt-4 text-cmr-blue dark:text-blue-400 font-semibold text-sm hover:underline">Clear all filters</button>
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <ProfileCard 
              key={profile._id} 
              profile={profile} 
              currentUser={user}
              onDelete={(id) => {
                if (window.confirm('Are you sure you want to delete this user?')) {
                  dispatch(deleteUser(id));
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ProfileCard = ({ profile, currentUser, onDelete }) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800/80 p-5 hover:shadow-md dark:hover:border-slate-600 transition-all flex flex-col h-full group">
      
      {/* Avatar & Basic Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0 border border-slate-200 dark:border-slate-700">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <Link to={`/user/${profile._id}`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate hover:text-cmr-blue dark:hover:text-blue-400 transition-colors">
              {profile.name}
            </h3>
          </Link>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${

            profile.role === 'Alumni' ? 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20' :
            profile.role === 'Student' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' :
            'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
          }`}>
            {profile.role}
          </span>
        </div>
      </div>

      {/* Role Specific Details */}
      <div className="flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        
        {/* Alumni Details */}
        {profile.role === 'Alumni' && (
          <>
            <div className="flex items-start gap-2">
              <Briefcase size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-2">{profile.designation} at <span className="font-medium text-slate-800 dark:text-slate-300">{profile.company}</span></span>
            </div>
            {profile.branch && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <span className="line-clamp-2">{profile.branch}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="flex-shrink-0 text-slate-400" />
              <span className="truncate">Class of {profile.batchYear}</span>
            </div>
          </>
        )}

        {/* Student Details */}
        {profile.role === 'Student' && (
          <>
            <div className="flex items-start gap-2">
              <GraduationCap size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-2">{profile.currentYear} • {profile.branch}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="flex-shrink-0 text-slate-400" />
              <span className="truncate">Expected: {profile.batchYear}</span>
            </div>
          </>
        )}

        {/* Faculty Details */}
        {profile.role === 'Faculty' && (
          <>
            <div className="flex items-start gap-2">
              <Briefcase size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-2">{profile.designation} • {profile.department}</span>
            </div>
            <div className="flex items-start gap-2">
              <GraduationCap size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-2">{profile.subject}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center gap-2">
        <div className="flex gap-2">
          {currentUser && currentUser.role === 'Admin' && (
            <button
              onClick={() => onDelete(profile._id)}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/user/${profile._id}`} 
            className="p-2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            title="View Profile"
          >
            <Eye size={18} />
          </Link>
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="p-2 text-slate-400 hover:text-cmr-blue dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Send Email">
              <Mail size={18} />
            </a>
          )}
          {profile.linkedInUrl && (
            <a 
              href={profile.linkedInUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-colors"
              title="LinkedIn Profile"
            >
              <LinkIcon size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};



export default Directory;
