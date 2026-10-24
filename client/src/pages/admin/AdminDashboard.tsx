import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Hammer,
  ArrowRight,
  Clock,
  Users,
  UserCheck,
  Wrench,
  CheckCircle,
  Calendar,
  Edit3,
  Phone,
  Truck,
  MapPin,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardMetrics, Enquiry, Service } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<Enquiry[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Booking Modal State
  const [editingBooking, setEditingBooking] = useState<Enquiry | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editService, setEditService] = useState('');
  const [editVehicleCategory, setEditVehicleCategory] = useState('Heavy Vehicles');
  const [editVehicleMakeModel, setEditVehicleMakeModel] = useState('');
  const [editPreferredDate, setEditPreferredDate] = useState('');
  const [editPreferredTime, setEditPreferredTime] = useState('');
  const [editServiceLocation, setEditServiceLocation] = useState('');
  const [editStatus, setEditStatus] = useState('PENDING');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, enquiriesRes, servicesRes] = await Promise.all([
        api.reports.getDashboardMetrics(),
        api.enquiries.list(),
        api.settings.getServices(),
      ]);
      setMetrics(metricsRes.metrics);
      setRecentActivity(metricsRes.recentActivity);
      setRecentBookings(enquiriesRes.enquiries);
      setServicesList(servicesRes.services);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      showToast(err.message || 'Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openEditModal = (booking: Enquiry) => {
    setEditingBooking(booking);
    setEditName(booking.customerName || '');
    setEditPhone(booking.customerPhone || '');
    setEditService(booking.selectedService || booking.enquiryType || '');
    setEditVehicleCategory(booking.vehicleCategory || 'Heavy Vehicles');
    setEditVehicleMakeModel(booking.vehicleMakeModel || '');
    setEditPreferredDate(
      booking.preferredDate ? new Date(booking.preferredDate).toISOString().split('T')[0] : ''
    );
    setEditPreferredTime(booking.preferredTime || 'Morning (08:30 AM - 01:00 PM)');
    setEditServiceLocation(booking.serviceLocation || 'Workshop: Vasthanagar, Madurai');
    setEditStatus(booking.status || 'PENDING');
    setEditNotes(booking.notes || '');
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingBooking(null);
    setEditError(null);
  };

  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    if (!editName.trim()) {
      setEditError('Customer name is required.');
      return;
    }
    const cleanPhone = editPhone.trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setEditError('Please enter a valid 10-digit customer phone number.');
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      await api.enquiries.update(editingBooking.id, {
        customerName: editName.trim(),
        customerPhone: cleanPhone,
        selectedService: editService.trim(),
        vehicleCategory: editVehicleCategory,
        vehicleMakeModel: editVehicleMakeModel.trim(),
        preferredDate: editPreferredDate || null,
        preferredTime: editPreferredTime || null,
        serviceLocation: editServiceLocation || null,
        status: editStatus,
        notes: editNotes.trim(),
      });

      showToast(`Service booking ${editingBooking.enquiryNumber} updated successfully.`, 'success');
      closeEditModal();
      await fetchDashboardData();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update booking. Please verify details and try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Workshop Operations...
          </p>
        </div>
      </div>
    );
  }

  const totalQuotationsCount =
    metrics?.totalQuotations ??
    ((metrics?.pendingQuotations || 0) + (metrics?.approvedQuotations || 0));

  return (
    <div className="space-y-8">
      {/* Page Title & Workshop Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Workshop Management Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            RJ BODY BUILDING Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vasthanagar, near Agrini / Ravithurayan Temple, Madurai • 35 Years (1991–2026)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/customers"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span>Clients ({metrics?.customerCount || 0})</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Inbox className="w-4 h-4 text-orange-400" />
            <span>Bookings ({metrics?.totalBookings || 0})</span>
          </Link>
          <Link
            to="/admin/jobs"
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Hammer className="w-4 h-4" />
            <span>Active Builds ({metrics?.ongoingJobs || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards: The 5 Official Booking Metrics (Requirement 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Actual Service Bookings */}
        <Link
          to="/admin/enquiries"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-orange-300 transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.totalBookings || 0}
            </div>
            <div className="text-[11px] text-orange-600 font-semibold mt-1 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </Link>

        {/* Metric 2: Pending Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {metrics?.pendingBookings || 0}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              Awaiting confirmation
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Confirmed Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Confirmed
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {metrics?.confirmedBookings || 0}
            </div>
            <div className="text-[11px] text-blue-700 font-medium mt-1">
              Scheduled / Quoted
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: In Progress Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              In Progress
            </span>
            <div className="text-2xl font-black text-indigo-600 mt-1">
              {metrics?.inProgressBookings || 0}
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1">
              Active yard fabrication
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Hammer className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 5: Completed Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {metrics?.completedBookings || 0}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              Finished &amp; Delivered
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Service Bookings Management Section (Requirements 2, 3, 4) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Service Bookings &amp; Enquiries
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and edit submitted commercial vehicle service bookings directly.
            </p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All ({recentBookings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No service bookings yet.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When customers book workshop services or submit enquiries on the website, they will appear here for review and management.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Reference No</th>
                  <th className="px-4 py-3">Customer Details</th>
                  <th className="px-4 py-3">Service &amp; Vehicle</th>
                  <th className="px-4 py-3">Preferred Date / Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-orange-600">
                        {b.enquiryNumber}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{b.customerName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{b.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {b.selectedService || b.enquiryType}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-orange-500" />
                        <span>{b.vehicleMakeModel || 'Commercial Vehicle'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {b.preferredDate ? (
                        <div className="text-slate-700">
                          <span className="font-semibold block">
                            {new Date(b.preferredDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {b.preferredTime || 'Morning'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Immediate / Flexible</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(b)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simplified Worker and Department Section (Requirement 4B) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900">Workshop Workers</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active workshop craftsmen and their specialized trades.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-xl shadow-2xs">
              Total Workers: {metrics?.totalWorkers || metrics?.workers?.length || 0}
            </span>
            <Link
              to="/admin/workers"
              className="text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <span>Manage Workers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {metrics?.workers && metrics.workers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Worker Name</th>
                  <th className="px-4 py-3">Work Type / Specialization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {worker.name.charAt(0)}
                      </div>
                      <span>{worker.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {worker.workType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No workers currently registered in database.
          </div>
        )}
      </div>

      {/* Quotation Management Section (Requirement 4C) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-sm text-slate-900">Quotation Management</h3>
          </div>
          <Link
            to="/admin/quotations"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Quotations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Total Quotations
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalQuotationsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Itemized estimates for commercial bodybuilding
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Customer Approval
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.pendingQuotations || 0}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              Drafts or awaiting client decision
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Approved Quotations
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {metrics?.approvedQuotations || 0}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              Ready for fabrication job initiation
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Operational Shortcuts */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-4">
          Workshop Operational Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/customers"
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-2 text-center"
          >
            <UserCheck className="w-5 h-5 text-orange-400" />
            <span>Manage Clients</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-2 text-center"
          >
            <Calendar className="w-5 h-5 text-orange-400" />
            <span>Service Bookings</span>
          </Link>
          <Link
            to="/admin/quotations"
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-2 text-center"
          >
            <FileSpreadsheet className="w-5 h-5 text-orange-400" />
            <span>Manage Quotes</span>
          </Link>
          <Link
            to="/admin/jobs"
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors flex flex-col items-center gap-2 text-center"
          >
            <Hammer className="w-5 h-5 text-orange-400" />
            <span>Workshop Timeline</span>
          </Link>
        </div>
      </div>

      {/* Admin Dashboard Edit Booking Modal (Requirement 4) */}
      <Modal
        isOpen={!!editingBooking}
        onClose={closeEditModal}
        title={`Edit Service Booking: ${editingBooking?.enquiryNumber || ''}`}
        subtitle="Update customer details, vehicle, schedule, or booking status"
      >
        {editingBooking && (
          <form onSubmit={handleSaveBookingEdit} className="space-y-4 text-xs">
            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Service & Vehicle Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-slate-800"
                >
                  {servicesList.length > 0 ? (
                    servicesList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="New Vehicle – New Body Building">New Vehicle – New Body Building</option>
                      <option value="Accident Vehicle Rework">Accident Vehicle Rework</option>
                      <option value="Old Vehicle to New Model Conversion">Old Vehicle to New Model Conversion</option>
                      <option value="Goods Carrier Modification">Goods Carrier Modification</option>
                      <option value="Tipper Body Modification">Tipper Body Modification</option>
                      <option value="Grocery Vehicle Modification">Grocery Vehicle Modification</option>
                      <option value="Cylinder Vehicle Modification">Cylinder Vehicle Modification</option>
                      <option value="Cattle Carrier Vehicle Modification">Cattle Carrier Vehicle Modification</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editVehicleCategory}
                  onChange={(e) => setEditVehicleCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Heavy Vehicles">Heavy Vehicles (Multi-axle / 10+ Tyre)</option>
                  <option value="Medium Vehicles">Medium Vehicles (6-Tyre)</option>
                  <option value="Small Vehicles">Small Vehicles (4-Tyre Mini Truck)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Details (Make / Model) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editVehicleMakeModel}
                onChange={(e) => setEditVehicleMakeModel(e.target.value)}
                placeholder="e.g. Ashok Leyland 1618, Tata Ace, Eicher Pro"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Preferred Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={editPreferredDate}
                  onChange={(e) => setEditPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={editPreferredTime}
                  onChange={(e) => setEditPreferredTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Morning (08:30 AM - 01:00 PM)">Morning (08:30 AM - 01:00 PM)</option>
                  <option value="Afternoon (01:30 PM - 05:30 PM)">Afternoon (01:30 PM - 05:30 PM)</option>
                  <option value="Evening (05:30 PM - 07:30 PM)">Evening (05:30 PM - 07:30 PM)</option>
                </select>
              </div>
            </div>

            {/* Service Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Location
              </label>
              <input
                type="text"
                value={editServiceLocation}
                onChange={(e) => setEditServiceLocation(e.target.value)}
                placeholder="e.g. Workshop: Vasthanagar, Madurai"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Booking Status Dropdown (Pending, Confirmed, In Progress, Completed, Cancelled) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Status <span className="text-red-500">*</span>
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border border-orange-300 bg-orange-50/50 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="PENDING">Pending (Awaiting Review / Confirmation)</option>
                <option value="CONFIRMED">Confirmed (Booking Accepted / Quoted)</option>
                <option value="IN_PROGRESS">In Progress (Active in Fabrication Yard)</option>
                <option value="COMPLETED">Completed (Service Done / Delivered)</option>
                <option value="CANCELLED">Cancelled (Rejected / Cancelled)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Workshop / Customer Notes
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Special bodybuilding specifications, structural requirements, or admin notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
