import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  // Green variants
  if (['COMPLETED', 'PAID', 'APPROVED', 'ACTIVE', 'DELIVERED', 'CONVERTED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  // Orange / Amber variants
  else if (['IN_PROGRESS', 'IN_REVIEW', 'CURRENT', 'PARTIALLY_PAID', 'QUOTED', 'SENT'].includes(normalized)) {
    styles = 'bg-orange-50 text-orange-900 border-orange-200 font-bold';
  }
  // Blue variants
  else if (['NEW', 'PENDING', 'DRAFT'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-800 border-blue-200';
  }
  // Red / Gray variants
  else if (['REJECTED', 'CANCELLED', 'EXPIRED', 'INACTIVE'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
  }
  // Yellow / warning
  else if (['ON_HOLD', 'SKIPPED'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-900 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};
