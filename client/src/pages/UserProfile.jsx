import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, GraduationCap, Link as LinkIcon, Building2, MapPin, Map, ArrowLeft, Mail, Globe, Trophy, Code, Heart, AlignLeft } from 'lucide-react';
import { FaGithub as Github, FaTwitter as Twitter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (error) {
        toast.error('Failed to load user profile');
        navigate('/directory');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
  if (!profile) return null;

  const isAlumni = profile.role === 'Alumni';
  const isStudent = profile.role === 'Student';
  const isFaculty = profile.role === 'Faculty';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cmr-blue dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Directory
      </button>

      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 p-6 md:p-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800/80 relative">
          <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold text-6xl flex-shrink-0 border-4 border-white dark:border-slate-900 shadow-xl">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">{profile.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-bold ring-1 ring-inset ${
                profile.role === 'Alumni' ? 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20' :
                profile.role === 'Student' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' :
                'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
              }`}>
                {profile.role}
              </span>
              
              <button 
                onClick={() => navigate('/messages', { state: { startChatWith: profile } })}
                className="bg-cmr-blue text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
              >
                Message
              </button>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-cmr-blue dark:hover:text-blue-400 transition-colors">
                  <Mail size={16} /> Email
                </a>
              )}
              {profile.linkedInUrl && (
                <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#0077b5] transition-colors">
                  <LinkIcon size={16} /> LinkedIn
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Github size={16} /> GitHub
                </a>
              )}
              {profile.twitterUrl && (
                <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Twitter size={16} /> Twitter
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                  <Globe size={16} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout for the rest */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Bio */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Bio Section */}
            {profile.bio && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                  <AlignLeft size={16} /> About
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Work & Education Details */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Briefcase size={16} /> Current Status
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 text-sm">
                
                {(isAlumni || isStudent) && profile.branch && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Branch</p>
                      <p className="text-slate-900 dark:text-slate-100">{profile.branch}</p>
                    </div>
                  </div>
                )}

                {profile.batchYear && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{isAlumni ? 'Graduated In' : 'Expected Graduation'}</p>
                      <p className="text-slate-900 dark:text-slate-100">{profile.batchYear}</p>
                    </div>
                  </div>
                )}

                {isStudent && profile.currentYear && (
                  <div className="flex items-start gap-3">
                    <Map className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Current Academic Year</p>
                      <p className="text-slate-900 dark:text-slate-100">{profile.currentYear}</p>
                    </div>
                  </div>
                )}

                {isAlumni && profile.company && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Organization</p>
                      <p className="text-slate-900 dark:text-slate-100">{profile.designation} at <span className="font-bold">{profile.company}</span></p>
                    </div>
                  </div>
                )}

                {isFaculty && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Faculty Position</p>
                      <p className="text-slate-900 dark:text-slate-100">{profile.designation} in {profile.department}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Teaching: {profile.subject}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Section */}
            {profile.achievements && profile.achievements.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                  <Trophy size={16} /> Awards & Achievements
                </h3>
                <ul className="space-y-2">
                  {profile.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-cmr-orange mt-2 flex-shrink-0"></div>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Skills & Interests */}
          <div className="space-y-8">
            
            {/* Tech Stack / Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                  <Code size={16} /> Tech Stack & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                  <Heart size={16} /> Interests & Hobbies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfile;
