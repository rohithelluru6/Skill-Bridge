import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ExternalLink,
  User,
  LogOut,
  School,
  GraduationCap,
  Calendar,
  Briefcase,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick, title }) {
  const { user, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Branch & Target Pills */}
        {profile?.branch && (
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 font-medium border border-slate-200 dark:border-neutral-800">
              {profile.branch}
            </span>
            {profile.current_academic_year && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-neutral-300 font-medium border border-blue-200 dark:border-neutral-800">
                {profile.current_academic_year}
              </span>
            )}
          </div>
        )}

        {/* Theme Switcher in Dashboard Header */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Original Light' : 'Black & White'} mode`}
          className="p-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Public Homepage Link */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-white transition-colors px-2 py-1"
        >
          <span>Landing Page</span>
          <ExternalLink size={12} />
        </Link>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setProfileDropdownOpen(prev => !prev)}
            className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-neutral-800 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-900 cursor-pointer focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 text-white dark:text-black font-semibold text-xs flex items-center justify-center shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">
                {user?.full_name || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-neutral-400 capitalize">
                {user?.role || 'student'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* User Header */}
              <div className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 text-white dark:text-black font-bold text-base flex items-center justify-center shrink-0">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {user?.full_name || 'Student'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {user?.email || 'email@college.edu'}
                  </p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-neutral-300 border border-blue-200 dark:border-neutral-700">
                    Role: {user?.role || 'student'}
                  </span>
                </div>
              </div>

              {/* Academic Info */}
              <div className="py-2 space-y-1.5 text-[11px] border-b border-slate-100 dark:border-neutral-800">
                {profile?.college_name && (
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                    <School size={13} className="shrink-0 text-blue-600 dark:text-neutral-400" />
                    <span className="truncate">{profile.college_name}</span>
                  </div>
                )}
                {profile?.branch && (
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                    <GraduationCap size={13} className="shrink-0 text-indigo-600 dark:text-neutral-400" />
                    <span className="truncate">{profile.branch}</span>
                  </div>
                )}
                {profile?.current_academic_year && (
                  <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                    <Calendar size={13} className="shrink-0 text-purple-600 dark:text-neutral-400" />
                    <span>{profile.current_academic_year} • Grad {profile.graduation_year || 2026}</span>
                  </div>
                )}
              </div>

              {/* Shortcuts */}
              <div className="py-2 space-y-1">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User size={14} />
                    <span>Edit Profile Settings</span>
                  </div>
                  <ChevronRight size={13} className="text-slate-400" />
                </Link>
              </div>

              {/* Logout */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
