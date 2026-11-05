import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  School,
  Calendar,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Home,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, profile, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const profileButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerButtonRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        hamburgerButtonRef.current &&
        !hamburgerButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (href) => {
    setSidebarOpen(false);
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (window.location.pathname === '/') {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      navigate(href);
    } else {
      navigate(href);
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  const publicNavLinks = [
    { label: 'Home', href: '/#home', icon: Home },
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'How It Works', href: '/#how-it-works', icon: CheckCircle2 },
    { label: 'Resources', href: '/resources', icon: BookOpen },
    { label: 'About Skill Bridge', href: '/#about', icon: Compass },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* =========================================================================
                LEFT SIDE (Top Left Corner):
                1. Three-line hamburger menu [☰]
                2. Skill Bridge logo and name (clicking toggles Black & White / Original theme)
               ========================================================================= */}
            <div className="flex items-center space-x-3">
              {/* 1. Three-Line Hamburger Menu Icon [☰] */}
              <button
                ref={hamburgerButtonRef}
                type="button"
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Toggle navigation sidebar"
                aria-expanded={sidebarOpen}
                title="Open Navigation Sidebar"
                className="p-2 rounded-xl text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              >
                {sidebarOpen ? (
                  <X size={22} className="stroke-[2.2]" />
                ) : (
                  <Menu size={22} className="stroke-[2.2]" />
                )}
              </button>

              {/* 2. Skill Bridge Logo & Name (Theme toggle - strictly no redirect to homepage) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Theme: Click to switch to ${isDark ? 'Original' : 'Black & White'} mode`}
                aria-label="Toggle black and white theme"
                className="flex items-center space-x-2.5 group text-left cursor-pointer focus:outline-hidden rounded-xl p-1 -m-1 transition-transform active:scale-95"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-neutral-100 dark:to-neutral-300 flex items-center justify-center text-white dark:text-black shadow-md shadow-blue-500/20 dark:shadow-none transition-all">
                  <Compass size={20} className="stroke-[2.2]" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-black text-white dark:text-neutral-200 flex items-center justify-center text-[9px] shadow-xs border border-white/20 dark:border-neutral-700">
                    {isDark ? <Sun size={9} className="text-amber-400" /> : <Moon size={9} />}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent leading-none">
                    Skill Bridge
                  </span>
                  <span className="inline-block sm:ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-neutral-300 rounded-md border border-blue-200 dark:border-neutral-700 mt-0.5 sm:mt-0 w-fit">
                    AI EdTech
                  </span>
                </div>
              </button>
            </div>

            {/* =========================================================================
                RIGHT SIDE (Top Right Corner):
                Before login: [Register] [Login]
                After login: [Profile Icon] with actual registered user information
               ========================================================================= */}
            <div className="flex items-center">
              {!isAuthenticated ? (
                /* Unauthenticated View: [Register] [Login] in exact required order */
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* 1. Register Button (First) */}
                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-1 px-3.5 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-white dark:to-neutral-200 dark:text-black dark:hover:bg-neutral-300 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 dark:shadow-none transition-all hover:shadow-lg"
                  >
                    <span>Register</span>
                    <ArrowRight size={14} />
                  </Link>

                  {/* 2. Login Button (Immediately beside Register) */}
                  <Link
                    to="/login"
                    className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-white border border-slate-300 dark:border-neutral-700 rounded-lg hover:border-blue-400 dark:hover:border-neutral-500 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                /* Authenticated View: Single Profile Icon with Dropdown */
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    type="button"
                    onClick={() => setProfileDropdownOpen(prev => !prev)}
                    aria-label="User Profile Menu"
                    aria-expanded={profileDropdownOpen}
                    title={user?.full_name || 'My Profile'}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 border border-transparent hover:border-slate-200 dark:hover:border-neutral-800 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 text-white dark:text-black font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20 dark:shadow-none">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden md:block text-left pr-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                        {user?.full_name || 'Student'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400 capitalize">
                        {user?.role || 'student'}
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown displaying actual registered user details */}
                  {profileDropdownOpen && (
                    <div
                      ref={profileRef}
                      className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* User Header */}
                      <div className="flex items-start space-x-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 text-white dark:text-black font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {user?.full_name || 'Registered Student'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                            {user?.email || 'student@skillbridge.edu'}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-neutral-200 border border-blue-200 dark:border-neutral-700">
                            Role: {user?.role || 'student'}
                          </span>
                        </div>
                      </div>

                      {/* Actual User Registration & Academic Details */}
                      <div className="py-3 space-y-2 text-xs border-b border-slate-100 dark:border-neutral-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                          Academic Information
                        </div>

                        {profile?.college_name && (
                          <div className="flex items-start space-x-2 text-slate-700 dark:text-neutral-300">
                            <School size={14} className="shrink-0 mt-0.5 text-blue-600 dark:text-neutral-400" />
                            <span className="truncate">{profile.college_name}</span>
                          </div>
                        )}

                        {profile?.branch && (
                          <div className="flex items-start space-x-2 text-slate-700 dark:text-neutral-300">
                            <GraduationCap size={14} className="shrink-0 mt-0.5 text-indigo-600 dark:text-neutral-400" />
                            <span className="truncate">
                              {profile.degree ? `${profile.degree} • ` : ''}{profile.branch}
                            </span>
                          </div>
                        )}

                        {profile?.current_academic_year && (
                          <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                            <Calendar size={14} className="shrink-0 text-purple-600 dark:text-neutral-400" />
                            <span>
                              {profile.current_academic_year} (Graduation: {profile.graduation_year || 2026})
                            </span>
                          </div>
                        )}

                        {profile?.target_career_title && (
                          <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                            <Briefcase size={14} className="shrink-0 text-emerald-600 dark:text-neutral-400" />
                            <span>Target: <strong className="font-semibold text-slate-900 dark:text-white">{profile.target_career_title}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Navigation Shortcuts */}
                      <div className="py-2 space-y-1">
                        <Link
                          to={isAdmin ? '/admin' : '/dashboard'}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 hover:text-blue-600 dark:hover:text-white transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <LayoutDashboard size={15} />
                            <span>Go to Dashboard</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-400" />
                        </Link>

                        <Link
                          to="/dashboard/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 hover:text-blue-600 dark:hover:text-white transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <User size={15} />
                            <span>Edit Academic Profile</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-400" />
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Log Out of Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          LEFT NAVIGATION SIDEBAR (Expands when clicking ☰ Hamburger Icon)
          Hamburger icon remains visible in its top-left position.
          Smooth sliding animation from left, responsive on mobile & desktop.
         ========================================================================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-black/80 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        aria-label="Navigation Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with branding and close toggle */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 flex items-center justify-center text-white dark:text-black font-bold shadow-xs">
              <Compass size={18} />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Skill Bridge
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">
                Navigation Sidebar
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation Links Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Website Sections */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              Explore Platform
            </div>
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-neutral-900 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={17} className="text-slate-400 dark:text-neutral-500" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 dark:text-neutral-600" />
                </a>
              );
            })}
          </div>

          {/* Authenticated Dashboard Links if User is Logged In */}
          {isAuthenticated && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-neutral-800">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Student Portal
              </div>
              <Link
                to="/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <LayoutDashboard size={17} className="text-blue-600 dark:text-blue-400" />
                <span>Dashboard Overview</span>
              </Link>
              <Link
                to="/dashboard/assessment"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <CheckCircle2 size={17} className="text-emerald-600 dark:text-emerald-400" />
                <span>Skill Assessment & Quizzes</span>
              </Link>
              <Link
                to="/dashboard/gap-analysis"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <Sparkles size={17} className="text-indigo-600 dark:text-indigo-400" />
                <span>AI Skill Gap Analysis</span>
              </Link>
              <Link
                to="/dashboard/roadmap"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
              >
                <Briefcase size={17} className="text-purple-600 dark:text-purple-400" />
                <span>Career Learning Roadmap</span>
              </Link>
            </div>
          )}

          {/* If Admin, Show Admin Link */}
          {isAuthenticated && isAdmin && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-neutral-800">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Administration
              </div>
              <Link
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <ShieldCheck size={17} />
                <span>Admin Management Console</span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Theme Toggle & Session */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-800 space-y-3 bg-slate-50/50 dark:bg-neutral-950/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-neutral-400">Current Theme:</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-800 dark:text-white font-bold cursor-pointer"
            >
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span>{isDark ? 'Black & White' : 'Original Light'}</span>
            </button>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/register"
                onClick={() => setSidebarOpen(false)}
                className="text-center py-2 rounded-xl bg-blue-600 dark:bg-white text-white dark:text-black font-bold text-xs shadow-xs"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="text-center py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-neutral-900"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
