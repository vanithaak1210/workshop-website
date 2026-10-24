import React, { useEffect, useState } from 'react';
import { Users, Plus, Phone, Mail, Wrench, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { User, WorkerProfile } from '../../types';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminWorkers: React.FC = () => {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Add Worker Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Worker@12345');
  const [department, setDepartment] = useState('Body Work');
  const [skills, setSkills] = useState('');
  const [addingWorker, setAddingWorker] = useState(false);

  // Edit Worker Modal
  const [editingWorker, setEditingWorker] = useState<User | null>(null);
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editSkills, setEditSkills] = useState('');
  const [editDept, setEditDept] = useState('');
  const [updatingWorker, setUpdatingWorker] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.workers.list({
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      });
      setWorkers(res.workers);
      setDepartments(res.departments);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch workers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [departmentFilter]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }

    setAddingWorker(true);
    try {
      await api.workers.add({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        department,
        skills: skills.trim(),
      });

      showToast(`Worker ${name} added successfully!`, 'success');
      setIsAddOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setSkills('');
      fetchWorkers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add worker.', 'error');
    } finally {
      setAddingWorker(false);
    }
  };

  const openEdit = (w: User) => {
    setEditingWorker(w);
    setEditStatus(w.workerProfile?.status || 'ACTIVE');
    setEditSkills(w.workerProfile?.skills || '');
    setEditDept(w.workerProfile?.department || 'Body Work');
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    setUpdatingWorker(true);
    try {
      await api.workers.update(editingWorker.id, {
        department: editDept,
        skills: editSkills,
        status: editStatus,
      });

      showToast('Worker details updated.', 'success');
      setEditingWorker(null);
      fetchWorkers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update worker.', 'error');
    } finally {
      setUpdatingWorker(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Module 09
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Workforce &amp; Trade Departments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage craftsmen across 10 specialized workshop divisions.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workshop Craftsman</span>
        </button>
      </div>

      {/* Filter by Department */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Department:</span>
        <button
          onClick={() => setDepartmentFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            departmentFilter === 'ALL'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ALL
        </button>
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDepartmentFilter(d)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              departmentFilter === d
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">Loading worker directory...</div>
        ) : workers.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">
            No workers found in this department.
          </div>
        ) : (
          workers.map((w) => {
            const profile = w.workerProfile;
            return (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-orange-50 text-orange-900 border border-orange-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      {profile?.department || 'Technician'}
                    </span>
                    <StatusBadge status={profile?.status || 'ACTIVE'} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{w.name}</h3>

                  <div className="space-y-1 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{w.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{w.email}</span>
                    </div>
                  </div>

                  {profile?.skills && (
                    <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Trade Skills:</span>
                      <p className="mt-0.5 italic">{profile.skills}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Vasthanagar Yard
                  </span>
                  <button
                    onClick={() => openEdit(w)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Worker Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Workshop Worker"
        subtitle="Create an internal technician account for workshop assignments."
      >
        <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Worker Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94430 XXXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@rjbodybuilding.local"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Temporary Password *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Workshop Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
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
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Skills &amp; Specialization Details
            </label>
            <textarea
              rows={2}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Chassis hydraulic welding, PU multi-coat spraying..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingWorker}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {addingWorker ? 'Registering...' : 'Add Worker'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal
        isOpen={!!editingWorker}
        onClose={() => setEditingWorker(null)}
        title={`Edit Profile: ${editingWorker?.name || ''}`}
        subtitle="Update department, skills, or status."
      >
        <form onSubmit={handleUpdateWorker} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Department
            </label>
            <select
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Active Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Skills
            </label>
            <textarea
              rows={2}
              value={editSkills}
              onChange={(e) => setEditSkills(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingWorker(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingWorker}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {updatingWorker ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
