import React, { useEffect, useState } from 'react';
import {
  Hammer,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Users,
  Plus,
  ArrowRight,
  ShieldAlert,
  Send,
  Truck,
  CheckSquare,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job, JobTask, User as UserModel, WorkshopStage } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { TimelineView, STAGES_CONFIG } from '../../components/TimelineView';
import { useToast } from '../../context/ToastContext';

export const AdminJobs: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('ALL');

  // Selected job for deep timeline inspection
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Update Stage Modal
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [newStage, setNewStage] = useState<WorkshopStage>('BODY_BUILDING_REPAIR');
  const [stageNotes, setStageNotes] = useState('');
  const [isSkipped, setIsSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);

  // Assign Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDept, setTaskDept] = useState('Body Work');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [workers, setWorkers] = useState<UserModel[]>([]);
  const [assigningTask, setAssigningTask] = useState(false);

  // Deliver Vehicle Modal
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliverNotes, setDeliverNotes] = useState('Vehicle final check completed. Handed over to customer.');
  const [delivering, setDelivering] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.list({ stage: stageFilter !== 'ALL' ? stageFilter : undefined });
      setJobs(res.jobs);

      // If a job was already selected, refresh it
      if (selectedJob) {
        const refreshed = await api.jobs.get(selectedJob.id);
        setSelectedJob(refreshed.job);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Fetch workers for assignment
    async function loadWorkers() {
      try {
        const res = await api.workers.list();
        setWorkers(res.workers);
        if (res.workers.length > 0) {
          setAssignedWorkerId(res.workers[0].id);
        }
      } catch (err) {
        console.error('Failed to load workers:', err);
      }
    }
    loadWorkers();
  }, [stageFilter]);

  const handleOpenJobDetails = async (job: Job) => {
    try {
      const res = await api.jobs.get(job.id);
      setSelectedJob(res.job);
    } catch (err: any) {
      showToast(err.message || 'Failed to load job details.', 'error');
    }
  };

  // Submit stage update
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (isSkipped && !skipReason.trim()) {
      showToast('A reason must be recorded when skipping a timeline stage.', 'error');
      return;
    }

    setUpdatingStage(true);
    try {
      await api.jobs.updateStage(selectedJob.id, {
        newStage,
        notes: stageNotes.trim() || undefined,
        isSkipped,
        skipReason: isSkipped ? skipReason.trim() : undefined,
      });

      showToast(`Timeline stage updated to ${newStage.replace(/_/g, ' ')}.`, 'success');
      setIsStageModalOpen(false);
      setStageNotes('');
      setIsSkipped(false);
      setSkipReason('');
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stage.', 'error');
    } finally {
      setUpdatingStage(false);
    }
  };

  // Submit assign task
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !taskTitle.trim()) {
      showToast('Task title is required.', 'error');
      return;
    }

    setAssigningTask(true);
    try {
      await api.jobs.assignTask(selectedJob.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        department: taskDept,
        assignedWorkerId: assignedWorkerId || undefined,
      });

      showToast('Task successfully assigned to worker.', 'success');
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task.', 'error');
    } finally {
      setAssigningTask(false);
    }
  };

  // Deliver Vehicle
  const handleDeliverVehicle = async () => {
    if (!selectedJob) return;
    setDelivering(true);
    try {
      await api.jobs.deliver(selectedJob.id, deliverNotes.trim());
      showToast('Vehicle marked as Delivered successfully!', 'success');
      setIsDeliverModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to deliver vehicle.', 'error');
    } finally {
      setDelivering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Module 08 &amp; 09
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Work Progress &amp; Timeline Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time 6-stage lifecycle tracking, worker trade assignments, and delivery signoffs.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh Jobs
        </button>
      </div>

      {/* Stage filter buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter Stage:</span>
        <button
          onClick={() => setStageFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            stageFilter === 'ALL'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ALL
        </button>
        {STAGES_CONFIG.map((st) => (
          <button
            key={st.stage}
            onClick={() => setStageFilter(st.stage)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              stageFilter === st.stage
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st.title}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">Loading active jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">
            No workshop jobs match the current filter.
          </div>
        ) : (
          jobs.map((job) => {
            const isCompleted = job.status === 'DELIVERED';
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-orange-600 text-sm">
                      {job.jobNumber}
                    </span>
                    <StatusBadge status={job.currentStage} />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {job.vehicleDetails}
                  </h3>

                  <div className="text-xs text-slate-500 mt-2 space-y-1">
                    <div>
                      Customer: <strong className="text-slate-800">{job.customer?.name}</strong>
                    </div>
                    {job.expectedDeliveryDate && (
                      <div className="flex items-center gap-1.5 text-orange-950 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        <span>Due: {new Date(job.expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Task progress summary */}
                  {job.tasks && job.tasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>Assigned Tasks</span>
                        <span>
                          {job.tasks.filter((t) => t.status === 'COMPLETED').length} / {job.tasks.length} Done
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all"
                          style={{
                            width: `${(job.tasks.filter((t) => t.status === 'COMPLETED').length / job.tasks.length) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Quote: {job.quotation?.quoteNumber}
                  </span>
                  <button
                    onClick={() => handleOpenJobDetails(job)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <span>Manage Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deep Inspection Modal (Selected Job) */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Workshop Job ${selectedJob?.jobNumber || ''}`}
        subtitle={`${selectedJob?.vehicleDetails || ''} • Customer: ${selectedJob?.customer?.name || ''}`}
        maxWidth="max-w-5xl"
      >
        {selectedJob && (
          <div className="space-y-8">
            {/* Action Bar for Admin */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900 text-white rounded-2xl gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Current Stage:</span>
                <StatusBadge status={selectedJob.currentStage} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setNewStage(selectedJob.currentStage);
                    setIsStageModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Clock className="w-4 h-4" />
                  <span>Update Stage / Skip</span>
                </button>

                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>Assign Worker Task</span>
                </button>

                {selectedJob.status !== 'DELIVERED' && (
                  <button
                    onClick={() => setIsDeliverModalOpen(true)}
                    className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Deliver Vehicle</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline View Component */}
            <TimelineView
              currentStage={selectedJob.currentStage}
              stageHistory={selectedJob.stageHistory}
              expectedDeliveryDate={selectedJob.expectedDeliveryDate}
              actualDeliveryDate={selectedJob.actualDeliveryDate}
              isDelivered={selectedJob.status === 'DELIVERED'}
            />

            {/* Tasks & Workforce Assignment Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                    Worker Task Assignments ({selectedJob.tasks?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Task</span>
                </button>
              </div>

              {selectedJob.tasks && selectedJob.tasks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedJob.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-orange-600">
                            Dept: {task.department}
                          </span>
                          <StatusBadge status={task.status} />
                        </div>
                        <h4 className="font-bold text-slate-900 mt-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-slate-500 text-[11px] mt-0.5">{task.description}</p>
                        )}
                        {task.notes && (
                          <div className="mt-1 p-1.5 bg-white rounded border border-slate-100 text-[10px] text-slate-600 italic">
                            Worker Note: "{task.notes}"
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {task.assignedWorker?.name || 'Unassigned'}
                        </span>
                        {task.completedAt && (
                          <span className="text-green-600 font-medium">
                            Done on {new Date(task.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No worker tasks assigned yet. Click "Assign Worker Task" to allocate duties to workshop staff.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Update Stage Modal */}
      <Modal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        title="Update Job Timeline Stage"
        subtitle={`Advance or skip stages for ${selectedJob?.jobNumber}`}
      >
        <form onSubmit={handleUpdateStage} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Target Stage *
            </label>
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as WorkshopStage)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              {STAGES_CONFIG.map((s) => (
                <option key={s.stage} value={s.stage}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stage Notes &amp; Observations
            </label>
            <textarea
              rows={2}
              value={stageNotes}
              onChange={(e) => setStageNotes(e.target.value)}
              placeholder="e.g. Zinc chromate primer completed, ready for topcoat."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          {/* Skip stage support */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
              <input
                type="checkbox"
                checked={isSkipped}
                onChange={(e) => setIsSkipped(e.target.checked)}
                className="rounded text-amber-600 w-4 h-4"
              />
              <span>Mark this stage as SKIPPED</span>
            </label>

            {isSkipped && (
              <div>
                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                  Recorded Reason for Skipping Stage *
                </label>
                <input
                  type="text"
                  required={isSkipped}
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="e.g. Vehicle already painted by dealer before arrival."
                  className="w-full p-2 rounded-lg border border-amber-300 text-xs bg-white"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsStageModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStage}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {updatingStage ? 'Saving Stage...' : 'Save Stage Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Assign Workshop Task"
        subtitle={`Allocate work for ${selectedJob?.jobNumber}`}
      >
        <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Weld chassis subframe cross members"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                value={taskDept}
                onChange={(e) => setTaskDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                {[
                  'Body Work',
                  'Painting',
                  'Artist',
                  'Electrical',
                  'Lining',
                  'Mechanic',
                  'Glass Fixing',
                  'Sticker Fixing',
                  'Maintenance and Purchasing',
                  'Security / Watchman',
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign Worker
              </label>
              <select
                value={assignedWorkerId}
                onChange={(e) => setAssignedWorkerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="">-- Unassigned --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.workerProfile?.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Instructions
            </label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="e.g. Use ISMC 125 channel; maintain 10mm root gap on joints."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigningTask}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {assigningTask ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deliver Vehicle Modal */}
      <Modal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        title="Deliver Vehicle to Customer"
        subtitle={`Final handover signoff for ${selectedJob?.jobNumber}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Official Vehicle Handover:</span> Marking as Delivered logs the actual delivery timestamp, closes active progress, and issues the gate clearance record.
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Handover Remarks
            </label>
            <input
              type="text"
              value={deliverNotes}
              onChange={(e) => setDeliverNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeliverModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={delivering}
              onClick={handleDeliverVehicle}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {delivering ? 'Processing Handover...' : 'Confirm Vehicle Delivered'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
