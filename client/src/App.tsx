import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { WorkerLayout } from './components/layout/WorkerLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ServicesPage } from './pages/ServicesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { EnquiryPage } from './pages/EnquiryPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminQuotations } from './pages/admin/AdminQuotations';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminWorkers } from './pages/admin/AdminWorkers';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { WorkerTasks } from './pages/worker/WorkerTasks';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerEnquiries } from './pages/customer/CustomerEnquiries';
import { CustomerQuotations } from './pages/customer/CustomerQuotations';
import { CustomerTimeline } from './pages/customer/CustomerTimeline';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/enquiry" element={<EnquiryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Workspace */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Worker Workspace */}
      <Route path="/worker" element={<WorkerLayout />}>
        <Route index element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="tasks" element={<WorkerTasks />} />
      </Route>

      {/* Customer Workspace */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="enquiries" element={<CustomerEnquiries />} />
        <Route path="quotations" element={<CustomerQuotations />} />
        <Route path="timeline" element={<CustomerTimeline />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
