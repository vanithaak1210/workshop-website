import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CustomerSidebar } from './CustomerSidebar';
import { useAuth } from '../../context/AuthContext';

export const CustomerLayout: React.FC = () => {
  const { user, loading, isCustomer, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Loading customer workspace...
      </div>
    );
  }

  if (!user || (!isCustomer && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <CustomerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
