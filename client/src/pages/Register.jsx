import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../store/authSlice';
import logo from '../assets/logo.jpg';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Alumni',
    batchYear: '',
    branch: 'Computer Science and Engineering (B.Tech CSE)',
    company: '',
    designation: 'Assistant Professor', // Default for faculty
    linkedInUrl: '',
    currentYear: '1st Year',
    department: 'Computer Science and Engineering (CSE)',
    subject: 'Programming & Software Development',
  });

  const { name, email, password, role, batchYear, branch, company, designation, linkedInUrl, currentYear, department, subject } = formData;
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
    const userData = { 
      name, email, password, role, 
      ...(role === 'Alumni' && { batchYear, branch, company, designation, linkedInUrl }),
      ...(role === 'Student' && { batchYear, branch, currentYear }),
      ...(role === 'Faculty' && { department, designation, subject }),
    };
    dispatch(register(userData));
  };

  const branches = [
    'Computer Science and Engineering (B.Tech CSE)',
    'Artificial Intelligence and Machine Learning (B.Tech AI&ML)',
    'Electronics and Communication Engineering (B.Tech ECE)',
    'Mechanical Engineering (B.Tech MECH)',
    'Civil Engineering (B.Tech CIVIL)',
    'Information Technology (B.Tech IT)',
    'Data Science (B.Tech DS)',
    'Master of Business Administration (MBA)',
    'M.Tech - Computer Science and Engineering',
    'M.Tech - Embedded Systems',
    'M.Tech - Structural Engineering'
  ];

  const facultyDepartments = [
    'Computer Science and Engineering (CSE)',
    'Humanities & Sciences (H&S)',
    'Electronics and Communication (ECE)',
    'Mechanical Engineering (MECH)',
    'Civil Engineering (CIVIL)',
    'Business Administration (MBA)'
  ];

  const facultyDesignations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Head of Department (HOD)',
    'Dean',
    'Lab Assistant'
  ];

  const facultySubjects = [
    'Programming & Software Development',
    'Artificial Intelligence & Data Science',
    'Mathematics & Statistics',
    'Physics & Chemistry',
    'Core Electronics & Communications',
    'Core Mechanical & Thermal',
    'Civil & Structural Engineering',
    'Business & Management',
    'English & Soft Skills',
    'Other / General'
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-slate-500 dark:bg-slate-900 dark:text-slate-100">Loading...</div>;
  }

  const inputClasses = "mt-1 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-cmr-blue sm:text-sm sm:leading-6 px-3 dark:bg-slate-800/80 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-400";
  const labelClasses = "block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <img className="h-16 w-auto mx-auto object-contain dark:hidden" src={logo} alt="CMR Logo" />
            <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-slate-100">
              Join the CMRCET Network
            </h2>
          </div>

          <div className="mt-10">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className={labelClasses}>Full Name</label>
                <input name="name" type="text" required value={name} onChange={onChange} className={inputClasses} />
              </div>

              <div>
                <label className={labelClasses}>Email address</label>
                <input name="email" type="email" required value={email} onChange={onChange} className={inputClasses} />
              </div>

              <div>
                <label className={labelClasses}>Password</label>
                <input name="password" type="password" required value={password} onChange={onChange} className={inputClasses} />
              </div>

              <div>
                <label className={labelClasses}>I am a...</label>
                <select name="role" value={role} onChange={onChange} className={inputClasses}>
                  <option value="Alumni">CMRCET Alumni</option>
                  <option value="Student">Current Student</option>
                  <option value="Faculty">Faculty Member</option>
                </select>
              </div>

              {/* DYNAMIC FIELDS: ALUMNI & STUDENT */}
              {(role === 'Alumni' || role === 'Student') && (
                <>
                  <div>
                    <label className={labelClasses}>Engineering Branch</label>
                    <select name="branch" value={branch} onChange={onChange} className={inputClasses}>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className={labelClasses}>
                      {role === 'Alumni' ? 'Year of Graduation' : 'Expected Year of Graduation'}
                    </label>
                    <input name="batchYear" type="number" placeholder={role === 'Alumni' ? 'e.g. 2021' : 'e.g. 2026'} value={batchYear} onChange={onChange} required className={inputClasses} />
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: ONLY ALUMNI */}
              {role === 'Alumni' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Current Company</label>
                      <input name="company" type="text" placeholder="Where do you work?" value={company} onChange={onChange} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>Designation</label>
                      <input name="designation" type="text" placeholder="e.g. SDE" value={designation} onChange={onChange} className={inputClasses} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>LinkedIn Profile URL</label>
                    <input name="linkedInUrl" type="url" placeholder="https://linkedin.com/in/..." value={linkedInUrl} onChange={onChange} className={inputClasses} />
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: ONLY STUDENT */}
              {role === 'Student' && (
                <div>
                  <label className={labelClasses}>Current Year of Study</label>
                  <select name="currentYear" value={currentYear} onChange={onChange} className={inputClasses}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year (Final Year)</option>
                  </select>
                </div>
              )}

              {/* DYNAMIC FIELDS: ONLY FACULTY */}
              {role === 'Faculty' && (
                <>
                  <div>
                    <label className={labelClasses}>Department</label>
                    <select name="department" value={department} onChange={onChange} className={inputClasses}>
                      {facultyDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Designation</label>
                    <select name="designation" value={designation} onChange={onChange} className={inputClasses}>
                      {facultyDesignations.map(desig => <option key={desig} value={desig}>{desig}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Subject Area</label>
                    <select name="subject" value={subject} onChange={onChange} className={inputClasses}>
                      {facultySubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <button type="submit" className="flex w-full justify-center rounded-xl bg-cmr-orange px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cmr-orange transition-opacity">
                  Create Account
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold leading-6 text-cmr-blue dark:text-cmr-orange hover:opacity-80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative Right Side */}
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

export default Register;
