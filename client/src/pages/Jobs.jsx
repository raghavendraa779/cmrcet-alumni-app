import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getJobs, createJob, deleteJob } from '../store/jobSlice';
import { Briefcase, MapPin, Building2, ExternalLink, Trash2, Search, Filter, Plus, FileText, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs, isLoading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time', description: '', requirements: '', applyLink: ''
  });

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location || !formData.applyLink) {
      return toast.error('Please fill in all required fields.');
    }
    dispatch(createJob(formData));
    toast.success('Job posted successfully!');
    setFormData({ title: '', company: '', location: '', type: 'Full-time', description: '', requirements: '', applyLink: '' });
    setShowForm(false);
  };

  const validJobs = Array.isArray(jobs) ? jobs : (jobs?.data || jobs?.jobs || []);
  const filteredJobs = validJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const canPostJob = user.role === 'Admin' || user.role === 'Alumni';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
            <Briefcase className="text-cmr-blue dark:text-blue-400" size={32} />
            Career Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Discover job opportunities and internships posted by the CMRCET network.</p>
        </div>
        
        {canPostJob && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-cmr-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Post a Job
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Job List & Filters */}
        <div className="flex-1 space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-cmr-blue dark:text-white focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {['All', 'Full-time', 'Part-time', 'Internship', 'Contract'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                    typeFilter === type 
                    ? 'bg-cmr-blue text-white border-cmr-blue shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Post Job Form (Collapsible) */}
          {showForm && (
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm mb-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-cmr-orange dark:text-amber-400"/> Post a New Opportunity
              </h2>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Job Title (e.g. Software Engineer)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                  <input type="text" placeholder="Company Name" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Location (e.g. Hyderabad or Remote)" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <input type="url" placeholder="Application Link (URL)" required value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                
                <textarea placeholder="Job Description (Markdown supported)" required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                <textarea placeholder="Requirements / Qualifications (Markdown supported)" rows="3" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="bg-cmr-blue text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">Publish Job</button>
                </div>
              </form>
            </div>
          )}

          {/* Job Feed */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Briefcase className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No opportunities found.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} user={user} dispatch={dispatch} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job, user, dispatch }) => {
  const [expanded, setExpanded] = useState(false);
  const isAuthor = job.author._id === user._id;
  const isAdmin = user.role === 'Admin';

  const handleDelete = () => {
    if(window.confirm('Delete this job posting?')) {
      dispatch(deleteJob(job._id));
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
      
      {/* Left side color accent based on job type */}
      <div className={`w-2 hidden sm:block ${
        job.type === 'Internship' ? 'bg-emerald-500' : 
        job.type === 'Full-time' ? 'bg-cmr-blue' : 
        'bg-cmr-orange'
      }`}></div>

      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-cmr-blue transition-colors">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-300">
                <Building2 size={16} className="text-slate-400"/> {job.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400"/> {job.location}
              </span>
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                job.type === 'Internship' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400' :
                job.type === 'Full-time' ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400' :
                'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
                {job.type}
              </span>
            </div>
          </div>
          
          {(isAuthor || isAdmin) && (
            <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="mt-4">
          <div className={`prose prose-sm dark:prose-invert max-w-none prose-slate prose-a:text-cmr-blue ${!expanded ? 'line-clamp-2' : ''}`}>
            <ReactMarkdown>{job.description}</ReactMarkdown>
          </div>
          
          {expanded && job.requirements && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500"/> Requirements
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-slate">
                <ReactMarkdown>{job.requirements}</ReactMarkdown>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm font-medium text-cmr-blue dark:text-blue-400 hover:underline"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-xs">
              {job.author.name.charAt(0)}
            </div>
            <div className="text-xs">
              <p className="text-slate-500 dark:text-slate-400">Posted by</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{job.author.name}</p>
            </div>
          </div>
          
          <a 
            href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors"
          >
            Apply Now <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
