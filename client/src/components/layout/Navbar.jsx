import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, ArrowRight, UserCheck, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'About Us', href: '/#about' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left section: 1. Extreme upper-left hamburger menu (☰) + 2. Immediately followed by Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (☰) */}
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            >
              {menuOpen ? <X size={22} className="stroke-[2.2]" /> : <Menu size={22} className="stroke-[2.2]" />}
            </button>

            {/* Skill Bridge AI EdTech Logo (Clicking toggles Dark/Light theme without navigating away) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Click Logo)`}
              className="flex items-center space-x-2.5 group text-left cursor-pointer focus:outline-hidden rounded-xl p-1 -m-1 transition-transform active:scale-95"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                <Compass size={22} className="stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[9px] shadow-xs">
                  {isDark ? <Sun size={9} className="text-amber-500" /> : <Moon size={9} />}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent leading-none">
                  Skill Bridge
                </span>
                <span className="inline-block sm:ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 mt-0.5 sm:mt-0 w-fit">
                  AI EdTech
                </span>
              </div>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm shadow-blue-500/20"
              >
                <UserCheck size={16} />
                <span className="hidden sm:inline">Go to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Log In
                </Link>
                {/* Changed "Get Started" to "Register" while preserving existing position, styling, and navigation */}
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span>Register</span>
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hamburger Vertical Navigation Menu Dropdown */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-16 left-4 sm:left-6 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Navigation Menu
          </div>

          <nav className="flex flex-col space-y-1 py-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-slate-300 dark:text-slate-600 text-xs">→</span>
              </a>
            ))}
          </nav>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 px-3 py-1 flex items-center justify-between">
            <span>Theme:</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
