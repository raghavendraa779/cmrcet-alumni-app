import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyUserAccount, reset, logout } from '../store/authSlice';
import { ShieldAlert, CheckCircle2, Mail, LogOut } from 'lucide-react';
import logo from '../assets/logo.jpg';

const VerifyAccount = () => {
  const [orgEmail, setOrgEmail] = useState('');
  const [manualRequested, setManualRequested] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user?.isVerified) {
      navigate('/');
    }
    if (isError) {
      alert(message);
    }
    dispatch(reset());
  }, [isSuccess, isError, message, user, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyUserAccount(orgEmail));
  };

  const requestManual = () => {
    setManualRequested(true);
    // In a real app, this would dispatch an action to notify admins
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img className="mx-auto h-16 w-auto object-contain" src={logo} alt="CMR Logo" />
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Account Verification
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          To protect the CMRCET network, please verify your identity.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          <div className="rounded-xl bg-orange-50 p-4 mb-6 border border-orange-100 flex gap-3">
            <ShieldAlert className="text-cmr-orange flex-shrink-0" size={24} />
            <p className="text-sm text-orange-800">
              Your account is currently <strong>unverified</strong>. You cannot access the dashboard until you are approved.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Fast Track: College Email
              </label>
              <div className="mt-2 text-sm text-slate-500 mb-2">
                Enter your official @cmrcet.ac.in email address to be verified instantly.
              </div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="yourname@cmrcet.ac.in"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-cmr-blue sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl bg-cmr-blue px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cmr-blue-dark transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cmr-blue disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-slate-500">Don't have one?</span>
              </div>
            </div>

            <div className="mt-6">
              {manualRequested ? (
                <div className="rounded-xl bg-green-50 p-4 border border-green-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <span className="text-sm text-green-800 font-medium">Request sent to Admin!</span>
                </div>
              ) : (
                <button
                  onClick={requestManual}
                  className="flex w-full justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Request Manual Approval
                </button>
              )}
              <p className="mt-3 text-xs text-center text-slate-400">
                An administrator will review your account details manually. This may take up to 48 hours.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cmr-blue transition-colors"
          >
            <LogOut size={16} /> Logout instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
