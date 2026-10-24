import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Hammer,
  Truck,
  ArrowRight,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Service, VehicleCategory } from '../types';
import { Modal } from '../components/Modal';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Customer Booking & Enquiry Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'BOOK_SERVICE' | 'MAKE_ENQUIRY'>('BOOK_SERVICE');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('Heavy Vehicles');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning (08:30 AM - 01:00 PM)');
  const [serviceLocation, setServiceLocation] = useState('Workshop: Vasthanagar, Madurai');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  // Submission & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceNumber: string;
    isBooking: boolean;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    vehicleCategory?: string;
    vehicleMakeModel?: string;
    preferredDate?: string;
    preferredTime?: string;
    serviceLocation?: string;
    notes?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [servRes, catRes] = await Promise.all([
          api.settings.getServices(),
          api.settings.getCategories(),
        ]);
        setServices(servRes.services);
        // Exclude any Tyre category if present
        const filteredCats = (catRes.categories || []).filter(
          (c) => !c.name.toLowerCase().includes('tyre')
        );
        setCategories(filteredCats);
        if (filteredCats.length > 0) {
          setVehicleCategory(filteredCats[0].name);
        }
      } catch (err) {
        console.error('Failed to load services & categories:', err);
      }
    }
    loadInitialData();
  }, []);

  const serviceCategories = [
    'ALL',
    'Fabrication',
    'Repair',
    'Modification',
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  // Open modal with pre-selected service and chosen action
  const handleOpenAction = (service: Service, action: 'BOOK_SERVICE' | 'MAKE_ENQUIRY') => {
    setSelectedService(service);
    setActiveTab(action);
    setErrorMsg(null);
    setSubmittedData(null);
    setIsOpen(true);
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setVehicleMakeModel('');
    setPreferredDate('');
    setPreferredTime('Morning (08:30 AM - 01:00 PM)');
    setServiceLocation('Workshop: Vasthanagar, Madurai');
    setNotes('');
    setMessage('');
    setErrorMsg(null);
    setSubmittedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit contact phone number.');
      return;
    }

    if (activeTab === 'BOOK_SERVICE') {
      if (!vehicleMakeModel.trim()) {
        setErrorMsg('Please provide your vehicle make and model (e.g. Tata Ace, Ashok Leyland 1618, etc.).');
        return;
      }
      if (!preferredDate) {
        setErrorMsg('Please select your preferred service date.');
        return;
      }
    } else {
      if (!message.trim()) {
        setErrorMsg('Please enter your enquiry message or details.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: any = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        selectedService: selectedService?.name || 'General Workshop Service',
        enquiryType: activeTab === 'BOOK_SERVICE' ? 'SERVICE_BOOKING' : 'GENERAL_ENQUIRY',
        actionType: activeTab,
      };

      if (activeTab === 'BOOK_SERVICE') {
        payload.vehicleCategory = vehicleCategory;
        payload.vehicleMakeModel = vehicleMakeModel.trim();
        payload.vehiclePurpose = selectedService?.name || 'Commercial Vehicle Service';
        payload.preferredDate = preferredDate;
        payload.preferredTime = preferredTime;
        payload.serviceLocation = serviceLocation;
        payload.notes = notes.trim() || undefined;
      } else {
        payload.vehicleCategory = 'General';
        payload.vehicleMakeModel = vehicleMakeModel.trim() || 'General Vehicle';
        payload.vehiclePurpose = 'Service Enquiry';
        payload.notes = message.trim();
      }

      const res = await api.enquiries.submit(payload);

      setSubmittedData({
        referenceNumber: res.enquiry.enquiryNumber,
        isBooking: activeTab === 'BOOK_SERVICE',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceName: selectedService?.name || 'Commercial Service',
        vehicleCategory: activeTab === 'BOOK_SERVICE' ? vehicleCategory : undefined,
        vehicleMakeModel: vehicleMakeModel.trim() || undefined,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        serviceLocation: serviceLocation || undefined,
        notes: (activeTab === 'BOOK_SERVICE' ? notes : message).trim() || undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit. Please verify details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Min date for preferred booking: today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
            <Wrench className="w-4 h-4" />
            <span>Master Craftsmanship Since 1991</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            RJ BODY BUILDING Services
          </h1>
          <p className="text-orange-400 font-semibold text-lg mt-2">
            Lorry Body Building &amp; Modification Workshop • Vasthanagar, Madurai
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            Select any workshop service below to instantly book an appointment or send an enquiry. No account creation or login is required.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Filter by Category:
          </span>
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-orange-400 hover:shadow-lg transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors shadow">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-full">
                    {svc.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {svc.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {svc.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ISMC Heavy Channel Structural Fabrication</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>RTO AIS-090 Specification Compliant</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Option A & Option B */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAction(svc, 'BOOK_SERVICE')}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAction(svc, 'MAKE_ENQUIRY')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Enquire</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Customer Service Booking & Enquiry Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title={
          submittedData
            ? 'Submission Confirmed'
            : activeTab === 'BOOK_SERVICE'
            ? 'Book Workshop Service'
            : 'Make a Service Enquiry'
        }
        subtitle={
          submittedData
            ? 'RJ BODY BUILDING • Vasthanagar, Madurai'
            : `Selected: ${selectedService?.name || 'Workshop Service'}`
        }
      >
        {/* Step 7: Clear Confirmation Screen */}
        {submittedData ? (
          <div className="space-y-6 text-xs animate-in fade-in duration-200">
            {/* Success Banner */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="text-base font-black text-emerald-900">
                  {submittedData.isBooking
                    ? 'Service Booking Successfully Registered!'
                    : 'Enquiry Received Successfully!'}
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you for choosing <strong>RJ BODY BUILDING</strong>. Our workshop team in Vasthanagar, Madurai will review your requirements and call you at{' '}
                  <span className="font-bold underline">{submittedData.customerPhone}</span>.
                </p>
              </div>
            </div>

            {/* Reference Number Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  Official Reference Number
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyReference(submittedData.referenceNumber)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-orange-400" />
                      <span>Copy Ref</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-orange-500">
                {submittedData.referenceNumber}
              </div>
              <p className="text-[11px] text-slate-400">
                Please quote this reference number for any follow-up or workshop visits.
              </p>
            </div>

            {/* Summary of Booking/Enquiry Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                Submission Summary
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Name:</span>
                  <span className="font-bold text-slate-900">{submittedData.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Number:</span>
                  <span className="font-bold text-slate-900">{submittedData.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Selected Service:</span>
                  <span className="font-bold text-orange-600">{submittedData.serviceName}</span>
                </div>
                {submittedData.vehicleCategory && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vehicle Category:</span>
                    <span className="font-bold text-slate-900">{submittedData.vehicleCategory}</span>
                  </div>
                )}
                {submittedData.vehicleMakeModel && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Vehicle Model:</span>
                    <span className="font-bold text-slate-900">{submittedData.vehicleMakeModel}</span>
                  </div>
                )}
                {submittedData.preferredDate && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Preferred Date &amp; Slot:</span>
                    <span className="font-bold text-slate-900">
                      {new Date(submittedData.preferredDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      {submittedData.preferredTime ? `• ${submittedData.preferredTime}` : ''}
                    </span>
                  </div>
                )}
                {submittedData.serviceLocation && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Service Location:</span>
                    <span className="font-bold text-slate-900">{submittedData.serviceLocation}</span>
                  </div>
                )}
                {submittedData.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Customer Notes:</span>
                    <span className="text-slate-700 italic">"{submittedData.notes}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Workshop Contact Details for Urgent Inquiries */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Workshop Contact &amp; Location
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>RJ BODY BUILDING:</strong> Vasthanagar, near Agrini / Ravithurayan Temple, Madurai, Tamil Nadu, India.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Monday - Saturday: 8:30 AM - 7:30 PM (Sunday Closed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>
                    Workshop Support:{' '}
                    <a
                      href="tel:6379302952"
                      className="font-bold text-orange-600 hover:text-orange-700 underline"
                    >
                      +91 63793 02952
                    </a>{' '}
                    • 35 Years of Trusted Service
                  </span>
                </div>
              </div>
            </div>

            {/* Post-Confirmation Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSubmittedData(null);
                }}
                className="w-full sm:flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Another Service</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="w-full sm:flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition-colors"
              >
                Close &amp; Return to Services
              </button>
            </div>
          </div>
        ) : (
          /* Step 3 & 4: Interactive Booking / Enquiry Form */
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Step 2 Indicator: Selected Service Header */}
            <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">
                    Selected Service
                  </span>
                  <div className="font-extrabold text-sm text-slate-900">
                    {selectedService?.name || 'Commercial Lorry Body Building'}
                  </div>
                </div>
              </div>

              {/* Service Switcher Dropdown */}
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const found = services.find((s) => s.id === e.target.value);
                  if (found) setSelectedService(found);
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-orange-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Choose Option: Book Service OR Make an Enquiry */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('BOOK_SERVICE')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'BOOK_SERVICE'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Option A: Book Service</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MAKE_ENQUIRY')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'MAKE_ENQUIRY'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Option B: Make an Enquiry</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Contact Details (Common to both) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. K. Murugesan"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile (e.g. 94430 12345)"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* OPTION A: BOOK SERVICE FIELDS */}
            {activeTab === 'BOOK_SERVICE' ? (
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle Category (Tyre category removed!) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-slate-800"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.axleType ? `(${c.axleType})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Details (Make/Model) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleMakeModel}
                      onChange={(e) => setVehicleMakeModel(e.target.value)}
                      placeholder="e.g. Tata Ace, Ashok Leyland 1618, Eicher Pro"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preferred Date & Preferred Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        <option value="Morning (08:30 AM - 01:00 PM)">Morning (08:30 AM - 01:00 PM)</option>
                        <option value="Afternoon (01:30 PM - 05:30 PM)">Afternoon (01:30 PM - 05:30 PM)</option>
                        <option value="Evening (05:30 PM - 07:30 PM)">Evening (05:30 PM - 07:30 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Service Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Location <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        serviceLocation.includes('Vasthanagar')
                          ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceLocation"
                        value="Workshop: Vasthanagar, Madurai"
                        checked={serviceLocation.includes('Vasthanagar')}
                        onChange={(e) => setServiceLocation(e.target.value)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>Workshop (Vasthanagar, Madurai)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        serviceLocation.includes('On-Site')
                          ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceLocation"
                        value="On-Site / Vehicle Pickup Request"
                        checked={serviceLocation.includes('On-Site')}
                        onChange={(e) => setServiceLocation(e.target.value)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>On-Site / Pickup Request</span>
                    </label>
                  </div>
                </div>

                {/* Notes / Special Requirements */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes / Custom Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify tipper body dimensions, cabin modifications, paint codes, or special requirements..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            ) : (
              /* OPTION B: MAKE AN ENQUIRY FIELDS */
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enquiry Details &amp; Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your lorry bodybuilding, cabin modification, or repair requirements. Ask questions regarding pricing, materials, or completion timelines..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Model (Optional)
                    </label>
                    <input
                      type="text"
                      value={vehicleMakeModel}
                      onChange={(e) => setVehicleMakeModel(e.target.value)}
                      placeholder="e.g. Tata, Ashok Leyland, Eicher"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Callback Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call after 4:00 PM"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Public Note: No login required */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>
                <strong>100% Free Public Service:</strong> No registration or customer login is needed. Your submission will receive an instant official reference number.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-950/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : activeTab === 'BOOK_SERVICE' ? (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Service Booking</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4" />
                    <span>Submit Service Enquiry</span>
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

export default ServicesPage;
