import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not verified, and this route requires verification
  if (requireVerification && !user.isVerified && location.pathname !== '/verify') {
    return <Navigate to="/verify" replace />;
  }

  // If user IS verified, but tries to access the /verify page, send them to dashboard
  if (user.isVerified && location.pathname === '/verify') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
