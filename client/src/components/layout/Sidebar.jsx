import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Compass,
  GitCompare,
  Map,
  BookOpen,
  FolderGit2,
  TrendingUp,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, profile, logout, isAdmin } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Assessment', path: '/dashboard/assessment', icon: ClipboardCheck },
    { name: 'Career Goals', path: '/dashboard/careers', icon: Compass },
    { name: 'AI Gap Analysis', path: '/dashboard/gap-analysis', icon: GitCompare, badge: 'AI' },
    { name: 'Career Roadmap', path: '/dashboard/roadmap', icon: Map, badge: 'AI' },
    { name: 'Learning Resources', path: '/dashboard/resources', icon: BookOpen },
    { name: 'Project Blueprints', path: '/dashboard/projects', icon: FolderGit2 },
    { name: 'Progress Tracker', path: '/dashboard/progress', icon: TrendingUp },
    { name: 'Profile & Settings', path: '/dashboard/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={toggleTheme}
            title="Click logo to switch Dark/Light theme"
            className="flex items-center space-x-2.5 text-left cursor-pointer focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Compass size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Skill Bridge
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Student AI Platform
              </span>
            </div>
          </button>
        </div>

        {/* Current Student Profile Snapshot in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-800 truncate">{user?.full_name || 'Engineering Student'}</h4>
              <p className="text-xs text-slate-500 truncate">{profile?.branch || 'Engineering Branch'}</p>
            </div>
          </div>
          {profile?.target_career_title && (
            <div className="mt-2.5 pt-2 border-t border-blue-100/80 flex items-center justify-between text-xs text-blue-800">
              <span className="text-slate-500 font-medium">Target:</span>
              <span className="font-semibold truncate ml-1">{profile.target_career_title}</span>
            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Admin Navigation if admin role */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`
                }
              >
                <ShieldCheck size={18} />
                <span>Admin Console</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* AI Transparency Banner */}
        <div className="mx-3 my-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-800 mb-1">
            <Sparkles size={13} className="text-indigo-600" />
            <span>AI Model Status</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Personalized guidance generated via secure AI engine with branch-specific calibrations.
          </p>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut size={17} />
              <span>Sign Out</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
}
