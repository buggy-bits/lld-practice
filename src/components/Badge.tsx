import React from 'react';

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (difficulty === 'Easy') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (difficulty === 'Medium') color = 'bg-amber-50 text-amber-700 border-amber-200';
  if (difficulty === 'Hard') color = 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {difficulty}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'DRAFT') color = 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'SUBMITTED') color = 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'EVALUATING') color = 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
  if (status === 'COMPLETED') color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'FAILED') color = 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {status}
    </span>
  );
}
