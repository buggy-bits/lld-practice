import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { FeedbackSeverity } from '@/domain/evaluation/Evaluator';

interface FeedbackCardProps {
  category: string;
  severity: FeedbackSeverity;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence?: string;
}

export function FeedbackCard({
  category,
  severity,
  evidence,
  concern,
  suggestion,
  confidence,
}: FeedbackCardProps) {
  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
  let severityLabel = 'Good Design Decision';
  let borderStyle = 'border-l-4 border-l-emerald-500 bg-white';

  if (severity === 'suggestion') {
    badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
    icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
    severityLabel = 'Suggestion for Improvement';
    borderStyle = 'border-l-4 border-l-amber-500 bg-white';
  } else if (severity === 'concern') {
    badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
    icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
    severityLabel = 'Potential Design Concern';
    borderStyle = 'border-l-4 border-l-rose-500 bg-white';
  }

  return (
    <div className={`p-5 rounded-xl border border-slate-200 shadow-sm ${borderStyle}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-semibold text-slate-900">{category}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${badgeStyle}`}>
            {severityLabel}
          </span>
        </div>
        {confidence && (
          <span className="text-xs text-slate-400 font-medium">Confidence: {confidence}</span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {evidence && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700">
            <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">
              1. Observed Evidence:
            </span>
            <p className="italic text-slate-800">"{evidence}"</p>
          </div>
        )}

        {concern && (
          <div className="text-slate-700">
            <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">
              2. Why it matters / Concern:
            </span>
            <p>{concern}</p>
          </div>
        )}

        {suggestion && (
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-sky-950">
            <span className="font-semibold text-sky-900 flex items-center text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-600" /> 3. Consider Changing:
            </span>
            <p className="font-medium text-sky-900">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
