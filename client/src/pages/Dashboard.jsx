import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import AlumniDashboard from '../components/dashboards/AlumniDashboard';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import FacultyDashboard from '../components/dashboards/FacultyDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && !sessionStorage.getItem('welcomeToastShown')) {
      toast.success(`Welcome back, ${user.name}!`, {
        icon: '👋',
        style: {
          borderRadius: '12px',
          background: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      });
      sessionStorage.setItem('welcomeToastShown', 'true');
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {user.role === 'Admin' && <AdminDashboard user={user} />}
      {user.role === 'Alumni' && <AlumniDashboard user={user} />}
      {user.role === 'Student' && <StudentDashboard user={user} />}
      {user.role === 'Faculty' && <FacultyDashboard user={user} />}
    </div>
  );
};

export default Dashboard;
