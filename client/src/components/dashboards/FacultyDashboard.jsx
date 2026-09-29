import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingVerifications, approveUser } from '../../store/dashboardSlice';
import { getNews } from '../../store/newsSlice';
import { ShieldCheck, CheckCircle2, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const { pendingUsers, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchPendingVerifications());
    dispatch(getNews()); // We fetch news just to pre-cache it if needed, or we could show latest posts.
  }, [dispatch]);

  const handleApprove = (id) => {
    if(window.confirm('Are you sure you want to verify this user?')) {
      dispatch(approveUser(id));
    }
  };

  const departmentPending = pendingUsers.filter(u => u.department === user.department || u.branch?.includes(user.department?.split('(')[0]?.trim()));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Verification Queue */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck className="text-cmr-orange dark:text-amber-400" size={20} /> Verification Queue
              </h2>
            </div>
            
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading requests...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                  All caught up! No pending verifications.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {pendingUsers.map(req => (
                    <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            {req.name}
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 font-medium">
                              {req.role}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {req.email} {req.organizationEmail ? `• Org: ${req.organizationEmail}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {req.role === 'Student' ? `${req.branch} (Expected ${req.batchYear})` : 
                             req.role === 'Alumni' ? `${req.company} (Class of ${req.batchYear})` : req.department}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(req._id)}
                        className="bg-cmr-green dark:bg-emerald-500/10 dark:text-emerald-400 dark:border dark:border-emerald-500/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-center"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats / Broadcast */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cmr-blue to-cmr-blue-dark dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 text-white shadow-sm border border-transparent dark:border-slate-700">
            <h3 className="font-bold text-lg mb-2">Post Announcement</h3>
            <p className="text-blue-100 dark:text-slate-300 text-sm mb-4">Have an important update for the students or alumni? Broadcast it to the Campus News feed instantly.</p>
            <Link to="/news" className="inline-block bg-white text-cmr-blue dark:bg-blue-500/20 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors">
              Go to News Feed
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center">
              <Users className="mx-auto text-cmr-green dark:text-emerald-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dir</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">View Students</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center">
              <GraduationCap className="mx-auto text-cmr-orange dark:text-amber-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dir</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">View Alumni</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
