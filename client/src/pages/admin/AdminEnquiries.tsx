import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Truck,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Edit3,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Enquiry } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BOOKINGS' | 'ENQUIRIES'>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const { showToast } = useToast();
  const navigate = useNavigate();

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
      await fetchEnquiries();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update booking. Please verify details and try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.enquiries.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
      });
      setEnquiries(res.enquiries);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch enquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.enquiries.updateStatus(enquiryId, newStatus);
      showToast(`Status updated to ${newStatus}.`, 'success');
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
      fetchEnquiries();
    } catch (err: any) {
      showToast(err.message || 'Failed to update enquiry status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateQuotation = (enq: Enquiry) => {
    navigate(
      `/admin/quotations?newFor=${enq.id}&customerName=${encodeURIComponent(
        enq.customerName
      )}&customerId=${enq.customerId || ''}&vehicle=${encodeURIComponent(
        enq.vehicleMakeModel
      )}`
    );
  };

  // Filter by Type: BOOKINGS vs ENQUIRIES
  const filteredEnquiries = enquiries.filter((e) => {
    const isBooking =
      e.enquiryType === 'SERVICE_BOOKING' || Boolean(e.preferredDate) || Boolean(e.serviceLocation);
    if (typeFilter === 'BOOKINGS') return isBooking;
    if (typeFilter === 'ENQUIRIES') return !isBooking;
    return true;
  });

  const totalBookingsCount = enquiries.filter(
    (e) => e.enquiryType === 'SERVICE_BOOKING' || Boolean(e.preferredDate) || Boolean(e.serviceLocation)
  ).length;
  const totalEnquiriesCount = enquiries.length - totalBookingsCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Module 06
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Bookings &amp; Enquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review public customer service bookings and general workshop enquiries in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnquiries}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Primary Category Switcher: All vs Service Bookings vs General Enquiries */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setTypeFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            typeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4 text-orange-400" />
          <span>All Submissions ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setTypeFilter('BOOKINGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            typeFilter === 'BOOKINGS'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Service Bookings ({totalBookingsCount})</span>
        </button>

        <button
          onClick={() => setTypeFilter('ENQUIRIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            typeFilter === 'ENQUIRIES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>General Enquiries ({totalEnquiriesCount})</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, customer, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries & Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading customer submissions...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No records found</p>
            <p className="text-xs text-slate-400">Try adjusting your type or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Ref No &amp; Type</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Service &amp; Vehicle</th>
                  <th className="px-5 py-3.5">Schedule / Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((enq) => {
                  const isBooking =
                    enq.enquiryType === 'SERVICE_BOOKING' ||
                    Boolean(enq.preferredDate) ||
                    Boolean(enq.serviceLocation);

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-orange-600">
                          {enq.enquiryNumber}
                        </div>
                        <div className="mt-1">
                          {isBooking ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">
                              <Calendar className="w-3 h-3" /> Booking
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                              <HelpCircle className="w-3 h-3" /> Enquiry
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{enq.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{enq.customerPhone}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {enq.selectedService || enq.enquiryType}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-orange-500" />
                          <span>
                            {enq.vehicleMakeModel}{' '}
                            {enq.vehicleCategory && enq.vehicleCategory !== 'General'
                              ? `(${enq.vehicleCategory})`
                              : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isBooking && (enq.preferredDate || enq.serviceLocation) ? (
                          <div className="space-y-0.5">
                            {enq.preferredDate && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-800 font-medium">
                                <Clock className="w-3 h-3 text-orange-500" />
                                <span>
                                  {new Date(enq.preferredDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}{' '}
                                  {enq.preferredTime ? `• ${enq.preferredTime}` : ''}
                                </span>
                              </div>
                            )}
                            {enq.serviceLocation && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-xs">{enq.serviceLocation}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic max-w-xs truncate">
                            {enq.notes || enq.vehiclePurpose || 'General enquiry'}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={enq.status} />
                      </td>

                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(enq)}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleCreateQuotation(enq)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-2xs"
                        >
                          Quote
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Submission Detail Modal */}
      <Modal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        title={`${
          selectedEnquiry?.enquiryType === 'SERVICE_BOOKING' || Boolean(selectedEnquiry?.preferredDate)
            ? 'Service Booking'
            : 'Customer Enquiry'
        }: ${selectedEnquiry?.enquiryNumber || ''}`}
        subtitle={`Received on ${
          selectedEnquiry ? new Date(selectedEnquiry.createdAt).toLocaleString('en-IN') : ''
        }`}
      >
        {selectedEnquiry && (
          <div className="space-y-6 text-xs">
            {/* Status Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Current Status:</span>
                <StatusBadge status={selectedEnquiry.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Change Status:</span>
                <select
                  disabled={updatingStatus}
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {['NEW', 'IN_REVIEW', 'QUOTED', 'CONVERTED', 'REJECTED'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Customer Details:
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedEnquiry.customerName}
                </div>
                <div className="text-slate-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>{selectedEnquiry.customerPhone}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Selected Service &amp; Vehicle:
                </span>
                <div className="font-bold text-orange-600 text-sm">
                  {selectedEnquiry.selectedService || selectedEnquiry.enquiryType}
                </div>
                <div className="text-slate-700 font-medium">
                  {selectedEnquiry.vehicleMakeModel}{' '}
                  <span className="text-slate-400">({selectedEnquiry.vehicleCategory})</span>
                </div>
              </div>
            </div>

            {/* Schedule & Location (for Bookings) */}
            {(selectedEnquiry.preferredDate || selectedEnquiry.serviceLocation) && (
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                <span className="text-[10px] text-orange-800 uppercase font-bold block tracking-wider">
                  Booking Schedule &amp; Workshop Location:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Preferred Date &amp; Time:</span>
                    <span className="font-bold text-slate-900">
                      {selectedEnquiry.preferredDate
                        ? new Date(selectedEnquiry.preferredDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Flexible'}
                      {selectedEnquiry.preferredTime ? ` • ${selectedEnquiry.preferredTime}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Service Location:</span>
                    <span className="font-bold text-slate-900">
                      {selectedEnquiry.serviceLocation || 'Vasthanagar Workshop, Madurai'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Purpose */}
            {selectedEnquiry.vehiclePurpose && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Vehicle Usage / Purpose:
                </span>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 font-medium border border-slate-100">
                  {selectedEnquiry.vehiclePurpose}
                </div>
              </div>
            )}

            {/* Notes / Special Requirements */}
            {selectedEnquiry.notes && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Customer Notes &amp; Requirements:
                </span>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 italic border border-slate-100 leading-relaxed">
                  "{selectedEnquiry.notes}"
                </div>
              </div>
            )}

            {/* Optional photo */}
            {selectedEnquiry.photoUrl && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Uploaded Vehicle Photograph:
                </span>
                <img
                  src={selectedEnquiry.photoUrl}
                  alt="Vehicle"
                  className="max-h-60 rounded-xl border border-slate-200 object-cover"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const toEdit = selectedEnquiry;
                  setSelectedEnquiry(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Booking</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCreateQuotation(selectedEnquiry);
                  setSelectedEnquiry(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-orange-400" />
                <span>Create Quotation</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Booking Modal (Requirement 4) */}
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
                  <option value="New Vehicle – New Body Building">New Vehicle – New Body Building</option>
                  <option value="Accident Vehicle Rework">Accident Vehicle Rework</option>
                  <option value="Old Vehicle to New Model Conversion">Old Vehicle to New Model Conversion</option>
                  <option value="Goods Carrier Modification">Goods Carrier Modification</option>
                  <option value="Tipper Body Modification">Tipper Body Modification</option>
                  <option value="Grocery Vehicle Modification">Grocery Vehicle Modification</option>
                  <option value="Cylinder Vehicle Modification">Cylinder Vehicle Modification</option>
                  <option value="Cattle Carrier Vehicle Modification">Cattle Carrier Vehicle Modification</option>
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

export default AdminEnquiries;
