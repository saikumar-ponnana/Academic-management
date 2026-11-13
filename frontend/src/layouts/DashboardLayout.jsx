import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderBanner from '../components/common/HeaderBanner';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Official Gayatri Vidya Parishad Static Photo Header (Required for all pages) */}
      <HeaderBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar />

      {/* 3. Main Workspace Area: Sidebar + Page Content */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

