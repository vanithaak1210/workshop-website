import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Send,
  Eye,
  Hammer,
  Clock,
  Printer,
  X,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Quotation, QuotationItem, User } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminQuotations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Activate Job Modal
  const [jobActivationQuote, setJobActivationQuote] = useState<Quotation | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [activatingJob, setActivatingJob] = useState(false);

  // Quotation Builder Form State
  const [enquiryId, setEnquiryId] = useState(searchParams.get('newFor') || '');
  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [customers, setCustomers] = useState<User[]>([]);
  const [lineItems, setLineItems] = useState<QuotationItem[]>([
    { description: '', quantity: 1, unit: 'Lot', unitRate: 0, amount: 0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [taxOrCharges, setTaxOrCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState(30);
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [savingQuote, setSavingQuote] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.quotations.list(statusFilter !== 'ALL' ? statusFilter : undefined);
      setQuotations(res.quotations);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch quotations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();

    // Fetch genuine customer accounts list for the quotation builder dropdown
    async function fetchCustomersList() {
      try {
        const res = await api.customers.list();
        setCustomers(res.customers);
      } catch (err) {
        console.error('Failed to load customers for quotation:', err);
      }
    }
    fetchCustomersList();

    if (searchParams.get('newFor')) {
      setIsCreateOpen(true);
    }
  }, [statusFilter]);

  // Line item manipulation
  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitRate') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitRate) || 0);
    }
    updated[index] = item;
    setLineItems(updated);
  };

  const addItemRow = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unit: 'Nos', unitRate: 0, amount: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (lineItems.length === 1) {
      showToast('A quotation must contain at least one line item.', 'error');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0) + (Number(taxOrCharges) || 0));

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Please select or assign a customer account.', 'error');
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      showToast('All line items must have a clear description.', 'error');
      return;
    }

    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + validityDays);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + estimatedDeliveryDays);

    setSavingQuote(true);
    try {
      const res = await api.quotations.create({
        enquiryId: enquiryId || undefined,
        customerId,
        items: lineItems,
        discount: Number(discount) || 0,
        taxOrCharges: Number(taxOrCharges) || 0,
        notes: notes.trim(),
        validityDate: validityDate.toISOString(),
        estimatedCompletionDate: completionDate.toISOString(),
        publishImmediately,
      });

      showToast(`Quotation ${res.quotation.quoteNumber} created successfully!`, 'success');
      setIsCreateOpen(false);
      fetchQuotations();
    } catch (err: any) {
      showToast(err.message || 'Failed to create quotation.', 'error');
    } finally {
      setSavingQuote(false);
    }
  };

  // Activate Job Action (Only for Approved Quotations)
  const openActivateJobModal = (quote: Quotation) => {
    setJobActivationQuote(quote);
    setVehicleDetails(quote.enquiry?.vehicleMakeModel || 'Commercial Lorry (Chassis To Be Logged)');
    setExpectedDeliveryDate(
      quote.estimatedCompletionDate
        ? new Date(quote.estimatedCompletionDate).toISOString().split('T')[0]
        : ''
    );
  };

  const handleConfirmActivateJob = async () => {
    if (!jobActivationQuote || !vehicleDetails.trim()) {
      showToast('Vehicle details are required to formally activate workshop job.', 'error');
      return;
    }

    setActivatingJob(true);
    try {
      const res = await api.jobs.activate({
        quotationId: jobActivationQuote.id,
        vehicleDetails: vehicleDetails.trim(),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
      });

      showToast(`Workshop Job ${res.job.jobNumber} activated! Transitioning to live timeline.`, 'success');
      setJobActivationQuote(null);
      fetchQuotations();
      navigate('/admin/jobs');
    } catch (err: any) {
      showToast(err.message || 'Failed to activate workshop job.', 'error');
    } finally {
      setActivatingJob(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Module 07
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quotation Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare transparent cost breakdowns, publish estimates, and activate approved workshop jobs.
          </p>
        </div>

        <button
          onClick={() => {
            setEnquiryId('');
            setCustomerId(customers[0]?.id || '');
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-950/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter Status:</span>
          {['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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

      {/* Quotations List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No quotations found</p>
            <p className="text-xs text-slate-400">Generate your first estimate using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Quote Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Enquiry / Vehicle</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-orange-600">{q.quoteNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(q.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{q.customer?.name}</div>
                      <div className="text-[11px] text-slate-500">{q.customer?.phone}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {q.enquiry?.vehicleMakeModel || 'Custom Direct Vehicle'}
                      </div>
                      {q.enquiry && (
                        <div className="text-[10px] font-mono text-slate-400">
                          Ref: {q.enquiry.enquiryNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{q.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={q.status} />
                      {q.approvedAt && (
                        <div className="text-[10px] text-green-700 font-medium mt-0.5">
                          Approved: {new Date(q.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedQuotation(q)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        View Breakdown
                      </button>

                      {/* Action to Activate Workshop Job if approved and not yet activated */}
                      {q.status === 'APPROVED' && !q.job && (
                        <button
                          onClick={() => openActivateJobModal(q)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm inline-flex items-center gap-1"
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          <span>Activate Job</span>
                        </button>
                      )}

                      {q.job && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{q.job.jobNumber} Active</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotation Builder Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Official Workshop Quotation"
        subtitle="RJ BODY BUILDING — Vasthanagar, Madurai"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-6 text-xs">
          {/* Top selection bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Customer Account *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Select Customer Account --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Linked Enquiry Reference (Optional)
              </label>
              <input
                type="text"
                value={enquiryId}
                onChange={(e) => setEnquiryId(e.target.value)}
                placeholder="Enquiry ID / Leave blank for direct"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
              />
            </div>
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Itemized Work &amp; Materials Breakdown
              </span>
              <button
                type="button"
                onClick={addItemRow}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-orange-600 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Item Description</th>
                    <th className="px-3 py-2 w-20">Qty</th>
                    <th className="px-3 py-2 w-24">Unit</th>
                    <th className="px-3 py-2 w-28">Rate (₹)</th>
                    <th className="px-3 py-2 w-28">Amount (₹)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Channel welding, PU paint..."
                          className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs bg-white"
                        >
                          {['Nos', 'Meter', 'Kg', 'Sheet', 'Lot', 'Hours'].map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitRate}
                          onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                          className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Quotation Notes &amp; Specifications
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Est. Build Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedDeliveryDays}
                    onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Items):</span>
                <span className="font-mono font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Special Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 p-1 text-right rounded border border-slate-300 font-mono text-xs"
                />
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Taxes &amp; Protective Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={taxOrCharges}
                  onChange={(e) => setTaxOrCharges(Number(e.target.value))}
                  className="w-24 p-1 text-right rounded border border-slate-300 font-mono text-xs"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm text-slate-900">
                <span>Final Quotation Total:</span>
                <span className="font-mono text-orange-600 text-base">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(e) => setPublishImmediately(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700">
                    Publish immediately to Customer Portal (Status: SENT)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingQuote}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md"
            >
              {savingQuote ? 'Saving Quotation...' : 'Create Official Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Breakdown Modal */}
      <Modal
        isOpen={!!selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        title={`Quotation ${selectedQuotation?.quoteNumber || ''}`}
        subtitle="Itemized Cost Estimation • RJ BODY BUILDING"
        maxWidth="max-w-3xl"
      >
        {selectedQuotation && (
          <div className="space-y-6 text-xs">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status:</span>
                <StatusBadge status={selectedQuotation.status} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer:</span>
                <span className="font-bold text-slate-800">{selectedQuotation.customer?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Estimate:</span>
                <span className="font-mono font-black text-orange-600 text-sm">
                  ₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5 text-right">Rate</th>
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
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
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
                <span>Charges &amp; Taxes:</span>
                <span>+ ₹{selectedQuotation.taxOrCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total:</span>
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
                <span>Print Quotation</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Activate Job Modal (Crucial Module 7/8 rule) */}
      <Modal
        isOpen={!!jobActivationQuote}
        onClose={() => setJobActivationQuote(null)}
        title="Activate Workshop Job"
        subtitle={`Quotation ${jobActivationQuote?.quoteNumber} is Approved. This will initialize the live workshop timeline.`}
      >
        <div className="space-y-4 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Customer Approval Verified:</span> Customer approved the estimate of ₹
              {jobActivationQuote?.totalAmount.toLocaleString('en-IN')}. Activating the job will register it into the active production queue and create initial stage history.
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Vehicle Make, Model &amp; Registration / Chassis Number *
            </label>
            <input
              type="text"
              required
              value={vehicleDetails}
              onChange={(e) => setVehicleDetails(e.target.value)}
              placeholder="e.g. Ashok Leyland Boss 1415 (Chassis: MB1A19A0XP...)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Delivery Date
            </label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setJobActivationQuote(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={activatingJob}
              onClick={handleConfirmActivateJob}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Hammer className="w-4 h-4" />
              <span>{activatingJob ? 'Activating Job...' : 'Confirm Job Activation'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
