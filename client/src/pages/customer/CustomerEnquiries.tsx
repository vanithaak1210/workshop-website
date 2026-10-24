import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Plus, Phone, Calendar, Truck, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Enquiry } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export const CustomerEnquiries: React.FC = () => {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const res = await api.enquiries.list();
        setEnquiries(res.enquiries);
      } catch (err: any) {
        showToast(err.message || 'Failed to load your orders & enquiries.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchEnquiries();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Vehicle Orders &amp; Enquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking for all vehicle bodybuilding and modification requirements submitted to RJ BODY BUILDING.
          </p>
        </div>

        <Link
          to="/enquiry"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Place New Order / Enquiry</span>
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your orders...</div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No vehicle orders or enquiries placed yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Submit your lorry or commercial vehicle specifications to receive an official workshop quotation.
            </p>
            <Link
              to="/enquiry"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Vehicle Requirements</span>
            </Link>
          </div>
        ) : (
          enquiries.map((enq) => {
            let servicesList: string[] = [];
            if (enq.requestedServices) {
              try {
                const parsed = JSON.parse(enq.requestedServices);
                if (Array.isArray(parsed)) servicesList = parsed;
              } catch {
                // Ignore parse error
              }
            }

            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-5 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-orange-600 text-sm tracking-wide">
                      {enq.enquiryNumber}
                    </span>
                    <StatusBadge status={enq.status} />
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                      {enq.enquiryType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{enq.vehicleMakeModel}</h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>
                      Category: <span className="font-semibold text-slate-800">{enq.vehicleCategory}</span>
                    </div>
                    <div>
                      Intended Commercial Purpose: <span className="font-semibold text-slate-800">{enq.vehiclePurpose}</span>
                    </div>
                  </div>

                  {/* Requested Services Tags */}
                  {servicesList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {servicesList.map((svc) => (
                        <span
                          key={svc}
                          className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-orange-600" />
                          <span>{svc}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {enq.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl mt-2">
                      "{enq.notes}"
                    </p>
                  )}

                  {enq.photoUrl && (
                    <div className="pt-1">
                      <a
                        href={enq.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>View Attached Vehicle Photo</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="shrink-0 md:text-right space-y-3 pt-1">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Submitted:{' '}
                    {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  {enq.quotations && enq.quotations.length > 0 ? (
                    <Link
                      to="/customer/quotations"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold transition-colors"
                    >
                      <span>Review Quotation ({enq.quotations[0].quoteNumber})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Under workshop administrative review
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default CustomerEnquiries;
