import React from 'react';
import { Menu, Bell, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header({ onMenuClick, title }) {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 truncate">
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Branch & Target Pills */}
        {profile?.branch && (
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              {profile.branch}
            </span>
            {profile.current_academic_year && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                {profile.current_academic_year}
              </span>
            )}
          </div>
        )}

        {/* Public Homepage Link */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors px-2 py-1"
        >
          <span>Landing Page</span>
          <ExternalLink size={12} />
        </Link>

        {/* User Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.full_name || 'User'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              {user?.role || 'student'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
