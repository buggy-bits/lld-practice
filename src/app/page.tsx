'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/Badge';
import { ArrowRight, CheckCircle, FileText, Sparkles, Award } from 'lucide-react';

interface ProblemItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: string[];
  totalAttempts: number;
  bestScore: number | null;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/problems')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblems(data.problems);
        } else {
          setError(data.error || 'Failed to load problems');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-8 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1 rounded-full text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive LLD Practice & Feedback</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Master Low-Level Object-Oriented Design
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Select a design problem, detail your assumptions, classes, responsibilities, and trade-offs, and receive structured, explainable feedback on your design quality.
          </p>
        </div>
      </div>

      {/* Problems Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Practice Problems</h2>
        <p className="text-slate-600 text-sm mt-1">Choose a problem to begin an interactive design attempt.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.bestScore !== null && (
                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Award className="w-3.5 h-3.5 mr-0.5 text-emerald-600" /> Best: {problem.bestScore.toFixed(1)}/10
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{problem.title}</h3>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-3">{problem.description}</p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {problem.requirements.length} Requirements
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {problem.totalAttempts} Attempts
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/problems/${problem.slug}/practice`}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
