import React from 'react';
import { formatDistanceToNow } from 'date-fns';

// A beautiful, insightful horizontal progress line for report status
// Supported statuses: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected'
// Usage: <ReportStatusProgress status={report.status} createdAt={report.createdAt} resolvedAt={report.resolvedAt} />
const ReportStatusProgress = ({ status, createdAt, resolvedAt }) => {
  const steps = [
    { id: 'new', label: 'Submitted', icon: '📝' },
    { id: 'acknowledged', label: 'Acknowledged', icon: '👀' },
    { id: 'in_progress', label: 'In Progress', icon: '🔧' },
    { id: 'resolved', label: 'Resolved', icon: '✅' },
  ];

  // Special case: rejected
  const isRejected = status === 'rejected';
  const currentIndex = isRejected
    ? 1 // visually stop after Acknowledged
    : Math.max(0, steps.findIndex((s) => s.id === status));

  const getStepState = (idx) => {
    if (isRejected) {
      if (idx < 2) return 'done';
      if (idx === 2) return 'rejected';
      return 'upcoming';
    }
    if (idx < currentIndex) return 'done';
    if (idx === currentIndex) return 'current';
    return 'upcoming';
  };

  const distance = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200" />

        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const isDone = state === 'done';
          const isCurrent = state === 'current';
          const isUpcoming = state === 'upcoming';
          const isStepRejected = state === 'rejected';

          const circleBase = 'z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white shadow-sm';
          const circle = isDone
            ? `${circleBase} border-emerald-500 text-emerald-600`
            : isCurrent
            ? `${circleBase} border-indigo-500 text-indigo-600 animate-pulse`
            : isStepRejected
            ? `${circleBase} border-red-500 text-red-600`
            : `${circleBase} border-slate-300 text-slate-400`;

          const labelBase = 'mt-2 text-xs font-medium text-center whitespace-nowrap';
          const label = isDone
            ? `${labelBase} text-emerald-700`
            : isCurrent
            ? `${labelBase} text-indigo-700`
            : isStepRejected
            ? `${labelBase} text-red-700`
            : `${labelBase} text-slate-500`;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Active progress fill behind circles */}
              {idx > 0 && (
                <div
                  className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 ${
                    isRejected
                      ? 'bg-gradient-to-r from-emerald-400 via-red-400 to-slate-200'
                      : idx <= currentIndex
                      ? 'bg-gradient-to-r from-emerald-400 to-indigo-400'
                      : 'bg-transparent'
                  }`}
                  style={{
                    // Split the line into equal segments between steps
                    clipPath: `inset(0 ${((steps.length - 1 - idx) / (steps.length - 1)) * 100}% 0 ${((idx - 1) / (steps.length - 1)) * 100}%)`,
                  }}
                />
              )}

              <div className={circle}>
                <span className="text-base" aria-hidden>
                  {isStepRejected ? '⛔' : step.icon}
                </span>
              </div>
              <div className={label}>{step.label}</div>
              {/* Insightful subtext with relative time */}
              <div className="text-[11px] text-slate-400 mt-1 h-4">
                {step.id === 'new' && createdAt && (
                  <span>Created {distance(createdAt)}</span>
                )}
                {step.id === 'resolved' && resolvedAt && (
                  <span>Resolved {distance(resolvedAt)}</span>
                )}
                {isRejected && idx === 2 && (
                  <span>Rejected</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight strip under the line */}
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Status: {isRejected ? 'Rejected' : status.replace('_', ' ')}</span>
        {createdAt && !resolvedAt && (
          <span className="text-slate-500">Open for {distance(createdAt)}</span>
        )}
        {createdAt && resolvedAt && (
          <span className="text-slate-500">
            Resolved in {
              (() => {
                try {
                  const ms = new Date(resolvedAt) - new Date(createdAt);
                  const hours = Math.max(1, Math.round(ms / (1000 * 60 * 60)));
                  return `${hours}h`;
                } catch {
                  return '—';
                }
              })()
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default ReportStatusProgress;
