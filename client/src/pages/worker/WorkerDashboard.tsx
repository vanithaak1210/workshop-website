import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Wrench, Clock, Calendar, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { JobTask } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const WorkerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<JobTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.workers.getMyTasks();
      setTasks(res.tasks);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch assigned tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Worker Operations Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Craftsman Workspace: {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department: <strong className="text-slate-800">{user?.workerProfile?.department || 'Technician'}</strong> • Vasthanagar Yard
          </p>
        </div>

        <Link
          to="/worker/tasks"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Update My Tasks</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Tasks
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Ready for work</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              In Progress
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{inProgressCount}</div>
            <div className="text-[11px] text-orange-600 font-semibold mt-1">Currently active</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Completed Tasks
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{completedCount}</div>
            <div className="text-[11px] text-green-600 font-semibold mt-1">Verified work</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Assigned Tasks Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs flex items-center justify-between">
          <span>Assigned Work Queue</span>
          <Link to="/worker/tasks" className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1">
            <span>View Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading assignments...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No tasks currently assigned to your profile.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600">{task.job?.jobNumber}</span>
                    <span className="text-slate-700 font-bold">{task.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Vehicle: {task.job?.vehicleDetails} • Stage: <strong className="text-slate-700">{task.job?.currentStage.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <Link
                    to="/worker/tasks"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]"
                  >
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
