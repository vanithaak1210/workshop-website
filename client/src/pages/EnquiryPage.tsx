import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Truck,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Sparkles,
  Phone,
  User,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const EnquiryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [vehicleCategory, setVehicleCategory] = useState(searchParams.get('category') || 'Heavy Vehicles');
  const [vehicleMakeModel, setVehicleMakeModel] = useState(searchParams.get('makeModel') || '');
  const [vehiclePurpose, setVehiclePurpose] = useState('');
  const [enquiryType, setEnquiryType] = useState('New Body Building');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    searchParams.get('service') ? [searchParams.get('service')!] : ['Painting', 'Reflective stickers']
  );
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Sync logged in customer info automatically
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Available options
  const serviceCheckboxes = [
    'Painting',
    'Glass fitting',
    'A/C fitting',
    'Reflective stickers',
    'Electrical work',
    'Lining',
    'Brake / mechanical check',
    'Other requirements',
  ];

  const categories = [
    'Heavy Vehicles',
    'Medium Vehicles',
    'Small Vehicles',
  ];

  const enquiryTypes = [
    'New Body Building',
    'Modification',
    'Accident Repair / Rework',
  ];

  const handleCheckboxToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be less than 5MB.', 'error');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please enter your name and contact phone number.', 'error');
      return;
    }

    const cleanPhone = customerPhone.trim();
    if (cleanPhone.length < 10) {
      showToast('Please provide a valid 10-digit mobile number.', 'error');
      return;
    }

    if (!vehicleMakeModel.trim()) {
      showToast('Please specify your vehicle make & model (e.g., Tata Ace, Ashok Leyland Boss).', 'error');
      return;
    }

    if (!vehiclePurpose.trim()) {
      showToast('Please specify the primary commercial purpose (e.g., quarry, goods freight, grocery).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | undefined = undefined;

      // Upload photo if selected
      if (photoFile) {
        try {
          const uploadRes = await api.upload(photoFile);
          photoUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Optional photo upload failed, continuing with enquiry:', uploadErr);
        }
      }

      const res = await api.enquiries.submit({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        vehicleCategory,
        vehicleMakeModel: vehicleMakeModel.trim(),
        vehiclePurpose: vehiclePurpose.trim(),
        enquiryType,
        requestedServices: selectedServices,
        notes: notes.trim(),
        photoUrl,
      });

      setSubmittedRef(res.enquiry.enquiryNumber);
      showToast(`Enquiry ${res.enquiry.enquiryNumber} submitted successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit enquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
            <FileText className="w-4 h-4" />
            <span>Customer Requirement Submission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Vehicle Enquiry Form
          </h1>
          <p className="text-orange-400 font-semibold text-lg mt-2">
            RJ BODY BUILDING • Vasthanagar, Madurai
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mt-4 leading-relaxed">
            Fill in your vehicle specifications, desired bodybuilding or modification requirements, and trade services to receive an itemized official quotation.
          </p>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {submittedRef ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Submission Successful
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Thank You, {customerName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
                Your enquiry has been securely logged into the RJ BODY BUILDING workshop management system.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto space-y-2">
              <div className="text-xs text-slate-500 font-semibold uppercase">Your Unique Reference:</div>
              <div className="text-2xl font-black font-mono text-orange-600 tracking-wider">
                {submittedRef}
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Vehicle: {vehicleMakeModel} ({enquiryType})
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our workshop team in Vasthanagar, Madurai will review your requirements and prepare an itemized quotation. You can track this enquiry anytime.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {user ? (
                <Link
                  to="/customer/enquiries"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl shadow-md transition-colors"
                >
                  View My Enquiries
                </Link>
              ) : (
                <Link
                  to="/services"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl shadow-md transition-colors"
                >
                  Explore Workshop Services
                </Link>
              )}
              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setVehicleMakeModel('');
                  setVehiclePurpose('');
                  setNotes('');
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-6 py-3 rounded-xl transition-colors"
              >
                Submit Another Vehicle
              </button>
            </div>
          </div>
        ) : (
          /* The Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8"
          >
            {/* Account Status Banner */}
            {user ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Logged in as {user.name} ({user.email})
                    </div>
                    <div className="text-[11px] text-orange-800">
                      This vehicle order will be automatically linked to your customer dashboard.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-200/80 text-orange-950 px-2.5 py-1 rounded-md self-start sm:self-auto">
                  Verified Account
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span>
                  <strong>Public Enquiry:</strong> No login or account required. You will receive an instant official reference number upon submission.
                </span>
                <Link
                  to="/services"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline shrink-0"
                >
                  View Services
                </Link>
              </div>
            )}

            {/* Section 1: Customer Details */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                <User className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  1. Contact Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Senthil Kumar (Meenakshi Roadways)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 98421 11223"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    10-digit mobile number for quotation updates.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle Specs */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                <Truck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  2. Vehicle Specifications
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Category *
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Make &amp; Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleMakeModel}
                    onChange={(e) => setVehicleMakeModel(e.target.value)}
                    placeholder="e.g. Ashok Leyland Boss 1415 / Tata Ace"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enquiry Type *
                  </label>
                  <select
                    value={enquiryType}
                    onChange={(e) => setEnquiryType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                  >
                    {enquiryTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Purpose &amp; Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehiclePurpose}
                    onChange={(e) => setVehiclePurpose(e.target.value)}
                    placeholder="e.g. Quarry gravel, Interstate groceries, Dairy"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Required Services Multi-Select Checkboxes */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  3. Required Services &amp; Fitments (Select all that apply)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {serviceCheckboxes.map((service) => {
                  const isChecked = selectedServices.includes(service);
                  return (
                    <label
                      key={service}
                      onClick={() => handleCheckboxToggle(service)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'bg-orange-50/80 border-orange-500 text-orange-950 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span>{service}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Notes and Vehicle Photograph */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Notes &amp; Structural Requirements
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify dimensions (e.g., 22ft length), steel gauge preferences, side shutter requirements, or damage details if accident repair."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Optional Vehicle Photograph (Chassis / Damage / Current State)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {photoFile && (
                  <span className="text-xs text-slate-600 font-medium">
                    {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              {photoPreview && (
                <div className="mt-3 w-32 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Submission Button with Duplicate Prevention */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Official workshop quotation will be generated by RJ BODY BUILDING administration.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  submitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/30 transform hover:-translate-y-0.5'
                }`}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Vehicle Enquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
