import React from 'react';

export default function PriorityBadge({ priority }) {
  if (priority === 'High Priority') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        High Priority
      </span>
    );
  }
  if (priority === 'Medium Priority') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
        Medium Priority
      </span>
    );
  }
  if (priority === 'Low Priority') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-sky-500"></span>
        Low Priority
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
      Target Met
    </span>
  );
}
