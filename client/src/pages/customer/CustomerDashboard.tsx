import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Clock,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Enquiry, Quotation, Job } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        const [enqRes, quoRes, jobRes] = await Promise.all([
          api.enquiries.list(),
          api.quotations.list(),
          api.jobs.list(),
        ]);
        setEnquiries(enqRes.enquiries);
        setQuotations(quoRes.quotations);
        setJobs(jobRes.jobs);
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerData();
  }, []);

  const pendingQuotes = quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT');
  const approvedQuotes = quotations.filter((q) => q.status === 'APPROVED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Customer Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your vehicle bodybuilding, quotations, and live workshop timeline updates.
          </p>
        </div>

        <Link
          to="/services"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Book Workshop Service</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              My Bookings &amp; Enquiries
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{enquiries.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Submitted requests</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Quotes
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{pendingQuotes.length}</div>
            <div className="text-[11px] text-orange-600 font-semibold mt-1">
              Awaiting your approval
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Approved Estimates
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{approvedQuotes.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Ready for production</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Builds
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{jobs.length}</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">Under fabrication</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Jobs Quick Progress Card */}
      {jobs.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                Current Vehicle Work Progress
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {jobs[0].jobNumber} — {jobs[0].vehicleDetails}
              </h3>
            </div>
            <Link
              to="/customer/timeline"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 shadow"
            >
              <span>View Full Interactive Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Current Workshop Stage:</span>
              <div className="text-orange-400 font-bold text-sm mt-0.5">
                {jobs[0].currentStage.replace(/_/g, ' ')}
              </div>
            </div>

            {jobs[0].expectedDeliveryDate && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Target Handover Date:</span>
                <div className="text-white font-bold text-sm mt-0.5">
                  {new Date(jobs[0].expectedDeliveryDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quotations Awaiting Action Alert */}
      {pendingQuotes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-orange-950 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-600" />
              <span>You have {pendingQuotes.length} Quotation(s) Awaiting Review</span>
            </h3>
            <Link
              to="/customer/quotations"
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Review &amp; Approve &rarr;
            </Link>
          </div>
          <p className="text-xs text-orange-900 leading-relaxed">
            Please examine the itemized materials and fabrication charges. Approving the estimate allows our workshop team to formally activate production on your vehicle.
          </p>
        </div>
      )}

      {/* Zero State for New Customers */}
      {enquiries.length === 0 && jobs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Start Your Vehicle Build with RJ BODY BUILDING
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            You don't have any active vehicle bookings yet. Submit your commercial vehicle details to receive an itemized official estimate from our master craftsmen in Vasthanagar, Madurai.
          </p>
          <div className="pt-2">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Book Workshop Service</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
