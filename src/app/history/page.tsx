'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge, DifficultyBadge } from '@/components/Badge';
import { History, ArrowRight, Award, RotateCcw, Calendar, CheckCircle2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attempts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.error || 'Failed to load history');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group attempts by problemId
  const grouped = history.reduce((acc: Record<string, any[]>, attempt) => {
    const key = attempt.problemId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(attempt);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center">
            <History className="w-6 h-6 text-sky-600 mr-2" />
            Attempt History & Score Progression
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review past design attempts, track score improvements across iterations, and retry problems.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center font-medium">
          {error}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-4 max-w-md mx-auto">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">No attempts found yet</h3>
          <p className="text-slate-500 text-sm">Select a problem from the catalog to make your first design submission.</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <span>Browse Problems</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([problemId, attempts]) => {
            const first = attempts[0];
            const sortedAttempts = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);

            return (
              <div key={problemId} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold text-slate-900">{first.problemTitle}</h2>
                      <DifficultyBadge difficulty={first.difficulty} />
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">Total Attempts: {attempts.length}</p>
                  </div>

                  <Link
                    href={`/problems/${first.problemSlug}/practice`}
                    className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice Again</span>
                  </Link>
                </div>

                {/* Score progression visual pills */}
                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 overflow-x-auto">
                  <span className="text-xs font-semibold text-slate-500 mr-2 flex-shrink-0">Score Progression:</span>
                  {sortedAttempts.map((a, idx) => (
                    <div key={a.id} className="flex items-center space-x-2 flex-shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          a.score !== null
                            ? a.score >= 8
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : a.score >= 6
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        Attempt #{a.attemptNumber}: {a.score !== null ? `${a.score.toFixed(1)}/10` : a.status}
                      </span>
                      {idx < sortedAttempts.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>

                {/* List of attempts */}
                <div className="divide-y divide-slate-100">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-2 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={attempt.status} />
                        <div>
                          <span className="text-sm font-semibold text-slate-900">
                            Attempt #{attempt.attemptNumber}
                          </span>
                          <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(attempt.createdAt).toLocaleDateString()} at{' '}
                              {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {attempt.score !== null && (
                          <span className="font-extrabold text-slate-900 text-sm flex items-center">
                            <Award className="w-4 h-4 text-amber-500 mr-1" />
                            {attempt.score.toFixed(1)} <span className="text-xs text-slate-400 font-normal ml-0.5">/10</span>
                          </span>
                        )}
                        <Link
                          href={`/attempts/${attempt.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline"
                        >
                          <span>View Evaluation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
