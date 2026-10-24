import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Wrench, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WorkerSidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { name: 'Worker Overview', path: '/worker/dashboard', icon: LayoutDashboard },
    { name: 'My Assigned Tasks', path: '/worker/tasks', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-5rem)]">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              RJ BODY BUILDING
            </div>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Wrench className="w-3 h-3 inline" /> Worker Portal
            </div>
          </div>
        </div>
        <div className="mt-3 px-2 py-1.5 rounded bg-slate-800/80 text-[11px] text-slate-300">
          <div className="font-semibold text-slate-100">{user?.name}</div>
          <div className="text-amber-400 text-[10px] mt-0.5">
            Dept: {user?.workerProfile?.department || 'Technician'}
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
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

      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400">
        Workshop floor access only. Financial and customer data restricted.
      </div>
    </aside>
  );
};
