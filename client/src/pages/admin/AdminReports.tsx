import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Hammer,
  Inbox,
  Users,
  CheckCircle2,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardMetrics } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminReports: React.FC = () => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [reportType, setReportType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [metricsRes, detailedRes] = await Promise.all([
        api.reports.getDashboardMetrics(),
        api.reports.getDetailedReport({
          type: reportType !== 'ALL' ? reportType : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setMetrics(metricsRes.metrics);
      setReportData(detailedRes.reportData);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  const handleDateFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (!reportData && !metrics) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'RJ BODY BUILDING - WORKSHOP OPERATIONS AUDIT REPORT\n';
    csvContent += 'Location: Vasthanagar, near Agrini / Ravithurayan Temple, Madurai\n';
    csvContent += `Generated On: ${new Date().toLocaleString('en-IN')}\n\n`;

    // Overview Metrics
    if (metrics) {
      csvContent += 'OPERATIONS & CUSTOMER SUMMARY\n';
      csvContent += `Registered Customer Accounts,${metrics.customerCount}\n`;
      csvContent += `Total Enquiries / Orders,${metrics.totalEnquiries}\n`;
      csvContent += `Total Service Bookings,${metrics.totalBookings || 0}\n`;
      csvContent += `Pending Orders,${metrics.pendingOrders}\n`;
      csvContent += `Confirmed Orders,${metrics.confirmedOrders}\n`;
      csvContent += `Completed Builds,${metrics.completedOrders}\n`;
      csvContent += `Active Ongoing Builds,${metrics.ongoingJobs}\n\n`;
    }

    if (reportData?.enquiries && reportData.enquiries.length > 0) {
      csvContent += 'CUSTOMER ENQUIRIES & ORDERS\n';
      csvContent += 'Reference No,Customer,Phone,Vehicle,Purpose,Status,Date\n';
      reportData.enquiries.forEach((e: any) => {
        csvContent += `"${e.enquiryNumber}","${e.customerName}","${e.customerPhone}","${e.vehicleMakeModel}","${e.vehiclePurpose}","${e.status}","${new Date(e.createdAt).toLocaleDateString()}"\n`;
      });
      csvContent += '\n';
    }

    if (reportData?.jobs && reportData.jobs.length > 0) {
      csvContent += 'WORKSHOP JOBS & TIMELINE\n';
      csvContent += 'Job No,Vehicle,Customer,Current Stage,Status,Created Date\n';
      reportData.jobs.forEach((j: any) => {
        csvContent += `"${j.jobNumber}","${j.vehicleDetails}","${j.customer?.name}","${j.currentStage}","${j.status}","${new Date(j.createdAt).toLocaleDateString()}"\n`;
      });
      csvContent += '\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RJ_Body_Building_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV file downloaded.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 no-print">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Real Database Analytics
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Workshop Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% computed from genuine database records for customers, enquiries, bookings, and jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Category Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <form onSubmit={handleDateFilterSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 uppercase">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 uppercase">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-500 transition-colors"
          >
            Apply Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'CUSTOMERS', 'ENQUIRIES', 'QUOTATIONS', 'JOBS'].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                reportType === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards Grid (Computed from Real DB Records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer Accounts
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.customerCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics?.customerCount === 0 ? 'No customers registered yet' : 'Verified genuine clients'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Enquiries / Orders
            </span>
            <Inbox className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.totalEnquiries || 0}
          </div>
          <div className="text-[11px] text-orange-600 font-semibold mt-1">
            {metrics?.pendingOrders || 0} Pending • {metrics?.confirmedOrders || 0} Confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Service Bookings
            </span>
            <Calendar className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.totalBookings || 0}
          </div>
          <div className="text-[11px] text-orange-600 font-semibold mt-1">
            {metrics?.pendingBookings || 0} Pending • {metrics?.confirmedBookings || 0} Confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Completed Builds
            </span>
            <Hammer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.completedOrders || 0}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {metrics?.ongoingJobs || 0} In Progress • {metrics?.readyForDeliveryJobs || 0} Ready
          </div>
        </div>
      </div>

      {/* Analytics Visualizer: Order Status Distribution & Service Category Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900">Order Status Distribution</h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Total: {metrics?.totalEnquiries || 0}
            </span>
          </div>

          {(metrics?.totalEnquiries || 0) === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No orders or enquiries recorded yet. Status distribution will populate automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'New Enquiries', key: 'NEW', color: 'bg-blue-500' },
                { label: 'Under Review', key: 'IN_REVIEW', color: 'bg-amber-500' },
                { label: 'Quoted', key: 'QUOTED', color: 'bg-purple-500' },
                { label: 'Converted to Job', key: 'CONVERTED', color: 'bg-emerald-500' },
                { label: 'Rejected', key: 'REJECTED', color: 'bg-slate-400' },
              ].map((st) => {
                const count = metrics?.orderStatusDistribution?.[st.key] || 0;
                const percentage =
                  metrics?.totalEnquiries && metrics.totalEnquiries > 0
                    ? Math.round((count / metrics.totalEnquiries) * 100)
                    : 0;
                return (
                  <div key={st.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{st.label}</span>
                      <span className="text-slate-900 font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${st.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Service Category Trends */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900">Service Category Trends</h3>
            </div>
            <span className="text-[11px] text-slate-400">From customer requests</span>
          </div>

          {metrics?.serviceCategoryTrends && Object.keys(metrics.serviceCategoryTrends).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(metrics.serviceCategoryTrends)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([serviceName, count]) => {
                  const maxCount = Math.max(...Object.values(metrics.serviceCategoryTrends || { a: 1 }));
                  const percentage = Math.round((count / maxCount) * 100);
                  return (
                    <div key={serviceName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{serviceName}</span>
                        <span className="font-mono text-orange-600">{count} requests</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-orange-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No service trends yet. Trends update dynamically when customer orders specify required services.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables Data Feed */}
      <div className="space-y-6">
        {/* Enquiries Report */}
        {reportData?.enquiries && reportData.enquiries.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>Customer Enquiries ({reportData.enquiries.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Ref No</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Vehicle</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.enquiries.map((e: any) => (
                    <tr key={e.id}>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600">{e.enquiryNumber}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{e.customerName}</td>
                      <td className="px-4 py-2.5 text-slate-700">{e.vehicleMakeModel}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{e.status}</td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Report */}
        {reportData?.jobs && reportData.jobs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>Workshop Jobs Progress ({reportData.jobs.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Job No</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Vehicle Details</th>
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.jobs.map((j: any) => (
                    <tr key={j.id}>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600">{j.jobNumber}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{j.customer?.name}</td>
                      <td className="px-4 py-2.5 text-slate-700">{j.vehicleDetails}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{j.currentStage.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-700">{j.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminReports;
