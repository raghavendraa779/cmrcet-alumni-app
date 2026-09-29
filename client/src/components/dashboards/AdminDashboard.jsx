import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats, fetchPendingVerifications, approveUser } from '../../store/dashboardSlice';
import { ShieldCheck, CheckCircle2, Users, GraduationCap, Briefcase } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const { stats, pendingUsers, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchPendingVerifications());
  }, [dispatch]);

  const handleApprove = (id) => {
    if(window.confirm('Are you sure you want to verify this user?')) {
      dispatch(approveUser(id));
      // Re-fetch stats after approval to update the numbers
      setTimeout(() => dispatch(fetchAdminStats()), 500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">System overview and master verification queue.</p>
        </div>
        <div className="flex gap-2 self-start">
          <span className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-500/20">v1.0 MVP</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<Users size={24} />} color="text-slate-600 dark:text-slate-400" bg="bg-slate-100 dark:bg-slate-800" />
        <StatCard title="Verified Alumni" value={stats?.roles?.alumni || 0} icon={<Briefcase size={24} />} color="text-cmr-orange dark:text-amber-400" bg="bg-orange-50 dark:bg-amber-500/10" />
        <StatCard title="Verified Students" value={stats?.roles?.students || 0} icon={<GraduationCap size={24} />} color="text-cmr-green dark:text-emerald-400" bg="bg-green-50 dark:bg-emerald-500/10" />
        <StatCard title="Pending Verifications" value={stats?.unverifiedUsers || 0} icon={<ShieldCheck size={24} />} color="text-red-500 dark:text-red-400" bg="bg-red-50 dark:bg-red-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Master Verification Queue */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldCheck className="text-red-500 dark:text-red-400" size={20} /> Master Verification Queue
              </h2>
            </div>
            
            <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
              {isLoading && !pendingUsers.length ? (
                <div className="p-8 text-center text-slate-500">Loading requests...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                  System is fully caught up.
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
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              req.role === 'Alumni' ? 'bg-orange-50 text-orange-700 dark:bg-amber-500/10 dark:text-amber-400' :
                              req.role === 'Student' ? 'bg-green-50 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                              'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
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

        {/* Right Column: Future Modules */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Fundraising & Giving</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Track alumni donations and endowment campaigns.</p>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-md font-bold">Coming Soon (Phase 8)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/80 p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
