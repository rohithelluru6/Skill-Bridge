import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title
  const getPageTitle = (pathname) => {
    if (pathname.includes('/assessment')) return 'Skill Assessment';
    if (pathname.includes('/careers')) return 'Career Exploration';
    if (pathname.includes('/gap-analysis')) return 'AI Skill Gap Analysis';
    if (pathname.includes('/roadmap')) return 'Career Roadmap';
    if (pathname.includes('/resources')) return 'Learning Resources';
    if (pathname.includes('/projects')) return 'Project Blueprints';
    if (pathname.includes('/progress')) return 'Progress Tracking';
    if (pathname.includes('/profile')) return 'Student Profile';
    if (pathname.includes('/admin')) return 'Admin Dashboard';
    return 'Student Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle(location.pathname)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
