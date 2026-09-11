import React from 'react';

interface ScoreBarProps {
  label: string;
  score: number; // 0 - 10
  evidence?: string;
  suggestion?: string;
}

export function ScoreBar({ label, score, evidence, suggestion }: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (score / 10) * 100));

  let barColor = 'bg-emerald-500';
  if (score < 6) barColor = 'bg-rose-500';
  else if (score < 8) barColor = 'bg-amber-500';

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-semibold text-slate-800 text-sm">{label}</span>
        <span className="font-bold text-slate-900 text-sm">{score.toFixed(1)} <span className="text-slate-400 font-normal text-xs">/ 10</span></span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {evidence && (
        <p className="text-xs text-slate-600 mt-1 italic">
          <strong className="font-medium text-slate-700 not-italic">Observation:</strong> {evidence}
        </p>
      )}
      {suggestion && (
        <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded px-2 py-1 mt-1.5">
          <strong className="font-semibold">Suggestion:</strong> {suggestion}
        </p>
      )}
    </div>
  );
}
