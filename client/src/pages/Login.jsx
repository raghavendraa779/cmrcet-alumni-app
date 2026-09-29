import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen dark:bg-slate-900 dark:text-slate-100">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <img className="h-16 w-auto mx-auto object-contain dark:hidden" src={logo} alt="CMR Logo" />
            {/* Adding a placeholder for dark mode logo if needed, or just keep same */}
            <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-slate-100">
              Sign in to AlumniHub
            </h2>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={onChange}
                    className="block w-full rounded-xl border-0 py-2 text-slate-900 dark:text-slate-100 dark:bg-slate-800/80 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cmr-blue sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={onChange}
                    className="block w-full rounded-xl border-0 py-2 text-slate-900 dark:text-slate-100 dark:bg-slate-800/80 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-cmr-blue sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-cmr-blue px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cmr-blue transition-opacity"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Not a member?{' '}
              <Link
                to="/register"
                className="font-semibold leading-6 text-cmr-blue dark:text-cmr-orange hover:opacity-80"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-cmr-blue overflow-hidden dark:bg-[#111827]">
        <div className="absolute inset-0 bg-gradient-to-br from-cmr-blue to-cmr-blue-dark dark:from-slate-800 dark:to-[#040814]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white w-full max-w-lg px-8">
          <img className="h-40 w-auto mx-auto object-contain mb-8 filter brightness-0 invert" src={logo} alt="CMR Logo" />
          <h2 className="text-4xl font-bold mb-4">EXPLORE TO INVENT</h2>
          <p className="text-lg text-indigo-100 dark:text-slate-300 mx-auto">
            Connect with peers, find mentorship, and grow your professional network within the CMR College of Engineering & Technology community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
