import React, { useEffect, useState } from 'react';
import { CheckSquare, Wrench, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { JobTask } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const WorkerTasks: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<JobTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Task Modal
  const [selectedTask, setSelectedTask] = useState<JobTask | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [notes, setNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.workers.getMyTasks();
      setTasks(res.tasks);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openUpdate = (task: JobTask) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNotes(task.notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setUpdating(true);
    try {
      await api.jobs.updateTask(selectedTask.id, {
        status: newStatus,
        notes: notes.trim() || undefined,
      });

      showToast('Task progress updated successfully.', 'success');
      setSelectedTask(null);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
          Work Execution Checklist
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Assigned Workshop Tasks
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mark tasks as in progress or completed and log craftsmanship notes.
        </p>
      </div>

      {/* Task Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading checklist...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            You currently have no tasks assigned to your queue.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-600 text-xs">{task.job?.jobNumber}</span>
                  <StatusBadge status={task.status} />
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                    {task.department}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{task.title}</h3>

                <p className="text-xs text-slate-500">
                  Vehicle: <strong className="text-slate-800">{task.job?.vehicleDetails}</strong> • Timeline Stage:{' '}
                  <span className="text-amber-800 font-semibold">{task.job?.currentStage.replace(/_/g, ' ')}</span>
                </p>

                {task.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                    {task.description}
                  </p>
                )}

                {task.notes && (
                  <div className="text-[11px] text-slate-600 italic mt-1">
                    Your remarks: "{task.notes}"
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => openUpdate(task)}
                  className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Update Progress
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Update Task Progress"
        subtitle={selectedTask?.title || ''}
      >
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Task Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="PENDING">PENDING (Not Started)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Currently Working)</option>
              <option value="COMPLETED">COMPLETED (Finished &amp; Checked)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Craftsman Remarks / Measurements
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Subframe welding finished with 125mm channels. Tested alignment with spirit level."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {updating ? 'Saving...' : 'Save Task Progress'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
