import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderBanner from '../components/common/HeaderBanner';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile navigation drawer when user navigates
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Official Gayatri Vidya Parishad Static Photo Header */}
      <HeaderBanner />

      {/* 2. Top Navigation Bar with Mobile Hamburger Toggle */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 3. Main Workspace Area: Sidebar (Desktop + Mobile Drawer) + Page Content */}
      <div className="flex flex-1 relative">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
