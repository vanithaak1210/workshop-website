import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  Hammer,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Shield,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Service Bookings', path: '/admin/enquiries', icon: Inbox },
    { name: 'Customer Accounts', path: '/admin/customers', icon: UserCheck },
    { name: 'Workshop Jobs & Timeline', path: '/admin/jobs', icon: Hammer },
    { name: 'Workers & Specializations', path: '/admin/workers', icon: Users },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Workshop Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-5rem)]">
      {/* Workshop Admin Badge */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              RJ BODY BUILDING
            </div>
            <div className="text-[11px] text-orange-400 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 inline" /> Admin Control
            </div>
          </div>
        </div>
        <div className="mt-3 px-2 py-1.5 rounded bg-slate-800/80 text-[11px] text-slate-300">
          <span className="text-slate-400">Logged in: </span>
          <span className="font-semibold text-slate-100">{user?.name}</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Workshop Location Footer */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
        <div>Vasthanagar, Madurai</div>
        <div className="text-slate-400">35 Years (1991–2026)</div>
      </div>
    </aside>
  );
};
