import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Directory from './pages/Directory';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Messages from './pages/Messages';
import Donations from './pages/Donations';
import VerifyAccount from './pages/VerifyAccount';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import Mentorship from './pages/Mentorship';
import Search from './pages/Search';
import ForgotPassword from './pages/ForgotPassword';
import AdminAnalytics from './pages/AdminAnalytics';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <Router>
      <div className={`flex h-screen overflow-hidden ${mode === 'dark' ? 'bg-[#040814]' : 'bg-slate-50'}`}>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Nav Routes */}
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />

            <Route path="/verify" element={<ProtectedRoute requireVerification={false}><VerifyAccount /></ProtectedRoute>} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
