import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  SkipForward,
  Calendar,
  User,
  Truck,
  FileCheck,
  Paintbrush,
  Sparkles,
  Receipt,
  FileText,
} from 'lucide-react';
import { WorkshopStage, JobStageHistory } from '../types';

interface StageMeta {
  stage: WorkshopStage;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STAGES_CONFIG: StageMeta[] = [
  {
    stage: 'ENQUIRY_RECEIVED',
    title: 'Enquiry Received',
    description: 'Vehicle specifications, category, and requirements registered.',
    icon: FileText,
  },
  {
    stage: 'QUOTATION_APPROVED',
    title: 'Quotation Approved',
    description: 'Cost breakdown agreed, advance recorded, and job activated.',
    icon: FileCheck,
  },
  {
    stage: 'BODY_BUILDING_REPAIR',
    title: 'Body Building / Repair',
    description: 'Chassis framing, channel welding, sheet metal fabrication & lining.',
    icon: Truck,
  },
  {
    stage: 'PAINTING_FINISHING',
    title: 'Painting & Finishing',
    description: 'Anti-corrosion primer, polyurethane topcoat, artist lettering & sticker fixing.',
    icon: Paintbrush,
  },
  {
    stage: 'QUALITY_CHECK',
    title: 'Quality Check',
    description: 'Weld inspection, air brake tests, lighting check & road-worthiness audit.',
    icon: Sparkles,
  },
  {
    stage: 'BILLING_DELIVERY',
    title: 'Billing & Vehicle Delivery',
    description: 'Final invoice settlement, RTO sticker clearance, and vehicle handover.',
    icon: Receipt,
  },
];

interface TimelineViewProps {
  currentStage: WorkshopStage;
  stageHistory?: JobStageHistory[];
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  isDelivered?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  currentStage,
  stageHistory = [],
  expectedDeliveryDate,
  actualDeliveryDate,
  isDelivered = false,
}) => {
  const currentStageIndex = STAGES_CONFIG.findIndex((s) => s.stage === currentStage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Vehicle Work Progress &amp; Stage Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage tracking maintained by RJ BODY BUILDING workshop supervisors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {expectedDeliveryDate && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-950">
              <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Expected Delivery: <strong className="font-bold">{new Date(expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
              </span>
            </div>
          )}

          {actualDeliveryDate && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium text-green-950">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                Delivered on: <strong className="font-bold">{new Date(actualDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline Steps */}
      <div className="py-8">
        <div className="relative">
          {/* Desktop progress bar track */}
          <div className="hidden lg:block absolute top-6 left-12 right-12 h-1 bg-slate-200 -z-0">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{
                width: isDelivered
                  ? '100%'
                  : `${Math.max(0, (currentStageIndex / (STAGES_CONFIG.length - 1)) * 100)}%`,
              }}
            ></div>
          </div>

          {/* Stages list */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 relative z-10">
            {STAGES_CONFIG.map((step, idx) => {
              const Icon = step.icon;
              const isPast = isDelivered || idx < currentStageIndex;
              const isCurrent = !isDelivered && idx === currentStageIndex;
              const isUpcoming = !isDelivered && idx > currentStageIndex;

              // Find matching history entry
              const historyItem = stageHistory.find((h) => h.stage === step.stage);
              const wasSkipped = historyItem?.skipped;

              return (
                <div key={step.stage} className="flex flex-col items-center text-center group">
                  {/* Circle indicator */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                      wasSkipped
                        ? 'bg-slate-200 text-slate-500 border-2 border-dashed border-slate-400'
                        : isPast
                        ? 'bg-green-600 text-white ring-4 ring-green-100'
                        : isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-200 animate-pulse'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {wasSkipped ? (
                      <SkipForward className="w-5 h-5" />
                    ) : isPast ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Stage Title */}
                  <div className="mt-3">
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 ${
                        wasSkipped
                          ? 'bg-slate-100 text-slate-600'
                          : isPast
                          ? 'bg-green-100 text-green-800'
                          : isCurrent
                          ? 'bg-orange-100 text-orange-900 font-extrabold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {wasSkipped ? 'Skipped' : isPast ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed hidden sm:block">
                      {step.description}
                    </p>
                  </div>

                  {/* Stage History Note if present */}
                  {historyItem && (
                    <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 w-full text-left">
                      {historyItem.notes && (
                        <div className="font-medium text-slate-800 italic">"{historyItem.notes}"</div>
                      )}
                      {historyItem.skipReason && (
                        <div className="text-amber-800 font-medium">Skip Reason: {historyItem.skipReason}</div>
                      )}
                      <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{new Date(historyItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        {historyItem.updater && <span>by {historyItem.updater.name.split(' ')[0]}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage History Log */}
      {stageHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Milestone History Audit Log ({stageHistory.length} Recorded Updates)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {stageHistory.map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
              >
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {h.stage.replace(/_/g, ' ')}
                    </span>
                    {h.skipped && (
                      <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                        SKIPPED: {h.skipReason}
                      </span>
                    )}
                    {h.notes && <div className="text-slate-600 mt-0.5">{h.notes}</div>}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 text-right">
                  <div>{new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  {h.updater && <div className="text-[10px] text-slate-400 font-medium">{h.updater.name}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
