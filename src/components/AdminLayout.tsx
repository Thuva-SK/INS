import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/students')) return 'Student Management';
    if (path.includes('/instructors')) return 'Instructor Management';
    if (path.includes('/courses')) return 'Course Management';
    if (path.includes('/classes')) return 'Class Management';
    if (path.includes('/gallery')) return 'Gallery Management';
    if (path.includes('/announcements')) return 'Announcements';
    if (path.includes('/settings')) return 'Settings';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-background w-full flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <AdminTopbar 
          setSidebarOpen={setSidebarOpen} 
          pageTitle={getPageTitle()} 
        />
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;