import React, { useEffect, useState } from 'react';
import { Clock, Truck, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';
import { TimelineView } from '../../components/TimelineView';
import { StatusBadge } from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export const CustomerTimeline: React.FC = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerJobs() {
      try {
        const res = await api.jobs.list();
        setJobs(res.jobs);
        if (res.jobs.length > 0) {
          // fetch deep details with stageHistory for the first job
          const deep = await api.jobs.get(res.jobs[0].id);
          setSelectedJob(deep.job);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load vehicle jobs.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerJobs();
  }, []);

  const handleSelectJob = async (jobId: string) => {
    try {
      const res = await api.jobs.get(jobId);
      setSelectedJob(res.job);
    } catch (err: any) {
      showToast(err.message || 'Failed to load timeline details.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          Module 08
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Vehicle Work Progress &amp; Timeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time tracking of fabrication, painting, inspections, and vehicle delivery.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your vehicle timeline...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No active workshop jobs registered for your account yet. Once an approved quotation is activated by our team, your live vehicle timeline will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Vehicle Selector if multiple */}
          {jobs.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Your Vehicles:</span>
              {jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSelectJob(j.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedJob?.id === j.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {j.jobNumber} — {j.vehicleDetails}
                </button>
              ))}
            </div>
          )}

          {/* Active Timeline Display */}
          {selectedJob && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-600">{selectedJob.jobNumber}</span>
                    <StatusBadge status={selectedJob.currentStage} />
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {selectedJob.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedJob.vehicleDetails}</h2>
                </div>

                <div className="text-xs text-slate-500 sm:text-right space-y-0.5">
                  <div>
                    Workshop Location: <strong className="text-slate-800">Vasthanagar, Madurai</strong>
                  </div>
                  <div>
                    Quote Reference: <strong className="text-slate-800">{selectedJob.quotation?.quoteNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Interactive Timeline View */}
              <TimelineView
                currentStage={selectedJob.currentStage}
                stageHistory={selectedJob.stageHistory}
                expectedDeliveryDate={selectedJob.expectedDeliveryDate}
                actualDeliveryDate={selectedJob.actualDeliveryDate}
                isDelivered={selectedJob.status === 'DELIVERED'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
