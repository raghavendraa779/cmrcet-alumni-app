import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { 
  LogOut, LayoutDashboard, Briefcase, Calendar, Users, 
  ChevronLeft, Menu, Newspaper, ChevronUp, UserCircle, 
  Moon, Sun, Mail, Settings, Bell, Search, X, Heart
} from 'lucide-react';
import logo from '../assets/logo.jpg';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const onToggleTheme = () => {
    dispatch(toggleTheme());
    setShowUserMenu(false);
  };

  if (!user || !user.isVerified) return null;

  const navItems = [
    { name: 'Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={20} /> },
    { name: 'Directory', path: '/directory', icon: <Users size={20} /> },
    { name: 'Messages', path: '/messages', icon: <Mail size={20} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Events', path: '/events', icon: <Calendar size={20} /> },
    { name: 'Donations', path: '/donations', icon: <Heart size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
  ];

  const sidebarClasses = `
    flex flex-col bg-white dark:bg-[#0B1121] border-r border-slate-200 dark:border-slate-800/80 
    h-screen fixed md:sticky top-0 transition-all duration-300 z-50
    ${isCollapsed ? 'md:w-20' : 'md:w-72'}
    ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md text-slate-600 dark:text-slate-300"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
          <Link to="/" className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center w-full' : ''}`}>
            <div className="bg-white rounded-lg p-0.5">
              <img src={logo} alt="CMR Logo" className="h-10 w-auto object-contain flex-shrink-0" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-bold text-xl tracking-wide text-cmr-blue dark:text-slate-100">AlumniHub</span>
            )}
          </Link>
          
          {/* Toggle Button for Desktop */}
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-cmr-blue dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg hidden md:block transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Close Button for Mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 dark:text-slate-500 hover:text-cmr-blue dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* When Collapsed, show hamburger to expand (Desktop) */}
        {isCollapsed && (
          <div className="justify-center mt-6 hidden md:flex">
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-cmr-blue dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className={`flex-1 overflow-y-auto py-8 space-y-1.5 ${(isCollapsed && !isMobileOpen) ? 'px-3' : 'px-4'}`}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={(isCollapsed && !isMobileOpen) ? item.name : ''}
                className={`group flex items-center gap-3 py-3 rounded-xl transition-all duration-200 ${
                  (isCollapsed && !isMobileOpen) ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-slate-50 dark:bg-blue-500/10 text-cmr-blue dark:text-blue-400 font-semibold shadow-sm ring-1 ring-slate-200 dark:ring-blue-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-cmr-blue dark:hover:text-slate-200'
                }`}
              >
                <div className={`${isActive ? 'text-cmr-orange dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-cmr-orange dark:group-hover:text-slate-300'} transition-colors`}>
                  {item.icon}
                </div>
                {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Area & Popup Menu */}
        <div className="relative p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20" ref={menuRef}>
          
          {/* User Options Dropdown */}
          {showUserMenu && (
            <div className={`absolute bottom-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl dark:shadow-black/50 rounded-xl overflow-hidden py-1 z-50 ${(isCollapsed && !isMobileOpen) ? 'left-4 w-56' : 'left-4 right-4'}`}>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              
              <button 
                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-cmr-blue dark:hover:text-white transition-colors text-left"
              >
                <UserCircle size={16} /> My Profile
              </button>
              <button 
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-cmr-blue dark:hover:text-white transition-colors text-left"
              >
                {mode === 'dark' ? <><Sun size={16} /> Theme: Light</> : <><Moon size={16} /> Theme: Dark</>}
              </button>
              
              <div className="border-t border-slate-100 dark:border-slate-700/50 my-1"></div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}

          {/* Trigger Button */}
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left focus:outline-none ${(isCollapsed && !isMobileOpen) ? 'justify-center' : 'justify-between'}`}
            title={(isCollapsed && !isMobileOpen) ? "User Options" : ""}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-cmr-blue dark:bg-slate-700/80 text-white dark:text-blue-200 flex items-center justify-center font-bold flex-shrink-0 border border-transparent dark:border-slate-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{user.role}</p>
                </div>
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <ChevronUp 
                size={18} 
                className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
              />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
