import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Calendar,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Quotation } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const CustomerQuotations: React.FC = () => {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected for breakdown
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Reject Modal
  const [rejectQuote, setRejectQuote] = useState<Quotation | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.quotations.list();
      setQuotations(res.quotations);
    } catch (err: any) {
      showToast(err.message || 'Failed to load quotations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleApprove = async (quote: Quotation) => {
    if (!window.confirm(`Are you sure you want to approve Quotation ${quote.quoteNumber} for ₹${quote.totalAmount.toLocaleString('en-IN')}? This will signal workshop administration to prepare job fabrication.`)) {
      return;
    }

    setProcessingAction(true);
    try {
      await api.quotations.approve(quote.id);
      showToast(`Quotation ${quote.quoteNumber} approved! Workshop team notified.`, 'success');
      fetchQuotations();
      if (selectedQuotation?.id === quote.id) {
        setSelectedQuotation(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to approve quotation.', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectQuote) return;

    setProcessingAction(true);
    try {
      await api.quotations.reject(rejectQuote.id, rejectionReason.trim());
      showToast('Quotation rejection logged.', 'info');
      setRejectQuote(null);
      setRejectionReason('');
      fetchQuotations();
      if (selectedQuotation?.id === rejectQuote.id) {
        setSelectedQuotation(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to record rejection.', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          Official Estimates
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Workshop Quotations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review transparent itemized charges, confirm approvals, or request revisions.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No quotations issued to your account yet. Submit an enquiry to receive a quotation.
          </div>
        ) : (
          quotations.map((q) => {
            const canAction = q.status === 'SENT';
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-600 text-sm">
                      {q.quoteNumber}
                    </span>
                    <StatusBadge status={q.status} />
                    {q.validityDate && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Valid until: {new Date(q.validityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {q.enquiry?.vehicleMakeModel || 'Custom Commercial Build'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div>
                      Total Estimate:{' '}
                      <strong className="text-slate-900 font-mono text-sm font-black">
                        ₹{q.totalAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    {q.estimatedCompletionDate && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        <span>Est. Completion: {new Date(q.estimatedCompletionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    )}
                  </div>

                  {q.approvedAt && (
                    <div className="text-[11px] text-green-700 font-bold flex items-center gap-1.5 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Approved on {new Date(q.approvedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {q.rejectedAt && (
                    <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1.5 mt-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Rejected: {q.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-wrap items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => setSelectedQuotation(q)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    View Itemized Breakdown
                  </button>

                  {canAction && (
                    <>
                      <button
                        disabled={processingAction}
                        onClick={() => handleApprove(q)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Quotation</span>
                      </button>
                      <button
                        disabled={processingAction}
                        onClick={() => {
                          setRejectQuote(q);
                          setRejectionReason('');
                        }}
                        className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Itemized Modal */}
      <Modal
        isOpen={!!selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        title={`Quotation ${selectedQuotation?.quoteNumber || ''}`}
        subtitle="Itemized Cost Estimation • RJ BODY BUILDING, Madurai"
        maxWidth="max-w-3xl"
      >
        {selectedQuotation && (
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedQuotation.enquiry?.vehicleMakeModel || 'Custom Vehicle'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status:</span>
                <StatusBadge status={selectedQuotation.status} />
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5 text-right">Unit Rate</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuotation.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{item.description}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-2.5 text-right font-mono">₹{item.unitRate.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 max-w-xs ml-auto font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{selectedQuotation.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>- ₹{selectedQuotation.discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes &amp; Charges:</span>
                <span>+ ₹{selectedQuotation.taxOrCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total Quotation:</span>
                <span className="text-orange-600">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {selectedQuotation.notes && (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 italic">
                "{selectedQuotation.notes}"
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Estimation</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedQuotation.status === 'SENT' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedQuotation)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Approve Quotation
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedQuotation(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectQuote}
        onClose={() => setRejectQuote(null)}
        title="Reject Quotation"
        subtitle={`Quotation ${rejectQuote?.quoteNumber || ''}`}
      >
        <form onSubmit={handleReject} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Reason for Rejection / Modification Request
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Budget revised, or need lighter 2mm sheet instead of 3mm..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setRejectQuote(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingAction}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {processingAction ? 'Submitting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
