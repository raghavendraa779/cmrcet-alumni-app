import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';
import toast from 'react-hot-toast';
import { User, Briefcase, GraduationCap, Link as LinkIcon, Building2, MapPin, Map, UserCircle2, Globe, Trophy, Code, Heart, AlignLeft } from 'lucide-react';
import { FaGithub as Github, FaTwitter as Twitter } from 'react-icons/fa';
const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '', batchYear: '', branch: '', company: '', designation: '', linkedInUrl: '',
    currentYear: '', department: '', subject: '', bio: '', githubUrl: '', twitterUrl: '',
    portfolioUrl: '', achievements: '', skills: '', interests: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        batchYear: user.batchYear || '',
        branch: user.branch || '',
        company: user.company || '',
        designation: user.designation || '',
        linkedInUrl: user.linkedInUrl || '',
        currentYear: user.currentYear || '',
        department: user.department || '',
        subject: user.subject || '',
        bio: user.bio || '',
        githubUrl: user.githubUrl || '',
        twitterUrl: user.twitterUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        achievements: (user.achievements || []).join(', '),
        skills: (user.skills || []).join(', '),
        interests: (user.interests || []).join(', '),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse comma-separated fields into arrays
    const parsedData = {
      ...formData,
      achievements: formData.achievements.split(',').map(s => s.trim()).filter(Boolean),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
    };

    dispatch(updateProfile(parsedData))
      .unwrap()
      .then(() => toast.success('Profile updated successfully!'))
      .catch((err) => toast.error(`Error: ${err}`));
  };

  if (!user) return null;

  const isAlumni = user.role === 'Alumni';
  const isStudent = user.role === 'Student';
  const isFaculty = user.role === 'Faculty';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle2 className="text-cmr-blue dark:text-blue-400" size={32} />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 p-6 md:p-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold text-4xl flex-shrink-0 border-4 border-white dark:border-slate-900 shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-2">{user.email}</p>
            <span className="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Basic Info */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2 dark:border-slate-800">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" required />
                </div>
              </div>

              {/* Student/Alumni Specifics */}
              {(isStudent || isAlumni) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. Computer Science (CSE)" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{isAlumni ? 'Graduation Year' : 'Expected Graduation Year'}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><GraduationCap className="h-4 w-4 text-slate-400" /></div>
                      <input type="number" name="batchYear" value={formData.batchYear} onChange={handleChange} placeholder="e.g. 2024" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                    </div>
                  </div>
                </>
              )}

              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Year</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Map className="h-4 w-4 text-slate-400" /></div>
                    <select name="currentYear" value={formData.currentYear} onChange={handleChange} className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all">
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Faculty Specifics */}
              {isFaculty && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Professor" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><GraduationCap className="h-4 w-4 text-slate-400" /></div>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g. Data Structures" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Professional Details */}
          {(isAlumni || isStudent) && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2 dark:border-slate-800">Professional Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder={isStudent ? "e.g. Microsoft (Intern)" : "e.g. Google"} className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Software Engineer" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Bio</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none"><AlignLeft className="h-4 w-4 text-slate-400" /></div>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us a little about yourself..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all"></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tech Stack & Skills (Comma separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Code className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python, AWS..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interests & Hobbies (Comma separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Heart className="h-4 w-4 text-slate-400" /></div>
                    <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="Machine Learning, Startups, Chess..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Social & Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2 dark:border-slate-800">Links & Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-4 w-4 text-slate-400" /></div>
                  <input type="url" name="linkedInUrl" value={formData.linkedInUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Github className="h-4 w-4 text-slate-400" /></div>
                  <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Twitter / X Profile</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Twitter className="h-4 w-4 text-slate-400" /></div>
                  <input type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} placeholder="https://twitter.com/username" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personal Portfolio / Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Globe className="h-4 w-4 text-slate-400" /></div>
                  <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://mywebsite.com" className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Section: Achievements */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b pb-2 dark:border-slate-800">Achievements</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Awards, Honors, & Certifications (Comma separated)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none"><Trophy className="h-4 w-4 text-slate-400" /></div>
                <textarea name="achievements" value={formData.achievements} onChange={handleChange} rows="3" placeholder="Hackathon Winner 2023, AWS Cloud Practitioner..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cmr-blue outline-none transition-all"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cmr-blue hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Saving...' : 'Save Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
